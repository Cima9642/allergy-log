# Restaurant Allergy Tracker

A full-stack Next.js application for tracking restaurant cooking oils and assessing peanut allergy risk. The app leverages community verification and rate limiting to ensure data accuracy and prevent abuse.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Docker](#docker)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Security Features](#security-features)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality
- **Submit Restaurants:** Add restaurants with their cooking oil type
- **Real-Time Search:** Debounced search with instant results and risk filtering
- **Risk Assessment:** Color-coded badges (High/Medium/Low/Unknown) based on oil type
- **Data Persistence:** MongoDB-backed storage with data that survives restarts

### Community Trust & Security
- **Crowdsourced Verification:** Restaurants require 2 matching submissions from different IPs to be marked as "Community Verified"
- **Rate Limiting:** Maximum 5 submissions per IP per hour to prevent spam
- **Duplicate Prevention:** Same IP cannot vote for the same restaurant twice
- **Vote Tracking:** Displays verification progress with visual indicators

### User Experience
- **Responsive Design:** Mobile-friendly interface with Tailwind CSS
- **Live Feedback:** Success/error messages with smooth fade animations
- **Verification Badges:** Visual indicators showing verified (✅) vs pending (⚠️) status
- **Progress Bars:** Real-time verification progress display
- **Clear Button:** Quick search reset with X button

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript

### Backend
- **Runtime:** Node.js 25.x
- **Framework:** Next.js API Routes
- **Database:** MongoDB 7.0 (Alpine)
- **ODM:** Mongoose 9.1.5

### DevOps
- **Containerization:** Docker + Docker Compose
- **Production Deployment:** Vercel (with MongoDB Atlas)


## Project Structure
```
app/
  api/
    restaurants/          # POST: Add restaurant with verification
    restaurants/search/   # GET: Search with risk assessment
  layout.tsx              # Root layout
  page.tsx                # Main UI (form + search)
  not-found.tsx           # 404 redirect
lib/
  mongodb.js              # Mongoose connection (cached for serverless)
  riskAssessment.js       # Risk level calculation logic
models/
  Restaurant.js           # Mongoose schema with verification tracking
Dockerfile                # Multi-stage Next.js build
docker-compose.yml        # MongoDB + Next.js orchestration
.dockerignore             # Exclude secrets from Docker image
.env.example              # Environment variables template
.env.local                # Local secrets (NOT committed)
package.json
```

## Getting Started

### Prerequisites
- Node.js 25.x or later
- npm or yarn
- MongoDB instance (local or MongoDB Atlas)

### Installation

1. **Clone and install:**
```bash
git clone <repository-url>
cd allergy-log
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

3. **Configure `.env.local`:**
```bash
# MongoDB Atlas connection string
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/restaurant-tracker"

# Node environment
NODE_ENV=development

# API URL (for development)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**The app will:**
- Connect to your MongoDB instance via `MONGODB_URI`
- Enable hot-reload for code changes
- Show detailed error messages

## Docker

This project includes a `Dockerfile` and `docker-compose.yml` for containerized development and deployment.

### Build and Run with Docker Compose (Recommended)

```bash
docker compose build
docker compose up
```

Visit [http://localhost:3000](http://localhost:3000)

### Manual Docker Build and Run

```bash
docker build -t allergy-log:local .
docker run --env MONGODB_URI="${MONGODB_URI}" -p 3000:3000 allergy-log:local
```

### Stop and Clean Up

```bash
# Stop containers (keeps data)
docker compose down

# Stop and remove all data
docker compose down -v

# Remove Docker image
docker image rm allergy-log-app

# Free port 3000
lsof -i :3000
```

### Using MongoDB Atlas with Docker

To use a real MongoDB Atlas instance:
1. Update `MONGODB_URI` in `docker-compose.yml`
2. Ensure IP whitelist includes your Docker host
3. Run: `docker compose up`

### Multi-Stage Build

The `Dockerfile` uses a two-stage build:
1. **Builder stage:** Compiles TypeScript, builds Next.js app
2. **Runtime stage:** Minimal image with only production dependencies

This reduces final image size and improves security.

## API Reference

### POST `/api/restaurants`
**Add a new restaurant or vote on verification**

Request:
```json
{
  "name": "Joe's Diner",
  "oilType": "Canola"
}
```

Response (new restaurant):
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "joe's diner",
    "votes": [{ "oilType": "Canola", "ipAddress": "192.168.1.1", "timestamp": "..." }],
    "verified": false,
    "consensusOilType": null
  },
  "message": "Restaurant submitted! ⏳ Waiting for 1 more verification from someone else to confirm."
}
```

Response (verification):
```json
{
  "success": true,
  "data": {
    "verified": true,
    "consensusOilType": "Canola",
    "votes": [...]
  },
  "message": "✅ Community Verified! Canola oil confirmed by 2 people"
}
```

Error: Rate Limit (429)
```json
{
  "success": false,
  "error": "Too many submissions. Please try again later. (Limit: 5 per hour)"
}
```

Error: Duplicate Vote (400)
```json
{
  "success": false,
  "error": "You have already submitted this restaurant with this oil type"
}
```

### GET `/api/restaurants/search?name=<query>`
**Search restaurants with risk assessment**

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "joe's diner",
      "oilType": "Canola",
      "verified": true,
      "voteCount": 2,
      "verificationStatus": "Community Verified ✅",
      "risk": {
        "riskLevel": "Low",
        "message": "Low Risk - Restaurant uses oils with lower allergenic potential.",
        "color": "green"
      }
    }
  ],
  "count": 1
}
```

