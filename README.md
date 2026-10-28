# BuildPort Construction Portfolio

A construction-company portfolio website with a React public site, a React admin console, a PHP content API, and a FastAPI analytics service.

## Project structure

| Path | Purpose |
| --- | --- |
| `frontend/` | Public React portfolio website |
| `admin-frontend/` | Admin login, dashboard, analytics, and content management |
| `backend/` | PHP API for authentication and portfolio content |
| `analytics-service/` | FastAPI service for visitor tracking and analytics |
| `backend/migrations/` | SQL migrations for the PHP backend |
| `sql-schema/` | SQL schema files for supporting services |
| `backend/uploads/` | Uploaded portfolio images |

## Requirements

- Node.js and npm
- PHP 7.4 or newer, Composer, and the PHP PDO MySQL extension
- MySQL
- Python 3 and `venv`

## Local setup

### 1. Configure MySQL and environment variables

Create a MySQL database for the application, then configure the environment files for each service. Do not commit credentials or secrets.

The PHP backend reads its database settings from `backend/.env`:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=604800
```

Apply the SQL files in `backend/migrations/` to the configured database in numeric order. The analytics service also uses MySQL; configure its database connection and service settings in `analytics-service/.env`:

```dotenv
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
SERVICE_PORT=8001
INTERNAL_API_KEY=replace_with_a_shared_random_key
FINGERPRINT_SALT=replace_with_a_random_salt
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:8000
```

Apply the analytics table schema from `sql-schema/` to the database used by the analytics service. Keep `INTERNAL_API_KEY` in sync with the frontends' `REACT_APP_INTERNAL_API_KEY` setting.

The frontends use these optional settings (the defaults are shown):

```dotenv
# frontend/.env and admin-frontend/.env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ANALYTICS_API_URL=http://localhost:8001/api/analytics
REACT_APP_INTERNAL_API_KEY=replace_with_the_analytics_service_key
```

### 2. Install and start the PHP API

In a terminal:

```bash
cd backend
composer install
composer start
```

The API listens at `http://localhost:8000`.

### 3. Install and start the analytics service

In a separate terminal:

```bash
cd analytics-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

The service health endpoint is `http://localhost:8001/health`. Interactive API documentation is available at `http://localhost:8001/docs`.

### 4. Start the public website

In another terminal:

```bash
cd frontend
npm install
npm start
```

The React development server opens at `http://localhost:3000` by default.

### 5. Start the admin console

In another terminal:

```bash
cd admin-frontend
npm install
npm start
```

If the public site is already using port 3000, React will offer another available port. Open the URL printed in the terminal.

## Available scripts

Both React applications provide the following npm scripts:

```bash
npm start    # Start the development server
npm test     # Run tests
npm run build # Create a production build in build/
```

The PHP backend provides Composer scripts:

```bash
composer start
composer test
```

## API overview

- The PHP API is rooted at `/api/v1` and handles authentication and portfolio content.
- The analytics service exposes tracking routes under `/api/analytics` and admin reporting routes under `/api/analytics/admin`.
- The React applications use `REACT_APP_API_URL` and `REACT_APP_ANALYTICS_API_URL` to configure the service URLs.

## Security notes

- Use unique, strong secrets for `JWT_SECRET`, `INTERNAL_API_KEY`, and `FINGERPRINT_SALT`.
- Never commit `.env` files, production credentials, or real user data.
- Configure production CORS origins and secrets for the deployment environment; the local examples above are for development only.
