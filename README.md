# 101496484_COMP3123_Assignment1

COMP 3123 Full Stack Development I - Assignment 1 (Backend)

- **Student:** Cem Dudu
- **Student ID:** 101496484
- **GitHub:** https://github.com/Cem-Gbc/101496484_COMP3123_Assignment1
- **Deployed API (Vercel):** https://101496484-comp3123-assignment1.vercel.app (health check: [/health](https://101496484-comp3123-assignment1.vercel.app/health))

## Project purpose

A secure REST API for managing employees. Users sign up and log in, and a JWT is returned on login.
Each user can create, view, update and delete **only their own employees**. Every employee is linked
to the user who created it, and the API checks this ownership on every request.

## Technologies

| Part | Technology |
|------|------------|
| Runtime / framework | Node.js (v20.19 or newer), Express 5 |
| Database | MongoDB with Mongoose 9 (database name `comp3123_assignment1`) |
| Passwords | bcrypt |
| Authentication | JSON Web Tokens (jsonwebtoken) |
| Validation | express-validator |
| Security | Helmet, express-rate-limit |
| Logging | winston |
| Configuration | dotenv (`.env` file) |
| Testing | Postman (collection included) |
| Deployment | Vercel + MongoDB Atlas |

## Project structure

```
101496484_COMP3123_Assignment1/
├── app.js                 Express app (exported - Vercel uses this file)
├── server.js              starts the app locally: connect to MongoDB, then listen
├── config/
│   ├── config.js          reads the environment variables
│   └── db.js              MongoDB connection (created once and reused)
├── controllers/
│   ├── userController.js       signup and login
│   ├── employeeController.js   employee CRUD
│   └── healthController.js     GET /health
├── middleware/
│   ├── auth.js            checks the JWT (Authorization: Bearer <token>)
│   ├── validate.js        returns 400 when validation fails
│   ├── rateLimiter.js     login/signup limit and general API limit
│   ├── requestLogger.js   logs every request
│   └── errorHandler.js    404 for unknown routes + central error handler
├── models/
│   ├── User.js
│   └── Employee.js
├── routes/
│   ├── userRoutes.js      /api/v1/user
│   └── employeeRoutes.js  /api/v1/emp
├── services/
│   ├── tokenService.js    create and verify JWTs
│   └── employeeService.js ownership check (404 / 403) and duplicate email check
├── validators/
│   ├── userValidator.js
│   └── employeeValidator.js
├── utils/
│   ├── logger.js          winston logger (console + log files)
│   └── AppError.js        an error that has an HTTP status code
├── logs/                  log files (sample-app.log is an example from a real test run)
├── screenshots/           Postman and MongoDB screenshots
├── COMP3123_Assignment1_Postman_Collection.json
├── 101496484_COMP3123_Assignment1_Screenshots.docx
├── .env.example           example settings (no real secrets)
├── .gitignore
├── .vercelignore          files that are never uploaded to Vercel (like .env)
└── package.json
```

A request goes through: `route -> middleware (rate limit, auth, validation) -> controller -> service/model -> response`.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Cem-Gbc/101496484_COMP3123_Assignment1.git
cd 101496484_COMP3123_Assignment1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and change the values:

```bash
cp .env.example .env
```

| Variable | Required | Example | What it is |
|----------|----------|---------|------------|
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Yes | a long random string | Secret key used to sign the JWTs |
| `JWT_EXPIRES_IN` | No | `1h` | How long a token is valid (default `1h`) |
| `PORT` | No | `3000` | Local server port (default `3000`) |
| `AUTH_RATE_LIMIT` | No | `20` | Login + signup requests allowed per 15 minutes per IP (default `20`) |
| `API_RATE_LIMIT` | No | `200` | API requests allowed per 15 minutes per IP (default `200`) |

Create a random JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The app stops at startup with a clear message if `MONGODB_URI` or `JWT_SECRET` is missing.
The real `.env` file is in `.gitignore` and is never committed.

### 4. Start MongoDB

Any of these works. The app always uses the database **`comp3123_assignment1`** (set in `config/db.js`),
and MongoDB creates it automatically on the first insert.

- **Local MongoDB Community Server:** `MONGODB_URI=mongodb://127.0.0.1:27017`
- **Docker:**
  ```bash
  docker run -d --name comp3123-mongo -p 127.0.0.1:27017:27017 -v comp3123-mongo-data:/data/db mongo:7
  ```
