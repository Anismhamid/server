# Safqa Marketplace API

Backend API for **Safqa**, a marketplace application for listings, jobs, and local services. This repository contains the Node.js backend; the frontend is maintained separately.

The project demonstrates the design and implementation of a multi-domain application backend, including authentication, authorization, moderation workflows, real-time communication, third-party integrations, and data-backed search.

## What the backend does

- Manages marketplace listings with owner controls, moderation, likes, reviews, and view counts.
- Supports job listings and job-seeker profiles.
- Provides user accounts, Google sign-in, password recovery, and account permissions.
- Enables user messaging, conversations, blocking, notifications, and administrative message audits.
- Supports saved searches and matching notifications.
- Offers paid listing promotions through Stripe Checkout and webhooks.
- Integrates Cloudinary for images, Firebase Cloud Messaging for push notifications, and Ollama for natural-language search parsing.
- Generates public sitemaps for listings and blog content.

## Engineering highlights

### Authentication and authorization

- JWT sessions are stored in HTTP-only cookies.
- Socket.IO connections authenticate using the same cookie.
- Role and permission middleware handles account state and protected operations.
- Listing and job operations include ownership checks; moderation actions are restricted to staff roles.

### Realtime and moderation workflows

- Socket.IO supports user rooms, presence-related events, messaging updates, and notifications.
- New listings enter a pending state and can be approved or rejected by moderators.
- Administrative access to messages can require a reason and is recorded in audit logs.

### Integrations

- Stripe Checkout handles featured-listing payments; the webhook route is mounted before JSON body parsing so Stripe signatures can be verified against the raw request body.
- Cloudinary upload signatures are generated server-side and scoped to the authenticated user.
- Firebase Admin is used for push messaging.
- Ollama can turn natural-language searches into normalized marketplace filters.

## Technology

| Area | Technologies |
|---|---|
| Runtime and API | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, HTTP-only cookies, bcryptjs, Google OAuth |
| Realtime | Socket.IO |
| Validation and security | Joi, express-validator, Helmet, CORS, express-rate-limit |
| External services | Stripe, Cloudinary, Firebase Admin, Brevo, Ollama |

## Architecture

```text
index.js
  ├── Loads environment configuration
  ├── Connects to MongoDB
  ├── Creates the HTTP and Socket.IO servers
  └── Authenticates socket connections

app.js
  ├── Configures Express middleware and webhook parsing
  ├── Mounts API routers
  └── Handles 404 responses and application errors

routes/       HTTP endpoints and request orchestration
controllers/  Focused request handlers
models/       Mongoose data models
middlewares/  Authentication, permissions, and request controls
services/     Search, notification, and matching logic
schema/       Request and domain validation
utils/        Shared integrations and helpers
```

The API is organized around Express routers mounted under `/api`. The main domains are users, posts, jobs, job seekers, blog, messages, notifications, blocks, reports, saved searches, images, and featured ads.

## Local setup

### Requirements

- Node.js 22+
- MongoDB
- Service credentials for integrations you intend to use

### Install

```bash
npm install
```

Create `.env` for local development. Do not commit credentials.

```env
NODE_ENV=development
PORT=8000
DB=mongodb://127.0.0.1:27017/safqa
JWT_SECRET=use-a-long-random-secret
AUTH_COOKIE_NAME=safqa_token
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your-google-oauth-client-id

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

FIREBASE_SERVICE_ACCOUNT={"project_id":"...","private_key":"...","client_email":"..."}

STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-signing-secret

BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM=noreply@example.com

OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:4b
```

Firebase service-account JSON must be valid and include `project_id` and `private_key`. Stripe and Firebase are initialized by backend modules, so their credentials are needed when starting the application as currently structured. Other integrations need their credentials when their features are used.

### Start without running the seed script

The current `npm run dev` script runs `seed.js` before starting the server. `seed.js` connects to the hard-coded local database `mongodb://localhost:27017/marketplace`; do not use that script with important data.

To run the server directly with `.env` and avoid seeding:

```bash
npx cross-env NODE_ENV=development node --watch index.js
```

The API listens on port `8000` by default. Check that it is responding:

```bash
curl http://localhost:8000/api
```

The `/api` health endpoint returns the API name, version, status, and a short list of entry points.

## API overview

All routes below are mounted by `app.js`. See `routes/` for request schemas, authorization rules, and response details.

| Domain | Base path | Examples |
|---|---|---|
| Accounts and authentication | `/api/users` | `POST /`, `POST /login`, `GET /me`, password reset, profile and permissions |
| Listings | `/api/posts` | `GET /`, `POST /`, approve/reject, likes, reviews |
| Jobs | `/api/jobs` | Search, create, update, and owner/admin management |
| Job seekers | `/api/job-seekers` | Public search and owner-managed profiles |
| Messaging | `/api/messages` | Conversations, read receipts, administrative audit |
| Notifications | `/api/notifications` | List, unread count, mark read |
| Saved searches | `/api/saved-searches` | Create, edit, and remove user searches |
| Moderation | `/api/blocks`, `/api/reports` | Blocking and reporting workflows |
| Featured ads | `/api/featured-ads` | Promotion checkout, status, and Stripe webhook |
| Images | `/api/images` | User-scoped Cloudinary upload and deletion |
| Blog | `/api/blog` | Public articles and staff-managed publishing |
| Public data | `/api/cities`, `/api/business-info`, `/api/discounts` | Reference and business information |
| AI search | `/api/ai/search` | Natural-language search parsing |

### Authentication model

Protected HTTP routes read the JWT from the `safqa_token` cookie by default; set `AUTH_COOKIE_NAME` to change it. Browser clients using cross-origin requests must send credentials and use an origin configured in `config/allowOrigins.js`. Roles include `Client`, `Moderator`, and `Admin`; individual account permissions further restrict selected operations.

### Realtime events

Socket.IO runs on the same HTTP server and authenticates a connection using the session cookie. Connected users join a private room keyed by their user ID; staff also join the `admins` room. Events include typing state, message updates, listing changes, and notifications.

### Sitemap endpoints

```text
GET /sitemap.xml
GET /sitemap/sitemap.xml
GET /sitemap/sitemap-index.xml
GET /sitemap/blog.xml
```

## Validation and current status

JavaScript syntax can be checked with:

```bash
find . -name '*.js' -not -path './node_modules/*' -print0 | xargs -0 -n1 node --check
```

Automated tests are **not implemented yet**. The current `npm test` command is a placeholder and exits with an error; no test coverage is claimed. High-value next steps are integration tests for authentication and permissions, listing moderation, payment webhooks, and message ownership.

Other improvements to consider before production use:

- Remove database seeding from the development startup command and make seed targets configurable.
- Add automated tests and a CI check.
- Review the global rate-limit policy and use a shared store if deploying multiple server instances.
- Document production deployment, monitoring, and database backup procedures for the chosen hosting provider.

## Project structure

```text
config/       Database, CORS, and external-service configuration
controllers/  Authentication, reports, and AI request handlers
middlewares/  Authentication, account checks, and rate limiting
models/       Mongoose models
routes/       API routers
schema/       Validation schemas
services/     Notifications, AI search, and saved-search matching
sockets/      Socket-related functionality
utils/        Authentication cookies, mail, payment, and shared helpers
```

## License

ISC
