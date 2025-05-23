# Frendly Server

Backend server for the Frendly social media application, using Node.js, Express, TypeScript, and Firebase Authentication.

## Features

- User authentication (login & registration) via Firebase
- RESTful API endpoints
- Express.js server with TypeScript
- Strong typing with TypeScript interfaces

## Getting Started

### Prerequisites

- Node.js (version 14.x or later recommended)
- npm or yarn
- Firebase project (for authentication)

### Installation

1. Install dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn install
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values

3. Start the development server:

   ```
   npm run dev
   ```

   or

   ```
   yarn dev
   ```

4. Build for production:

   ```
   npm run build
   ```

5. The server will start on port 5000 (default) or the port specified in the `.env` file

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user

  - Request: `{ "email": "user@example.com", "password": "password123" }`
  - Response: User object with ID and email

- **POST /api/auth/login** - Login a user
  - Request: `{ "email": "user@example.com", "password": "password123" }`
  - Response: User object with authentication token

## Project Structure

```
server/
├── src/                # Source code
│   ├── config/         # Configuration files
│   │   └── firebase.ts # Firebase setup
│   ├── controllers/    # Route controllers
│   │   └── authController.ts # Auth controller
│   ├── routes/         # API routes
│   │   └── auth.ts     # Auth routes
│   ├── types/          # TypeScript interfaces
│   │   └── index.ts    # Type definitions
│   └── server.ts       # Main entry point
├── dist/               # Compiled JavaScript output
├── .env.example        # Environment variables template
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Firebase Authentication
