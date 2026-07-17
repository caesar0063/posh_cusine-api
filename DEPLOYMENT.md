# Deployment Guide

This document explains how to deploy Posh Cuisine manually in a staging or production environment.

## Required environment variables

The application requires these environment variables:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `EMAIL_USER` - Email account username for notifications
- `EMAIL_PASS` - Email account password
- `PORT` - Server port (optional, defaults to `5000`)

## Local staging with Docker

1. Create a `.env` file in the project root with the required variables.
2. Build the container:
   ```sh
   docker compose build
   ```
3. Start the stack:
   ```sh
   docker compose up
   ```
4. Access the API at `http://localhost:5000`.

## Local staging without Docker

1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file in the project root containing the required values.
3. Start the application:
   ```sh
   npm start
   ```
4. Open the admin frontend via Live Server or a static file server and make sure it points to `http://localhost:5000/api/v1`.

## Deploying to a cloud provider

### Heroku / Railway / Render

1. Push your repository to GitHub.
2. Create an app in the provider dashboard.
3. Set the environment variables in the deployment settings.
4. Use the following start command if required:
   ```sh
   node server/server.js
   ```
5. The `Procfile` in the repository already configures the web process.

## Environment management

- Do not commit `.env` files or secrets.
- Use `.env.example` for placeholder values only.
- In staging/prod, configure environment variables in the deployment dashboard.

## Validation

After deployment, verify the app is reachable and returns a successful health check from `http://<host>:<port>/`.

Then test the admin flow:

1. Open the login page.
2. Submit valid admin credentials.
3. Confirm the response includes `success: true`, `data.token`, and `data.admin`.
4. Confirm protected pages load without redirecting back to login.

## Docker commands

- Build: `docker compose build`
- Start: `docker compose up`
- Stop: `docker compose down`
