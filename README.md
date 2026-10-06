# TripGenius

TripGenius is a React + Node/Express travel-planning application with a clean separation between UI and server-side business logic.

## Architecture

```text
tripgenius/
├── frontend/                 # React + Vite UI only
│   └── src/
│       ├── components/       # Reusable UI + Google Maps component
│       ├── context/          # Client state
│       ├── data/             # Demo destination content
│       ├── pages/             # Route-level screens
│       └── services/          # API + Google Maps loading clients
├── backend/                  # Node/Express business/API layer
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── controllers/       # HTTP request/response logic
│   │   ├── middleware/        # Errors and cross-cutting middleware
│   │   ├── models/            # MongoDB User and Trip models
│   │   ├── routes/             # API endpoints
│   │   └── services/           # Pricing + Razorpay business logic
│   └── .env.example
├── render.yaml                # One-service Render deployment
└── package.json                # Root development/deployment scripts
```

## Razorpay test mode

The payment flow is now a real Razorpay Checkout integration:

1. Frontend requests an order from `POST /api/payments/create-order`.
2. Backend calculates GST + convenience fee and creates the Razorpay order with the **server-side secret**.
3. Razorpay Checkout opens in the browser using only the public test key ID.
4. Backend verifies `razorpay_signature` at `POST /api/payments/verify` before the UI marks the payment successful.

Put your Razorpay **TEST MODE** credentials in `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxx
```

Never put `RAZORPAY_KEY_SECRET` in the frontend or commit `.env` files.

## Google Maps

The itinerary page uses Google Maps JavaScript API instead of Leaflet. Put the browser-restricted Google Maps key in:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_browser_key
```

In Google Cloud, enable the Maps JavaScript API and restrict the key by your deployed domain/referrer.

## Local setup

Requirements: Node.js 18+ and npm.

```bash
npm run install-all
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

Create `backend/.env` from `backend/.env.example` before testing payments/maps.

## Render deployment

This repository is configured for a single Render web service. The backend serves the compiled Vite app in production.

1. Push the project to GitHub.
2. Create a Render Web Service from the repository, or use the included `render.yaml`.
3. Add the Razorpay **test** key ID and secret as environment variables.
4. Add `GOOGLE_MAPS_API_KEY`.
5. Update `FRONTEND_URL` to your actual Render URL.
6. Deploy.

The service health endpoint is `/api/health`.

## MongoDB Atlas + Render

The backend is already wired for MongoDB through `MONGODB_URI`. You do not need to put a MongoDB connection string in the React frontend.

### Local setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI` to your MongoDB Atlas connection string.
3. Set `JWT_SECRET` to a private, random string of at least 32 characters (for example, generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`).
4. Set your Razorpay TEST keys and Google Maps API key.
5. Run `npm run install-all` and then `npm run dev`.

## Accounts and trip history

Account registration and trip history are stored in MongoDB (`users` and `trips` collections). Passwords are hashed with bcrypt. Login and registration set a signed, seven-day JWT in an HTTP-only, same-site cookie; the browser does not store or read the token. Protected API requests identify the account from the token, never from a client-supplied user ID. Trip list, read, update, and delete operations are scoped to that account.

The frontend supports `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`. Trip endpoints are `GET/POST /api/trips` and `GET/PUT/DELETE /api/trips/:id`; all trip endpoints require authentication. Login accepts an email address or a username if the account has one.

### Render setup

When creating/deploying the Render Web Service, add these environment variables:

- `MONGODB_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = a private, randomly generated string of at least 32 characters (keep it stable across deploys)
- `RAZORPAY_KEY_ID` = your Razorpay TEST key ID
- `RAZORPAY_KEY_SECRET` = your Razorpay TEST secret
- `GOOGLE_MAPS_API_KEY` = your Google Maps browser key
- `FRONTEND_URL` = your deployed Render URL
- `NODE_ENV` = `production`

The backend connects to MongoDB before starting the HTTP server. If `MONGODB_URI` is missing or MongoDB cannot be reached, the service fails fast instead of appearing healthy while the database is unavailable.