- **MongoDB Atlas:** `MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster-host>/?retryWrites=true&w=majority`

### 5. Start the application

```bash
npm start      # node server.js
npm run dev    # node --watch server.js (restarts when a file changes)
```

Output:

```
2026-10-15T22:30:00.000Z [INFO] Connected to MongoDB database "comp3123_assignment1"
2026-10-15T22:30:00.050Z [INFO] Server started on http://localhost:3000
```

### 6. Test the API

Open http://localhost:3000/health, then use the Postman collection (see [Postman testing](#postman-testing)).
Quick test with curl:

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/v1/user/signup -H "Content-Type: application/json" -d "{\"username\":\"alice\",\"email\":\"alice@example.com\",\"password\":\"AlicePass123\"}"
curl -X POST http://localhost:3000/api/v1/user/login -H "Content-Type: application/json" -d "{\"username\":\"alice\",\"password\":\"AlicePass123\"}"
```

## API endpoints

| # | Method | Endpoint | Token needed | Success | Description |
|---|--------|----------|--------------|---------|-------------|
| 1 | POST | `/api/v1/user/signup` | No | 201 | Register a new user |
| 2 | POST | `/api/v1/user/login` | No | 200 | Log in with username **or** email + password, returns a JWT |
| 3 | GET | `/api/v1/emp/employees` | Yes | 200 | List the logged-in user's employees |
| 4 | POST | `/api/v1/emp/employees` | Yes | 201 | Create an employee for the logged-in user |
| 5 | GET | `/api/v1/emp/employees/{eid}` | Yes | 200 | Get one of the user's employees |
| 6 | PUT | `/api/v1/emp/employees/{eid}` | Yes | 200 | Update one of the user's employees (send only the fields to change) |
| 7 | DELETE | `/api/v1/emp/employees?eid=xxx` | Yes | 204 | Delete one of the user's employees (no response body) |
| - | GET | `/health` | No | 200 | Health check |

### Examples

**Signup** - `POST /api/v1/user/signup`

```json
{ "username": "alice", "email": "alice@example.com", "password": "AlicePass123" }
```

Response `201 Created` (the password is never returned):

```json
{
  "status": true,
  "message": "User created successfully",
  "user": {
    "_id": "6ad14a9cb2a6d62e9572a7ad",
    "username": "alice",
    "email": "alice@example.com",
    "created_at": "2026-10-15T21:50:20.876Z",
    "updated_at": "2026-10-15T21:50:20.876Z"
  }
}
```

**Login** - `POST /api/v1/user/login` with `{ "username": "alice", "password": "AlicePass123" }`
or `{ "email": "alice@example.com", "password": "AlicePass123" }`. Response `200 OK`:

```json
{
  "status": true,
  "message": "Login successful",
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "1h",
  "user": { "_id": "6ad14a9cb2a6d62e9572a7ad", "username": "alice", "email": "alice@example.com" }
}
```

**Create employee** - `POST /api/v1/emp/employees` with header `Authorization: Bearer <jwt_token>`:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john.smith@example.com",
  "position": "Software Developer",
  "salary": 75000,
  "date_of_joining": "2024-03-15",
  "department": "Engineering"
}
```

Response `201 Created` - the `user` field (the owner) is added by the server from the JWT:

```json
{
  "status": true,
  "message": "Employee created successfully",
  "employee": {
    "_id": "6ad14b03fd2d04cfbfc08fca",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com",
    "position": "Software Developer",
    "salary": 75000,
    "date_of_joining": "2024-03-15T00:00:00.000Z",
    "department": "Engineering",
    "user": "6ad14a9cb2a6d62e9572a7ad",
    "created_at": "2026-10-15T21:51:31.120Z",
    "updated_at": "2026-10-15T21:51:31.120Z"
  }
}
```

**Get all employees** returns `{ "status": true, "count": 2, "employees": [ ... ] }`.

### Error responses

Every error is JSON with the same shape:

```json
{ "status": false, "message": "Employee not found" }
```

Validation errors also list each field:

```json
{
  "status": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email must be a valid email address" },
    { "field": "salary", "message": "Salary must be a positive number (maximum 10,000,000)" }
  ]
}
```

### HTTP status codes

