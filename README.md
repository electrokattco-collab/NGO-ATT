# Awaken Thrive Transform (ATT) NGO Platform

A high-resilience, enterprise-grade NGO management platform engineered for South African mental wellness cohorts.

## 🚀 Strategic Architecture

This platform follows a modular, scalable architecture designed for production-readiness.

- **Frontend:** React 19 + TailwindCSS 4 (Utility-first precise styling)
- **Engine:** Vite (Optimized build pipeline)
- **Database:** Firebase Firestore (Real-time NoSQL infrastructure)
- **Auth:** Firebase Authentication (Secure identity management)
- **Animation:** Framer Motion (Kinetic UI reveals)
- **Logic:** Service-oriented architecture with custom hooks integration

## 📂 Intelligence Structure

```
src/
├── animations/ # Strategic kinetic reveals
├── components/
│   ├── common/ # Universal tactical elements (Navbar, Footer)
│   └── ui/     # Atomic reusable primitives (Button, Input, Card)
├── constants/  # Centralized system configurations
├── context/    # Identity and session management
├── firebase/   # Core infrastructure setup
├── hooks/      # Higher-order logic (useCollection, useAuth)
├── layouts/    # Structural blueprints (Main, Admin)
├── pages/      # Mission pages & operational dashboards
├── services/   # Strategic internal services (Firebase, Payments)
├── types/      # TypeScript matrix definitions
└── utils/      # Utility interceptors (Formatting, Slugs)
```

## 🛠 Operational Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example` and fill in production credentials.
   - In production, `SESSION_SECRET` must be strong and not the default placeholder.
   - `CORS_ORIGIN` must contain only your production domain.
   - `ENABLE_PAYMENTS` should be `false` for staging and `true` for live launch.
4. **Initiate Development:**
   ```bash
   npm run dev
   ```

## 🚀 Production and Rollout Guidance

- Use separate Firebase projects for `development`, `staging`, and `production`.
- Keep `.env` local and never commit private keys or `FIREBASE_SERVICE_ACCOUNT` JSON.
- For safe rollout, start with an internal beta or canary deployment to a subset of traffic.
- Verify payment gateways in sandbox mode before switching `PAYFAST_SANDBOX_MODE=false` and enabling live Yoco keys.
- Confirm monitoring is configured via `SENTRY_DSN` or `LOG_AGGREGATOR_URL` before full launch.

## 🛡 Security Protocol

The platform implements **Zero-Trust Firestore Security Rules**.
- Identity-based access control.
- Attribute-based validation (isValid[Entity] blueprints).
- Purge protection for sensitive operational data.
- Relational mapping between users and administrative roles.

## 💳 Payment Logistics

Pre-integrated structures for:
- **Yoco Checkout:** Targeted at ZAR transactions.
- **PayFast Form Logic:** Supporting South African localized gateways.

## 📈 Impact Metrics

- **Real-time Analytics:** Intelligence dashboard for administrative oversight.
- **Volunteer Workflow:** Authorize/Decline recruits with single-click tactical actions.
- **Blog Content Management:** Markdown-enabled article deployment system.

---
**ATT NGO Operational Directive 2026**
*Awaken. Thrive. Transform.*