## Testing

### Manual Testing Checklist

| Test | Steps | Expected |
|------|-------|----------|
| **Add Restaurant** | Submit form → See success message | Green message, form clears after 5s |
| **Unverified Display** | Search new restaurant | Shows ⚠️ Pending, progress 50%, "Needs 1 more vote" |
| **Verification** | Add same restaurant from different IP | Auto-marks verified ✅, 100% progress |
| **Duplicate Prevention** | Add same restaurant/oil again | Red error: "Already submitted" |
| **Rate Limiting** | Add 6 restaurants in quick succession | 6th fails: "Too many submissions" |
| **Risk Levels** | Search different oil types | Colors match: Peanut (red), Canola (green) |
| **Data Persistence** | Restart server while running locally | All restaurants still searchable |
| **Docker Isolation** | Verify secrets in Docker | `docker compose exec app cat .env` → "No such file" |

### Running Tests

```bash
# Local: npm run dev
# Docker: docker compose up
# Then open http://localhost:3000 and follow checklist above
```

## Security Features

### Authentication & Authorization
- **IP-Based Rate Limiting:** 5 submissions per IP per hour
- **Duplicate Vote Prevention:** Same IP + oil type = rejected
- **Verification System:** Requires consensus from different IPs

### Data Protection
- **Environment Variables:** Secrets stored in `.env.local` (never committed)
- **Docker Security:**
  - `.dockerignore` excludes `.env` files from image
  - Multi-stage build removes dev dependencies
  - Health checks ensure service readiness
- **MongoDB:**
  - IP whitelist enforced (Atlas)
  - Authentication required
  - Data persisted in volumes

### Validation
- **Input Validation:** Name (2+ chars), oil type (enum)
- **Error Handling:** Graceful failures with user-friendly messages
- **Rate Limiting:** Prevents resource exhaustion

## Scripts

```bash
# Development
npm run dev           # Start dev server (hot reload)
npm run build         # Build for production
npm run start         # Run production server
npm run lint          # Run ESLint

# Docker
docker compose build  # Build image
docker compose up     # Start services
docker compose down   # Stop services
docker compose logs   # View logs
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "feat: add verification and rate limiting"
git push origin main
```

2. **Deploy on Vercel**
   - Connect GitHub repo to Vercel
   - Set environment variable: `MONGODB_URI` (MongoDB Atlas connection)
   - Deploy (automatic on push)

3. **Verify**
   - Visit your Vercel deployment URL
   - Test all features

### Docker (Any Cloud)

1. **Build and push to registry**
```bash
docker build -t <username>/allergy-log:latest .
docker push <username>/allergy-log:latest
```

2. **Deploy** (e.g., AWS ECS, Google Cloud Run)
   - Use image: `<username>/allergy-log:latest`
   - Set env: `MONGODB_URI`
   - Expose port: `3000`

## Roadmap

- [x] Core submission and search functionality
- [x] Risk assessment with color-coded badges
- [x] **Crowdsourced verification system** (2-vote consensus)
- [x] **Rate limiting** (5 per hour per IP)
- [x] **Duplicate vote prevention**
- [x] Docker containerization with health checks
- [ ] User accounts and authentication
- [ ] Admin dashboard for moderation
- [ ] Advanced filtering (by cuisine, location)
- [ ] Email notifications for verified restaurants
- [ ] UI component library setup (shadcn/ui)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: describe your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

MIT License - see LICENSE file for details