| Code | When it is used |
|------|-----------------|
| 200 OK | Successful login, GET, PUT and health check |
| 201 Created | A user or an employee was created |
| 204 No Content | An employee was deleted (nothing to send back) |
| 400 Bad Request | Validation failed, invalid ObjectId, malformed JSON, unexpected fields, empty update |
| 401 Unauthorized | Wrong login, or the JWT is missing, invalid, tampered or expired |
| 403 Forbidden | The employee exists but belongs to another user |
| 404 Not Found | Employee does not exist, or the route does not exist |
| 409 Conflict | Username or email already used, or the user already has an employee with that email |
| 413 Payload Too Large | Request body is bigger than 10 kb |
| 429 Too Many Requests | Rate limit reached |
| 500 Internal Server Error | Unexpected error, for example MongoDB is down (details are only in the log) |

## Authentication (JWT)

1. **Signup** - the user is saved with a bcrypt-hashed password.
2. **Login** - the user sends username or email + password. The password is checked with `bcrypt.compare()`.
   The same message ("Invalid username/email or password") is used for an unknown user and a wrong password,
   so nobody can find out which usernames exist.
3. **JWT** - on success the server signs a token (HS256) with `JWT_SECRET`. The token stores the user's id and
   username and expires after `JWT_EXPIRES_IN` (1 hour by default).
4. **Authorization header** - the client sends the token on every employee request:
   ```
   Authorization: Bearer <jwt_token>
   ```
5. **Protected employee endpoints** - `middleware/auth.js` runs before every `/api/v1/emp` route. It:
   - returns 401 if the header is missing or does not start with `Bearer `
   - verifies the signature and expiry date (`jwt.verify`): an invalid or changed token gives 401 "Invalid token",
     an old token gives 401 "Token has expired. Please log in again"
   - checks that the user in the token still exists
   - saves the logged-in user in `req.user`

## Authorization: users only access their own employees

The owner of an employee always comes from the verified JWT (`req.user.id`), **never from the request**:

- **Create:** the server sets `user: req.user.id`. A `user` field in the body is rejected with 400
  (`checkExact()` in the validator), and the controller only copies the 7 allowed employee fields.
- **List:** the database query is `Employee.find({ user: req.user.id })`, so other users' employees are never returned.
- **Get / Update / Delete by id:** `findOwnedEmployee()` in `services/employeeService.js` loads the employee and
  returns **404** if it does not exist or **403** if `employee.user` is not the logged-in user.
  The update and delete queries also filter by owner: `{ _id: eid, user: req.user.id }`.
- Changing `eid` in the URL or query string does not help, because the ownership check uses the user id from the
  signed token, and a token cannot be changed without the server's secret.

This was tested with two users (alice and bob): each user only sees their own employees, and all six cross-user
attempts (GET, PUT and DELETE in both directions) return 403 and do not change any data.

I return 403 (not 404) for another user's employee because the assignment lists "employee belongs to another user"
as its own error case. Some APIs return 404 instead to hide that the id exists.

## Database and relationships

**User** (`users` collection)

| Field | Type | Rules |
|-------|------|-------|
| `username` | String | required, unique, 3-30 characters, saved in lower case |
| `email` | String | required, unique, valid email, saved in lower case |
| `password` | String | required, **bcrypt hash only**, `select: false` and removed from JSON |
| `created_at`, `updated_at` | Date | added by Mongoose `timestamps` |

**Employee** (`employees` collection)

| Field | Type | Rules |
|-------|------|-------|
| `first_name`, `last_name` | String | required, max 50 |
| `email` | String | required, valid email |
| `position`, `department` | String | required, max 50 |
| `salary` | Number | required, must be greater than 0 |
| `date_of_joining` | Date | required |
| `user` | ObjectId (ref `User`) | required - the owner |
| `created_at`, `updated_at` | Date | added by Mongoose `timestamps` |

The `user` field is the relationship (one user -> many employees). A unique index on `{ user, email }` makes
"get this user's employees" fast and stops one user from adding two employees with the same email.

## Input validation

Validation uses **express-validator**. The rules are in `validators/` and run before the controller.
If a rule fails, `middleware/validate.js` sends 400 with a list of fields and messages.

- **Signup:** username 3-30 characters (letters, numbers, `.` and `_`), valid email, password 8-64 characters with an
  uppercase letter, a lowercase letter and a number.
- **Login:** username or email is required, and a password.
- **Employee:** all fields required on create (optional on update, but checked if sent), names only letters,
  spaces, `'`, `.` and `-`, valid email, salary must be a positive number, `date_of_joining` must be a real date
  (`2024-02-30` is rejected), string lengths are limited.
