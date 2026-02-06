# Allergy Log

A Next.js application for tracking restaurant cooking oils and assessing peanut allergy risk. The app lets users submit restaurants with their oil type, then search with real-time filtering and risk badges to help make safer dining decisions.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run the App](#run-the-app)
- [API Reference](#api-reference)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features
- Add restaurants with the cooking oil type used.
- Real-time search with debounce and clear control.
- Risk assessment based on oil type (high/medium/low/unknown) with color-coded badges.
- MongoDB-backed persistence via Mongoose.

## Tech Stack
- **Framework:** Next.js (App Router)
- **UI:** React + Tailwind CSS
- **Database:** MongoDB + Mongoose
- **Language:** TypeScript (frontend) + JavaScript (API/routes)

## Project Structure
```
app/
  api/
    restaurants/          # Create restaurant entries
    restaurants/search/   # Search + risk assessment
  page.tsx                # UI: form + search experience
lib/
  mongodb.js              # MongoDB connection
  riskAssessment.js       # Risk scoring helpers
models/
  Restaurant.js           # Mongoose schema
```

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- MongoDB instance (local or cloud)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env.local` file in the project root:

```bash
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"
```

> The application expects a MongoDB database named `restaurant-tracker` by default. You can adjust this in `lib/mongodb.js`.

### Run the App
```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## API Reference

### Create a restaurant
**POST** `/api/restaurants`

Request body:
```json
{
  "name": "Joe's Diner",
  "oilType": "Canola"
}
```

### Search restaurants
**GET** `/api/restaurants/search?name=<query>`

Returns restaurants sorted by most recent submission and includes a `risk` object for each entry.

## Scripts
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Deployment
The application can be deployed on any platform that supports Next.js (e.g., Vercel, Render, or a custom Node.js server). Ensure that `MONGODB_URI` is configured in your deployment environment.

## Roadmap
- UI component library setup (shadcn/ui).
- Enhanced analytics and reporting.
- User authentication and access controls.

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m "Add my feature"`.
4. Push to the branch: `git push origin feature/my-feature`.
5. Open a pull request.

## License
This project is licensed under the MIT License.
