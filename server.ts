import express from "express";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Security & Middleware Imports
import {
  apiRateLimiter,
  strictRateLimiter,
  paymentRateLimiter,
  helmetMiddleware,
  corsMiddleware,
  sanitizeRequest,
  validateContentType,
  securityHeaders,
} from "@/src/middleware/security.js";
import {
  globalErrorHandler,
  notFoundHandler,
  initializeErrorHandlers,
  asyncHandler,
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ServiceUnavailableError,
  NotFoundError,
} from "@/src/middleware/errorHandler.js";
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  paginationSchema,
  idParamSchema,
  upload,
} from "@/src/middleware/validation.js";
import { logger, logStartup, logFirebaseStatus, loggerStream } from "@/src/lib/logger.js";
import { env, features } from "@/src/lib/env.js";

// Validation Schemas
import { z } from 'zod';
import {
  createDonationSchema,
  createVolunteerSchema,
  updateVolunteerStatusSchema,
  createContactMessageSchema,
  createBlogPostSchema,
  updateBlogPostSchema,
  createProgramSchema,
  createEventSchema,
  createSponsorSchema,
  createGallerySchema,
  assignRoleSchema,
} from "@/src/lib/validation.js";

// Services
import { yocoService } from "@/src/services/yocoService.js";
import { payfastService } from "@/src/services/payfastService.js";
import { emailService } from "@/src/services/emailService.js";
import { storageService } from "@/src/services/storageService.js";

// Morgan for HTTP request logging
import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize global error handlers
initializeErrorHandlers();

