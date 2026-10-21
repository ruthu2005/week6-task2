
Week 6 Task 2 — Student Placement Tracker Authentication

Project Overview

This project implements a React-based authentication flow for the Student Placement Tracker using React and Vite. It includes user registration, login, authentication state management, logout, and protected routing.

Features

- User registration and login forms.
- Authentication state management using React context.
- Protected routes for authenticated users.
- Logout functionality.
- Token and user information storage using browser local storage.
- Responsive React application interface.

Technologies Used

- React
- Vite
- JavaScript
- React Router DOM
- Axios (if used in the project)

Prerequisites

Install the following before running the project:

- Node.js
- npm
- Visual Studio Code

Installation and Setup

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Open the integrated terminal using Terminal → New Terminal.
4. Install the dependencies:

npm install

5. Configure the environment variables if required by the project.

Create a ".env" file in the project root if your API configuration requires it. For example:

VITE_API_URL=http://localhost:3000/api

Replace this example URL with the actual API URL used by your application. Do not create an environment variable unless the application uses it.

6. Start the frontend development server:

npm run dev

7. Open the local URL displayed in the terminal, usually "http://localhost:5173".

Authentication Flow

1. Register a new user account.
2. Sign in using the registered credentials.
3. Access protected pages while authenticated.
4. Sign out to clear the authenticated state.
5. Verify that protected pages redirect unauthenticated users to the login page.

Screenshots

The "docs" folder contains screenshots demonstrating the application's authentication flow.

- "docs/registration.png" — Registration page.
- "docs/login-success.png" — Successful login.
- "docs/protected-route.png" — Protected route redirect after logout.

Running the Project

npm install
npm run dev

Notes

- Ensure the backend API is running if the application depends on a backend server.
- Configure the correct API URL before testing authentication against a backend.
- Never commit passwords, private tokens, or other secrets to GitHub.