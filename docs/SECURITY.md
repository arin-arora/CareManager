# CareManager — Security Architecture & Hardening Document

This document outlines the security controls, authentication mechanisms, authorization boundaries, and data protection policies implemented in **CareManager**.

---

## 🔒 1. Authentication & Identity Management

- **Password Hashing**: User passwords are never stored in plaintext. Passwords are hashed using `bcryptjs` with 10 salt rounds (`bcrypt.hash(password, 10)`).
- **JSON Web Tokens (JWT)**: Authentication utilizes signed HTTP Bearer JWT tokens with a 7-day expiration (`jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })`).
- **Email Verification**: User registration generates crypto-secure 32-byte hexadecimal activation tokens stored with expiration timestamps (`verificationTokenExpires`).
- **Password Reset Flow**: Password reset requests issue time-limited tokens (1-hour validity) sent via transactional email.

---

## 🛡️ 2. Role-Based Access Control (RBAC)

The system enforces three user roles via the `authorize` middleware:

1. **`PATIENT`**:
   - Authorized: Search doctors, hold slots, book appointments, view own appointments/summaries, manage medication reminders.
   - Denied: Access doctor consultation endpoints (returns `403 Forbidden`), access admin routes, view appointments belonging to other patients.

2. **`DOCTOR`**:
   - Authorized: View assigned patient schedules, view pre-visit triage summaries, complete consultation notes, write structured prescriptions, set follow-up schedules.
   - Denied: Complete consultations for appointments assigned to other physicians (checked via `app.doctor.userId !== req.user.id`), access admin routes.

3. **`ADMIN`**:
   - Authorized: Access `/api/admin/*` management routes, create/update doctor profiles, manage leaves, view all global appointment registries.

---

## 🔐 3. Resource Ownership & Data Access Boundaries

Every data retrieval or modification endpoint performs explicit identity verification:

- **`GET /api/appointments/:id`**: Rejects requests unless `req.user.id` matches the appointment's `patientId`, the assigned doctor's `userId`, or the user is an `ADMIN`.
- **`POST /api/appointments/:id/cancel`**: Rejects cancellation attempts by non-owner patients with `403 Forbidden` ("Unauthorized to cancel this appointment.").
- **`POST /api/doctors/appointments/:id/consultation`**: Rejects non-assigned doctors with `403 Forbidden` ("Unauthorized. Only the assigned doctor can complete this consultation.").

---

## 🌐 4. Data Protection & Secrets Handling

- **Secrets Isolation**: Real API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`) are stored strictly inside `.env` files which are excluded from version control via `.gitignore`.
- **Safe Environment Templates**: `.env.example` files contain variable names and fake placeholders only.
- **Frontend Variable Exposure**: Frontend Vite build accesses only `VITE_API_URL`. Backend secrets are never bundled in client assets.
- **Error Message Sanitization**: Production API responses catch internal server errors and return generic error messages (`{ "msg": "Server error" }`), preventing leakage of stack traces, database schemas, or internal file paths.