- **Employee id:** `eid` must be a valid MongoDB ObjectId (400 if not).
- **Unexpected input:** fields that are not expected (like `role` or `user`) are rejected, values must have the right
  type (an object like `{"$ne": null}` is rejected, which blocks NoSQL injection), malformed JSON gives 400,
  and bodies over 10 kb give 413.
- The Mongoose schemas have their own rules too (required, unique, max length, positive salary).

## Security

- **Password hashing:** bcrypt (10 salt rounds) in a `pre('save')` hook of the User model. Plain passwords are never
  stored, and the hash is never returned (`select: false` + `toJSON`).
- **JWT:** signed with a secret from the environment, HS256 only, with an expiry time.
- **Helmet:** adds security headers to every response, for example `Content-Security-Policy`,
  `Strict-Transport-Security`, `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN`, and removes
  `X-Powered-By` (so the server does not say it uses Express). These headers protect browsers against attacks like
  clickjacking, MIME sniffing and loading content over plain HTTP.
- **Rate limiting:** see below.
- **Input validation:** see above.
- **Environment variables:** secrets (`MONGODB_URI`, `JWT_SECRET`) are only in `.env` locally and in the Vercel
  project settings. `.env` is ignored by Git (`.gitignore`) and by Vercel uploads (`.vercelignore`).
  `.env.example` only has placeholders.
- **Error handling:** one central error handler (`middleware/errorHandler.js`). Clients get a short JSON message;
  stack traces and database errors are only written to the log.

## Rate limiting

**What it is:** rate limiting counts how many requests one client (IP address) sends in a time window and blocks
it for a while when it sends too many. It slows down password guessing (brute force), mass account creation and
request floods.

**Which endpoints are protected** (`middleware/rateLimiter.js`, express-rate-limit):

| Limiter | Endpoints | Limit (per IP) |
|---------|-----------|----------------|
| `authLimiter` | `POST /api/v1/user/login` and `POST /api/v1/user/signup` (shared counter) | 20 requests / 15 minutes (`AUTH_RATE_LIMIT`) |
| `apiLimiter` | every `/api/...` request | 200 requests / 15 minutes (`API_RATE_LIMIT`) |

**What happens when the limit is exceeded:** the request is not processed. The server returns
**429 Too Many Requests** with a JSON message, a `Retry-After` header (seconds to wait) and `RateLimit` headers,
and the event is logged:

```json
{ "status": false, "message": "Too many requests. Please try again in 15 minute(s)." }
```

The counters are kept in memory, so restarting the server resets them.

## Logging

Logging uses **winston** (`utils/logger.js`) plus a request logger middleware.

- **Where:** `logs/app.log` (everything) and `logs/error.log` (errors only), created automatically.
  A file is rotated at 5 MB and 3 files are kept. Logs are also printed to the console.
  Log files are in `.gitignore`; `logs/sample-app.log` is a real example from a test run.
- **Format:** `2026-10-15T22:01:32.512Z [WARN] Access denied: user "alice" tried to access employee 6ad1... that belongs to another user`
- **What is logged:**
  - server startup and the MongoDB connection
  - every request: time, method, path, status code, response time, IP and username
  - authentication: successful logins, failed logins, new users, missing/invalid/expired tokens
  - validation failures (field names only)
  - authorization failures (403 ownership attempts)
  - successful employee create, update and delete
  - rate limit hits
  - errors, with the stack trace (only in the log)
- **Never logged:** passwords, request bodies, the `Authorization` header or any token, the JWT secret and the
  database connection string. Validation errors log the field name, not the value.
