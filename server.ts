import express from "express";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  console.log("Starting server initialization...");

  // --- Firebase Initialization State ---
  let db: any = null;
  let auth: any = null;
  let firebaseInitialized = false;

  // Load project ID and Database ID from applet config
  let projectId = "";
  let databaseId = "";
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      projectId = config.projectId;
      databaseId = config.firestoreDatabaseId || "";
      console.log(`Detected Config: Project=${projectId}, DB=${databaseId}`);
    }
  } catch (err) {
    console.warn("Could not read firebase-applet-config.json, continuing with defaults.");
  }

  // --- API Routes (MUST BE BEFORE VITE/STATIC) ---

  // Basic health check for container readiness
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      firebase: firebaseInitialized ? "connected" : "failed",
      projectId: projectId || "unknown",
      databaseId: databaseId || "default",
      time: new Date().toISOString()
    });
  });

  const initializeFirebase = () => {
    try {
      if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          let saString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
          console.log("Attempting to parse FIREBASE_SERVICE_ACCOUNT...");
          
          let serviceAccount: any = null;
          
          // Heuristic attempt to find valid JSON block
          const jsonMatch = saString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const candidate = jsonMatch[0];
            try {
              serviceAccount = JSON.parse(candidate);
            } catch (e) {
              // If top-level parse fails, check if it's double-wrapped like {{ ... }}
              const innerMatch = candidate.slice(1, -1).match(/\{[\s\S]*\}/);
              if (innerMatch) {
                try {
                  serviceAccount = JSON.parse(innerMatch[0]);
                  console.log("Successfully extracted inner JSON from double-wrapped Service Account string.");
                } catch (e2) {
                  throw new Error(`Failed to parse Service Account JSON: ${e2 instanceof Error ? e2.message : String(e2)}`);
                }
              } else {
                throw new Error(`Failed to parse Service Account JSON: ${e instanceof Error ? e.message : String(e)}`);
              }
            }
          }

          if (serviceAccount && serviceAccount.project_id) {
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount),
              projectId: projectId || serviceAccount.project_id
            });
            console.log("Firebase Admin initialized via Service Account for project:", serviceAccount.project_id);
          } else if (saString.includes("BEGIN PRIVATE KEY")) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT appears to be a raw private key string instead of a full JSON object.");
          } else {
            throw new Error("Could not find valid Service Account JSON in FIREBASE_SERVICE_ACCOUNT.");
          }
        } else {
          admin.initializeApp({
            projectId: projectId || "gen-lang-client-0079941199"
          });
          console.log(`Firebase Admin initialized with Project ID: ${projectId || "gen-lang-client-0079941199"}`);
        }
      }
      
      const adminApp = admin.app();
      db = getFirestore(adminApp, databaseId || undefined);
      auth = adminApp.auth();
      firebaseInitialized = true;
      console.log("Firestore and Auth providers established.");
    } catch (error) {
      console.error("Firebase Admin initialization FAILED:", error);
    }
  };

  // Run initialization
  initializeFirebase();

  // Middleware to verify Firebase ID Token
  const verifyToken = async (req: any, res: any, next: any) => {
    if (!firebaseInitialized || !auth) {
      return res.status(503).json({ 
        error: "Service Unavailable: Firebase admin SDK not properly initialized.",
        details: "Check FIREBASE_SERVICE_ACCOUNT or firebase-applet-config.json"
      });
    }
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing Bearer token" });
      }

      const token = authHeader.split("Bearer ")[1];
      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({ error: "Unauthorized: Token was null or undefined" });
      }

      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ 
        error: "Invalid token", 
        message: (error as Error).message,
        code: (error as any).code
      });
    }
  };

  // Helper to check if caller has a role
  const hasRole = (user: any, roles: string[]) => {
    return roles.includes(user.role);
  };

  // User Self-Management & Profile Sync
  app.post("/api/auth/sync-profile", verifyToken, async (req: any, res: any) => {
    const { uid, email, displayName } = req.user;
    
    try {
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        // SECURE BOOTSTRAPPING: 
        // Check if any users exist. If this is the VERY FIRST user, they become super_admin.
        const usersSnapshot = await db.collection("users").limit(1).get();
        const isFirstUser = usersSnapshot.empty;
        const role = isFirstUser ? 'super_admin' : 'user';

        if (isFirstUser) {
          console.log(`Bootstrapping Super Admin: ${email}`);
          await auth.setCustomUserClaims(uid, { role });
          
          await db.collection("auditLogs").add({
            action: "SYSTEM_BOOTSTRAP",
            targetUid: uid,
            newRole: role,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: "Initial system deployment super admin assignment"
          });
        }

        const userData = {
          id: uid,
          name: displayName || 'New User',
          email: email,
          role: role,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await userRef.set(userData);
        
        return res.json({ role, status: 'created' });
      }

      // Check if claims match Firestore (Sync check)
      const currentRole = userDoc.data()?.role || 'user';
      if (req.user.role !== currentRole) {
          // If claims are out of sync with Firestore, update claims
          console.log(`Syncing claims for ${email}: ${currentRole}`);
          await auth.setCustomUserClaims(uid, { role: currentRole });
          return res.json({ role: currentRole, status: 'synced', refreshRequired: true });
      }

      res.json({ role: currentRole, status: 'exists' });
    } catch (error) {
      console.error("Profile sync error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Assign Role Endpoint
  app.post("/api/admin/assign-role", verifyToken, async (req: any, res: any) => {
    const { targetUid, role } = req.body;
    const callerClaims = req.user;

    const validRoles = ["super_admin", "admin", "editor", "volunteer_manager", "donor_manager", "user"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Role Hierarchy & Permissions
    const isSuperAdmin = callerClaims.role === "super_admin";
    const isAdmin = callerClaims.role === "admin";
    
    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    // Super Admin can assign anything. Admin can assign up to editor/manager.
    const protectedRoles = ["super_admin", "admin"];
    if (isAdmin && !isSuperAdmin && protectedRoles.includes(role)) {
        return res.status(403).json({ error: "Forbidden: Cannot elevate to higher administrative roles" });
    }

    try {
      // 1. Set Custom Claims in Auth (Atomic Identity)
      await auth.setCustomUserClaims(targetUid, { role });
      
      // 2. Sync to Firestore (Tactical Reference)
      await db.collection("users").doc(targetUid).update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 3. Log Audit Trail (Security Compliance)
      await db.collection("auditLogs").add({
        action: "ROLE_CHANGE",
        targetUid,
        newRole: role,
        changedBy: callerClaims.uid,
        changedByEmail: callerClaims.email,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true, role });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Role History for Audit
  app.get("/api/admin/audit-logs", verifyToken, async (req: any, res: any) => {
    if (!hasRole(req.user, ["super_admin", "admin"])) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const logs = await db.collection("auditLogs")
        .orderBy("timestamp", "desc")
        .limit(100)
        .get();
      
      res.json(logs.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // API 404 Handler - MUST BE BEFORE VITE/STATIC
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
