# Package Tracking API

A modern Node.js backend for tracking packages from multiple carriers (FedEx, UPS, DHL, Purolator) with secure user management, rate limiting, and OpenAPI documentation.

## Features

- **Fastify** backend with TypeScript
- **Zod** for schema validation
- **Prisma** ORM with SQLite for user and token storage
- **Carrier Integrations:**
  - FedEx (OAuth2, token caching)
  - UPS (OAuth2, token caching)
  - DHL (Basic Auth)
  - Purolator (SOAP)
- **User credential management** (secure random generation, hashed passwords)
- **Basic Auth** for protected endpoints
- **Rate limiting** on tracking endpoints
- **Swagger/OpenAPI** documentation
- **Environment variable validation**

## Getting Started

### Prerequisites
- Node.js 18+
- SQLite (or use the default file-based DB)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the project root with the following variables:

```
NODE_ENV=dev

# Environment settings
PORT=3333

# Database connection settings
FEDEX_API_KEY=your-fedex-key
FEDEX_API_SECRET=your-fedex-secret
FEDEX_BASE_URL=https://apis.fedex.com

# FedEx API credentials
UPS_API_KEY=your-ups-key
UPS_API_SECRET=your-ups-secret
UPS_BASE_URL=https://onlinetools.ups.com

# DHL API credentials
DHL_API_KEY=your-dhl-key
DHL_API_SECRET=your-dhl-secret
DHL_BASE_URL=https://express.api.dhl.com/mydhlapi

# Purolator API credentials
PUROLATOR_API_KEY=your-purolator-key
PUROLATOR_API_SECRET=your-purolator-secret
PUROLATOR_BASE_URL=https://webservices.purolator.com

# SQLlite database file path
DATABASE_URL=file:../src/db/package-tracking.db

```

### Database Setup
Run the following to set up the database:
```bash
npx prisma migrate dev --name init
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start (Production)
```bash
npm start
```

## API Endpoints

### User Management
- `POST /user/generate-credentials` — Generate a new user with random credentials

### Tracking
- `POST /track-by-code` — Track a package (requires Basic Auth)
  - Body: `{ carrier: "fedex" | "ups" | "dhl" | "purolator", trackingCode: string }`

## Carrier Integrations
- **FedEx:** Uses OAuth2, token is cached in SQLite
- **UPS:** Uses OAuth2, token is cached in SQLite
- **DHL:** Uses Basic Auth for each request
- **Purolator:** Uses SOAP API

## Security
- All sensitive credentials are stored in environment variables
- User passwords are hashed using Node.js crypto
- All tracking endpoints require Basic Auth

## License
ISC

---

> Built with Fastify, Prisma, and TypeScript.