- **On Vercel:** the file system is read-only, so the logger only writes to the console there
  (visible in the Vercel project's Logs page).

## Health check

`GET /health` (no token needed, not rate limited)

```json
{
  "status": true,
  "message": "COMP3123 Assignment 1 API is running",
  "database": "connected",
  "uptime_seconds": 42,
  "timestamp": "2026-10-15T22:21:38.559Z"
}
```

It pings MongoDB. If the database is down, the server still answers `200` with `"database": "disconnected"`.

## Postman testing

Import `COMP3123_Assignment1_Postman_Collection.json` into Postman. It has 67 requests with test scripts:

| Folder | What it tests |
|--------|---------------|
| 0. Health Check | health check + Helmet headers |
| 1. User Registration | signup User A and User B, duplicate username, duplicate email, invalid email, invalid password, missing fields, unexpected field |
| 2. User Login and JWT | login with username, login with email, wrong password, unknown user, missing credentials |
| 3. Employee CRUD (User A) | create, list, get by id, update, delete (204), get deleted (404) |
| 4. Validation and Error Responses | missing fields, invalid email, invalid salary, invalid date, client sends `user`, duplicate email, invalid ids, missing employee, empty update, malformed JSON, unknown route |
| 5. JWT Authentication Errors | missing, invalid, tampered and expired JWT |
| 6. Two-User Authorization Tests | each user only sees their own employees; cross-user GET/PUT/DELETE return 403; data unchanged |
| 7. Rate Limiting | repeats login until 429 |
| 8. Manual Tests - Database Stopped | 500 response and health check while MongoDB is stopped |
| 9. Deployed API (Vercel) | health, login, CRUD, 403 and 401 on the deployed URL |

How to run it:

1. Start MongoDB and the server with an **empty** `comp3123_assignment1` database.
2. In Postman, open the collection and click **Run** (Collection Runner) to run folders 0-8 in order.
   The test scripts save the tokens and ids in collection variables (`tokenA`, `tokenB`, `empA1_id`, ...).
   Their starting values are empty, so the file contains no real tokens.
3. Run folder 7 last. Restart the server before running the collection again (this resets the rate limit counters).

Manual tests:

- **Expired JWT (5.4 + 5.5):** start the server with `JWT_EXPIRES_IN=30s`, send 5.4, then 5.5. The script waits until
  the token has expired and the server answers 401 "Token has expired". With the normal `1h` setting 5.5 is skipped.
- **Database stopped (folder 8):** stop MongoDB (for example `docker stop comp3123-mongo`) and send 8.1 and 8.2:
  500 "Internal server error" and `"database": "disconnected"`.

Results (Postman collection run with Newman, Postman's command line runner):

- Local (MongoDB in Docker): 64 requests, **193/193 assertions passed**; expired JWT and database-stopped tests also passed.
- Deployed on Vercel (MongoDB Atlas): 78 requests, **207/207 assertions passed**.

The screenshots of the tests are in `screenshots/` and in `101496484_COMP3123_Assignment1_Screenshots.docx`.

## Sample credentials for marking

These are test accounts only (no real data). They already exist on the deployed API.
Locally they are created by folder 1 of the Postman collection.

| User | username | email | password |
|------|----------|-------|----------|
| User A | `alice` | `alice@example.com` | `AlicePass123` |
| User B | `bob` | `bob@example.com` | `BobPass123` |

## Vercel deployment

**URL:** https://101496484-comp3123-assignment1.vercel.app (try https://101496484-comp3123-assignment1.vercel.app/health)

- Vercel detects Express from `app.js`, which exports the app (`module.exports = app`). `server.js` is only used
  locally. The whole app runs as one Vercel Function.
- The database is a free MongoDB Atlas cluster. `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AUTH_RATE_LIMIT`
  and `API_RATE_LIMIT` are set as environment variables in the Vercel project (not in the code).
- Atlas Network Access allows `0.0.0.0/0`, because Vercel functions do not have fixed IP addresses.
  The database user has a long random password.
- **MongoDB connection reuse:** `config/db.js` keeps the connection promise in a variable, so a function instance
  connects once and reuses the connection for the next requests.
- **Logging:** console only on Vercel (no log files), see [Logging](#logging).
- **Rate limiting on Vercel:** the counters are in memory, so each function instance has its own counter.
  The limit still works (tested: 429 after 20 login attempts), but with several instances it is per instance.
  A real production app would use a shared store such as Redis.
- `app.set('trust proxy', 1)` is used on Vercel so `req.ip` is the real client IP (needed by the rate limiter).

Deploy steps (Vercel CLI):

```bash
npm i -g vercel
vercel link
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel deploy --prod
```

## Troubleshooting

- **`Could not connect to MongoDB`** at startup: MongoDB is not running or `MONGODB_URI` is wrong.
- **`listen EADDRINUSE`**: port 3000 is already used. Stop the other program or set another `PORT`.
- **`querySrv ECONNREFUSED`** with an Atlas `mongodb+srv://` URI on Windows: Node.js cannot use the computer's DNS
  server for SRV lookups. Try another network/DNS server or use Atlas's standard (non-SRV) connection string.
- **429 in Postman:** wait 15 minutes or restart the server.
