# SalesPulse CRM

A responsive sales-team dashboard built around the included Haryana schools dataset. It provides separate admin and team-member experiences, district-level access, sales activity tracking, and one-click WhatsApp outreach.

## Included features

### Admin dashboard

- Organization-wide lead, pipeline, call, WhatsApp, conversion, and follow-up statistics
- Seven-day outreach chart, status distribution, district coverage, and recent activity
- Create, activate, and deactivate team accounts
- Reset a member's password
- Assign one or several districts to one or several members
- Review 30-day team performance
- Import the bundled CSV safely without creating duplicates
- Create shared WhatsApp templates
- Add or edit custom lead statuses

### Team dashboard

- Only displays leads in districts assigned to the signed-in member (plus any explicitly assigned leads)
- Search and filter by school, contact, mobile, email, application number, district, and status
- Record calls and automatically move new leads to `Contacted`
- Set status, follow-up date, custom marks/tags, and notes
- Open phone and email actions
- Use shared or personal WhatsApp templates
- Open a prefilled `wa.me` WhatsApp chat and record that outreach action
- See personal activity statistics

### Other essentials

- Secure HTTP-only cookie sessions
- Password hashing with bcrypt
- Login rate limiting
- Role-based API authorization and district-level lead authorization
- Activity audit trail
- Mobile-first lead cards and responsive layouts
- Idempotent MongoDB CSV import using `Application_No` as the unique key
- Render Blueprint configuration and health endpoint

## Technology

- **Frontend:** React, Vite, React Router, Recharts, Lucide icons
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Deployment:** One Render web service serving both the API and built React app

## Local development

Requirements: Node.js 20+ and a MongoDB connection string.

```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and credentials
npm run dev
```

The frontend is available at `http://localhost:5173`; Vite proxies `/api` to the Express server on port 5000.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection URI, including the database name |
| `JWT_SECRET` | Yes | Random secret of at least 24 characters; 32+ is recommended |
| `ADMIN_USER` | Yes initially | Username used to create the first admin account |
| `ADMIN_PASSWORD` | Yes initially | Password used when the first admin account is created |
| `ADMIN_NAME` | No | Display name for the initial admin |
| `NODE_ENV` | Render sets it | Use `production` on Render |
| `PORT` | Render sets it | HTTP port; defaults to 5000 locally |

The bootstrap process creates the environment-defined administrator if that username does not exist. It does **not** overwrite an existing account's password, so a password changed inside the app remains changed after a restart.

## MongoDB Atlas setup

1. Create an Atlas project and select the free database option available for your account.
2. Create a database user with a long, unique password.
3. Add network access that permits your Render service to connect. Render outbound addresses can vary, so use the appropriate Atlas/Render networking option for your account. If broad network access is necessary, rely on strong database credentials and rotate them periodically.
4. Copy the driver connection string and replace its username, password, and database name. For example:

   ```text
   mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/salespulse?retryWrites=true&w=majority
   ```

5. Store this value only in `MONGODB_URI`; never commit it to Git.

## Deploy to Render

This repository includes `render.yaml`.

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Supply the secret environment values when prompted:
   - `MONGODB_URI`
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
4. Render generates `JWT_SECRET` and sets production mode automatically.
5. Deploy. The health check is `/api/health`.
6. Sign in using `ADMIN_USER` and `ADMIN_PASSWORD`.
7. Open **Team > Import CSV** once. The import can safely be run again: existing application numbers are skipped.
8. Add team members and assign their districts.

Render's free services may pause while idle depending on the current free-plan policy; the first request after a pause can therefore take longer.

## Import from the command line

With `MONGODB_URI` configured locally:

```bash
npm run import:csv
```

To import another file with the same column format:

```bash
node server/scripts/importCsv.js path/to/file.csv
```

Expected columns:

```text
State,District,Timestamp,School_Name,Contact_Person,Mobile,Email,Application_No
```

The included CSV has **7,839 leads across 22 districts**.

## WhatsApp templates

Templates support these placeholders:

- `{name}` — lead contact person
- `{school}` — school name
- `{district}` — district
- `{application}` — application number

The app uses official WhatsApp chat links (`https://wa.me/...`) to open a prefilled conversation. It does not send messages in the background; the signed-in member reviews and sends the message in WhatsApp. This avoids requiring the paid WhatsApp Business API and preserves user control.

## Production notes

- Use unique, strong values for the admin password, MongoDB password, and JWT secret.
- Do not share admin credentials with team members; create a separate member account for each person.
- Deactivate accounts immediately when access is no longer needed.
- The bundled CSV contains contact data. Confirm that your collection and outreach comply with applicable privacy, consent, and anti-spam requirements.
- Back up important activity before deleting the Atlas database or Render service.

## Commands

```bash
npm run dev        # Express + Vite development servers
npm run build      # Production frontend build
npm start          # Production API/static server
npm run import:csv # Import the bundled dataset
npm run check      # Server syntax checks
```