async function startServer() {
  const app = express();

  // ==========================================================================
  // 1. SECURITY MIDDLEWARE (Applied first)
  // ==========================================================================
  
  app.set('trust proxy', 1);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(securityHeaders);
  app.use(morgan('combined', { stream: loggerStream }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(validateContentType);
  app.use(sanitizeRequest);
  app.use(apiRateLimiter);

  logStartup(env.PORT);

  // ==========================================================================
  // 2. FIREBASE INITIALIZATION
  // ==========================================================================
  
  let db: any = null;
  let auth: any = null;
  let firebaseInitialized = false;

  let projectId = "";
  let databaseId = "";
  
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      projectId = config.projectId;
      databaseId = config.firestoreDatabaseId || "";
      logger.info(`Firebase config loaded: Project=${projectId}, DB=${databaseId}`);
    }
  } catch (err) {
    logger.warn("Could not read firebase-applet-config.json, continuing with defaults.");
  }

  const initializeFirebase = () => {
    try {
      if (admin.apps.length === 0) {
        if (env.FIREBASE_SERVICE_ACCOUNT) {
          let saString = env.FIREBASE_SERVICE_ACCOUNT.trim();
          logger.debug("Attempting to parse FIREBASE_SERVICE_ACCOUNT...");
          
          let serviceAccount: any = null;
          
          const jsonMatch = saString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const candidate = jsonMatch[0];
            try {
              serviceAccount = JSON.parse(candidate);
            } catch (e) {
              const innerMatch = candidate.slice(1, -1).match(/\{[\s\S]*\}/);
              if (innerMatch) {
                try {
                  serviceAccount = JSON.parse(innerMatch[0]);
                  logger.debug("Extracted inner JSON from double-wrapped Service Account string.");
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
            logger.info("Firebase Admin initialized via Service Account", { projectId: serviceAccount.project_id });
          } else if (saString.includes("BEGIN PRIVATE KEY")) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT appears to be a raw private key string instead of a full JSON object.");
          } else {
            throw new Error("Could not find valid Service Account JSON in FIREBASE_SERVICE_ACCOUNT.");
          }
        } else {
          admin.initializeApp({
            projectId: projectId || env.VITE_FIREBASE_PROJECT_ID
          });
          logger.info(`Firebase Admin initialized with default credentials`, { projectId: projectId || env.VITE_FIREBASE_PROJECT_ID });
        }
      }
      
      const adminApp = admin.app();
      db = getFirestore(adminApp, databaseId || undefined);
      auth = adminApp.auth();
      firebaseInitialized = true;
      
      logFirebaseStatus(true, projectId || env.VITE_FIREBASE_PROJECT_ID);
    } catch (error) {
      logFirebaseStatus(false);
      logger.error("Firebase Admin initialization FAILED:", { error: (error as Error).message });
    }
  };

  initializeFirebase();

  // ==========================================================================
  // 3. AUTHENTICATION MIDDLEWARE
  // ==========================================================================
  
  const verifyToken = asyncHandler(async (req: any, res: any, next: any) => {
    if (!firebaseInitialized || !auth) {
      throw new ServiceUnavailableError("Firebase admin SDK not properly initialized. Check FIREBASE_SERVICE_ACCOUNT or firebase-applet-config.json");
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing Bearer token");
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token || token === "null" || token === "undefined") {
      throw new UnauthorizedError("Token was null or undefined");
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  });

  const hasRole = (user: any, roles: string[]) => {
    return roles.includes(user.role);
  };

  // ==========================================================================
  // 4. API ROUTES
  // ==========================================================================

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      firebase: firebaseInitialized ? "connected" : "failed",
      projectId: projectId || env.VITE_FIREBASE_PROJECT_ID,
      databaseId: databaseId || "default",
      environment: env.NODE_ENV,
      features: features.all(),
      time: new Date().toISOString()
    });
  });

  // Features status
  app.get("/api/features", (req, res) => {
    res.json({
      payments: features.isEnabled('ENABLE_PAYMENTS'),
      emails: features.isEnabled('ENABLE_EMAILS'),
      analytics: features.isEnabled('ENABLE_ANALYTICS'),
      yocoConfigured: yocoService.isConfigured(),
      payfastConfigured: payfastService.isConfigured(),
      emailConfigured: emailService.isConfigured(),
    });
  });

  // ==========================================================================
  // AUTH ROUTES
  // ==========================================================================

  app.post("/api/auth/sync-profile", strictRateLimiter, verifyToken, asyncHandler(async (req: any, res: any) => {
    const { uid, email, displayName } = req.user;
    
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      const usersSnapshot = await db.collection("users").limit(1).get();
      const isFirstUser = usersSnapshot.empty;
      const role = isFirstUser ? 'super_admin' : 'user';

      if (isFirstUser) {
        logger.info(`Bootstrapping Super Admin: ${email}`);
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

    const currentRole = userDoc.data()?.role || 'user';
    if (req.user.role !== currentRole) {
      logger.info(`Syncing claims for ${email}: ${currentRole}`);
      await auth.setCustomUserClaims(uid, { role: currentRole });
      return res.json({ role: currentRole, status: 'synced', refreshRequired: true });
    }

    res.json({ role: currentRole, status: 'exists' });
  }));

  // ==========================================================================
  // DONATION ROUTES
  // ==========================================================================

  // Create checkout session (Yoco)
  app.post("/api/donations/checkout/yoco", paymentRateLimiter, validateBody(createDonationSchema), asyncHandler(async (req: any, res: any) => {
    const donationData = req.body;
    const session = await yocoService.createCheckoutSession(donationData);
    
    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  }));

  // Get PayFast form data
  app.post("/api/donations/checkout/payfast", paymentRateLimiter, validateBody(createDonationSchema), asyncHandler(async (req: any, res: any) => {
    const donationData = req.body;
    const formData = payfastService.createPaymentFormData(donationData);
    
    res.json({
      success: true,
      formData,
      paymentUrl: payfastService.getPaymentUrl(),
    });
  }));

  // Get checkout session status (Yoco)
  app.get("/api/donations/session/:sessionId", validateParams(idParamSchema), asyncHandler(async (req: any, res: any) => {
    const { sessionId } = req.params;
    const session = await yocoService.getCheckoutSession(sessionId);
    res.json(session);
  }));

  // Record completed donation
  app.post("/api/donations/complete", validateBody(createDonationSchema.extend({
    transactionReference: z.string().min(1),
    paymentMethod: z.enum(['yoco', 'payfast', 'eft', 'other']),
  })), asyncHandler(async (req: any, res: any) => {
    const donationData = req.body;
    
    // Save to Firestore
    const donationRef = await db.collection("donations").add({
      ...donationData,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send emails
    try {
      await emailService.sendDonationReceipt({
        donorName: donationData.donorName,
        donorEmail: donationData.donorEmail,
        amount: donationData.amount,
        donationType: donationData.donationType,
        transactionReference: donationData.transactionReference,
        isAnonymous: donationData.isAnonymous,
        message: donationData.message,
      });
      
      await emailService.sendDonationNotification({
        donorName: donationData.donorName,
        donorEmail: donationData.donorEmail,
        amount: donationData.amount,
        donationType: donationData.donationType,
        transactionReference: donationData.transactionReference,
        isAnonymous: donationData.isAnonymous,
        message: donationData.message,
      });
    } catch (emailError) {
      logger.error('Failed to send donation emails', { error: (emailError as Error).message });
    }

    res.json({ success: true, donationId: donationRef.id });
  }));

  // ==========================================================================
  // WEBHOOK ROUTES
  // ==========================================================================

  // Yoco webhook
  app.post("/api/webhooks/yoco", express.raw({ type: 'application/json' }), asyncHandler(async (req: any, res: any) => {
    const signature = req.headers['x-yoco-signature'] as string;
    const payload = req.body;
    
    // Verify signature
    if (!yocoService.verifyWebhookSignature(payload, signature, env.YOCO_WEBHOOK_SECRET || '')) {
      throw new UnauthorizedError('Invalid webhook signature');
    }
    
    const event = JSON.parse(payload);
    const result = await yocoService.processWebhook(event);
    
    if (result.success && result.donationId) {
      await db.collection("donations").doc(result.donationId).update({
        status: result.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    res.json({ received: true });
  }));

  // PayFast ITN (Instant Transaction Notification)
  app.post("/api/webhooks/payfast", express.urlencoded({ extended: true }), asyncHandler(async (req: any, res: any) => {
    // Verify PayFast IP
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!payfastService.isValidPayFastIP(clientIP || '')) {
      throw new UnauthorizedError('Invalid IP address');
    }
    
    // Verify ITN
    const isValid = await payfastService.verifyITN(req.body);
    if (!isValid) {
      throw new BadRequestError('ITN verification failed');
    }
    
    // Process ITN
    const result = await payfastService.processITN(req.body);
    
    // Update donation status
    const donationsSnapshot = await db.collection("donations")
      .where("transactionReference", "==", result.paymentId)
      .limit(1)
      .get();
    
    if (!donationsSnapshot.empty) {
      const donationDoc = donationsSnapshot.docs[0];
      await donationDoc.ref.update({
        status: result.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Send confirmation email if completed
      if (result.status === 'completed') {
        await emailService.sendDonationReceipt({
          donorName: result.metadata.donorName,
          donorEmail: req.body.email_address,
          amount: result.amount,
          donationType: result.metadata.donationType,
          transactionReference: result.paymentId,
          isAnonymous: result.metadata.isAnonymous,
          message: result.metadata.message,
        });
      }
    }
    
    // PayFast expects 'OK' response
    res.send('OK');
  }));

  // ==========================================================================
  // VOLUNTEER ROUTES
  // ==========================================================================

  // Submit volunteer application (public)
  app.post("/api/volunteers", 
    apiRateLimiter,
    upload.single('cv'),
    validateBody(createVolunteerSchema),
    asyncHandler(async (req: any, res: any) => {
      const volunteerData = req.body;
      let cvUrl = '';
      
      // Upload CV if provided
      if (req.file) {
        const uploadResult = await storageService.uploadVolunteerCV(req.file, 'new');
        cvUrl = uploadResult.url;
      }
      
      // Save to Firestore
      const volunteerRef = await db.collection("volunteers").add({
        ...volunteerData,
        cvUrl,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send confirmation emails
      try {
        await emailService.sendVolunteerConfirmation({
          fullName: volunteerData.fullName,
          email: volunteerData.email,
          status: 'pending',
        });
        
        await emailService.sendVolunteerNotification({
          fullName: volunteerData.fullName,
          email: volunteerData.email,
          skills: volunteerData.skills,
        });
      } catch (emailError) {
        logger.error('Failed to send volunteer emails', { error: (emailError as Error).message });
      }

      res.json({ success: true, volunteerId: volunteerRef.id });
    })
  );

  // Get all volunteers (admin only)
  app.get("/api/volunteers", verifyToken, asyncHandler(async (req: any, res: any) => {
    if (!hasRole(req.user, ['super_admin', 'admin', 'volunteer_manager'])) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const { status, limit = 50 } = req.query;
    
    let query: any = db.collection("volunteers").orderBy("createdAt", "desc");
    
    if (status) {
      query = query.where("status", "==", status);
    }
    
    const snapshot = await query.limit(parseInt(limit)).get();
    const volunteers = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    
    res.json(volunteers);
  }));

  // Update volunteer status (admin only)
  app.patch("/api/volunteers/:id/status", 
    verifyToken,
    validateParams(idParamSchema),
    validateBody(updateVolunteerStatusSchema),
    asyncHandler(async (req: any, res: any) => {
      if (!hasRole(req.user, ['super_admin', 'admin', 'volunteer_manager'])) {
        throw new ForbiddenError("Insufficient permissions");
      }

      const { id } = req.params;
      const { status, notes } = req.body;
      
      const volunteerRef = db.collection("volunteers").doc(id);
      const volunteerDoc = await volunteerRef.get();
      
      if (!volunteerDoc.exists) {
        throw new NotFoundError("Volunteer application not found");
      }
      
      const volunteerData = volunteerDoc.data();
      
      await volunteerRef.update({
        status,
        statusNotes: notes || '',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: req.user.uid,
      });

      // Send status update email
      try {
        await emailService.sendVolunteerStatusUpdate({
          fullName: volunteerData?.fullName,
          email: volunteerData?.email,
          status,
          notes,
        });
      } catch (emailError) {
        logger.error('Failed to send status update email', { error: (emailError as Error).message });
      }

      res.json({ success: true });
    })
  );

  // ==========================================================================
  // CONTACT ROUTES
  // ==========================================================================

  // Submit contact form (public)
  app.post("/api/contact", 
    apiRateLimiter,
    validateBody(createContactMessageSchema),
    asyncHandler(async (req: any, res: any) => {
      const messageData = req.body;
      
      // Save to Firestore
      const messageRef = await db.collection("contactMessages").add({
        ...messageData,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send emails
      try {
        await emailService.sendContactConfirmation({
          name: messageData.name,
          email: messageData.email,
          subject: messageData.subject,
          message: messageData.message,
        });
        
        await emailService.sendContactNotification({
          name: messageData.name,
          email: messageData.email,
          subject: messageData.subject,
          message: messageData.message,
        });
      } catch (emailError) {
        logger.error('Failed to send contact emails', { error: (emailError as Error).message });
      }

      res.json({ success: true, messageId: messageRef.id });
    })
  );

  // ==========================================================================
  // BLOG ROUTES
  // ==========================================================================

  // Get all blog posts (public)
  app.get("/api/blog", validateQuery(paginationSchema), asyncHandler(async (req: any, res: any) => {
    const { page, limit, status } = req.query;
    
    let query: any = db.collection("blogPosts").orderBy("createdAt", "desc");
    
    if (status) {
      query = query.where("status", "==", status);
    } else {
      // Public only sees published
      query = query.where("status", "==", "published");
    }
    
    const snapshot = await query.limit(parseInt(limit)).get();
    const posts = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    
    res.json(posts);
  }));

  // Get single blog post (public)
  app.get("/api/blog/:slug", asyncHandler(async (req: any, res: any) => {
    const { slug } = req.params;
    
    const snapshot = await db.collection("blogPosts")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      throw new NotFoundError("Blog post not found");
    }
    
    const post = snapshot.docs[0];
    
    // Increment view count
    await post.ref.update({
      viewCount: admin.firestore.FieldValue.increment(1),
    });
    
    res.json({ id: post.id, ...post.data() });
  }));

  // Create blog post (editor+)
  app.post("/api/blog", 
    verifyToken,
    validateBody(createBlogPostSchema),
    asyncHandler(async (req: any, res: any) => {
      if (!hasRole(req.user, ['super_admin', 'admin', 'editor'])) {
        throw new ForbiddenError("Insufficient permissions");
      }

      const postData = req.body;
      
      const postRef = await db.collection("blogPosts").add({
        ...postData,
        authorId: req.user.uid,
        viewCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true, postId: postRef.id });
    })
  );

  // Update blog post (editor+)
  app.patch("/api/blog/:id", 
    verifyToken,
    validateParams(idParamSchema),
    validateBody(updateBlogPostSchema),
    asyncHandler(async (req: any, res: any) => {
      if (!hasRole(req.user, ['super_admin', 'admin', 'editor'])) {
        throw new ForbiddenError("Insufficient permissions");
      }

      const { id } = req.params;
      const updateData = req.body;
      
      const postRef = db.collection("blogPosts").doc(id);
      const postDoc = await postRef.get();
      
      if (!postDoc.exists) {
        throw new NotFoundError("Blog post not found");
      }
      
      await postRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    })
  );

  // ==========================================================================
  // FILE UPLOAD ROUTES
  // ==========================================================================

  // Upload image (editor+)
  app.post("/api/upload/image",
    verifyToken,
    upload.single('image'),
    asyncHandler(async (req: any, res: any) => {
      if (!hasRole(req.user, ['super_admin', 'admin', 'editor'])) {
        throw new ForbiddenError("Insufficient permissions");
      }

      if (!req.file) {
        throw new BadRequestError("No image provided");
      }

      const { folder = 'general' } = req.body;
      const result = await storageService.uploadImage(req.file, folder, req.user.uid);
      
      res.json({ success: true, ...result });
    })
  );

  // Upload document (authenticated)
  app.post("/api/upload/document",
    verifyToken,
    upload.single('document'),
    asyncHandler(async (req: any, res: any) => {
      if (!req.file) {
        throw new BadRequestError("No document provided");
      }

      const { folder = 'documents' } = req.body;
      const result = await storageService.uploadDocument(req.file, folder, req.user.uid);
      
      res.json({ success: true, ...result });
    })
  );

  // ==========================================================================
  // ADMIN ROUTES
  // ==========================================================================

  // Assign role (admin+)
  app.post("/api/admin/assign-role", 
    strictRateLimiter, 
    verifyToken, 
    validateBody(assignRoleSchema),
    asyncHandler(async (req: any, res: any) => {
      const { targetUid, role } = req.body;
      const callerClaims = req.user;

      const isSuperAdmin = callerClaims.role === "super_admin";
      const isAdmin = callerClaims.role === "admin";
      
      if (!isSuperAdmin && !isAdmin) {
        throw new ForbiddenError("Admin access required");
      }

      const protectedRoles = ["super_admin", "admin"];
      if (isAdmin && !isSuperAdmin && protectedRoles.includes(role)) {
        throw new ForbiddenError("Cannot elevate to higher administrative roles");
      }

      await auth.setCustomUserClaims(targetUid, { role });
      
      await db.collection("users").doc(targetUid).update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("auditLogs").add({
        action: "ROLE_CHANGE",
        targetUid,
        newRole: role,
        changedBy: callerClaims.uid,
        changedByEmail: callerClaims.email,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      logger.info(`Role assigned: ${role} to ${targetUid} by ${callerClaims.email}`);
      res.json({ success: true, role });
    })
  );

  // Get audit logs (admin+)
  app.get("/api/admin/audit-logs", verifyToken, asyncHandler(async (req: any, res: any) => {
    if (!hasRole(req.user, ["super_admin", "admin"])) {
      throw new ForbiddenError("Insufficient permissions");
    }

    const logs = await db.collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();
    
    res.json(logs.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
  }));

  // ==========================================================================
  // 5. ERROR HANDLING
  // ==========================================================================

  app.use("/api/*", notFoundHandler);
  app.use(globalErrorHandler);

  // ==========================================================================
  // 6. VITE / STATIC SERVING
  // ==========================================================================

  if (env.NODE_ENV !== "production") {
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

  // Start server
  app.listen(env.PORT, "0.0.0.0", () => {
    logger.info(`✅ Server running at http://localhost:${env.PORT}`, {
      environment: env.NODE_ENV,
      port: env.PORT,
      firebaseConnected: firebaseInitialized,
      features: features.all(),
    });
  });
}

startServer();
