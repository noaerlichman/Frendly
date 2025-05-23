# Frendly Social Media Application

A simple social media application with user authentication.

## Project Structure

This project is organized into two main parts:

- `client`: React frontend application
- `server`: Node.js/Express backend with Firebase authentication

## Getting Started

### Prerequisites

- Node.js (version 14.x or later recommended)
- npm or yarn
- Firebase project (for authentication)

### Setup and Installation

#### Server Setup

1. Navigate to the server directory:

   ```
   cd server
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values

4. Start the server:
   ```
   npm run dev
   ```

#### Client Setup

1. Navigate to the client directory:

   ```
   cd client
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Features

- User authentication (registration and login)
- Clean, modern UI
- Firebase integration for secure authentication

## Technologies Used

### Frontend

- React.js
- React Router
- Axios for API requests
- CSS3

### Backend

- Node.js
- Express.js
- Firebase Authentication

## API Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login a user

## Development

To run both the client and server concurrently, you can use separate terminal windows or install a tool like `concurrently`.
