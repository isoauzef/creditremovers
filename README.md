# Credit Removers

Credit Removers is a Vite + React frontend with an Express + Prisma backend for lead capture, checkout, customer accounts, admin content management, Stripe billing, and encrypted document handling.

## Local Development

1. Run `npm install`.
2. Create a local `.env` file. Use `.env.production.example` as the starting point for required keys and local overrides.
3. Make sure your MySQL database matches `DATABASE_URL`.
4. Run `npm run dev:full` to start Vite on `http://localhost:3000` and the API on `http://localhost:3001`.

## Available Commands

- `npm run dev` starts only the Vite dev server.
- `npm run server` starts only the Express API.
- `npm run dev:full` runs frontend and backend together.
- `npm run build` creates the production frontend build in `build`.
- `npx prisma generate` regenerates the Prisma client.
- `npx prisma db seed` seeds an empty database with the initial admin account, settings, templates, and page content.

## Production Deployment

Production deployment is GitHub-driven.

### One-time bootstrap

Run the `Bootstrap Production` workflow after adding these repository secrets:

- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `LETSENCRYPT_EMAIL`
- `MYSQL_PASSWORD`
- `PROD_ENV_FILE`

The bootstrap workflow will:

- create `/var/www/creditremovers`
- create the MySQL database and user
- write the production `.env`
- run Prisma migrations and seed only if the database is empty
- build the app and start `creditremovers-app` with PM2
- create the Nginx site for `creditremovers.com`
- request the Let's Encrypt certificate

### Ongoing deploys

Push to `main` or run the `Deploy Production` workflow manually. The workflow updates the existing server checkout, relinks persistent upload directories, runs migrations, builds, and reloads PM2.

## Runtime Notes

- `public/uploads` is treated as persistent shared media in production.
- `private-uploads` must never be committed and is ignored by git.
- Stripe and SMTP values are seeded from environment variables on the first bootstrap, then managed from the admin settings UI.
- AWS S3/KMS settings can be supplied from environment variables and refreshed from the admin settings UI.
  