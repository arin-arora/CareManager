# CareManager — API Specification Document

This document lists all RESTful API endpoints available on the **CareManager** backend service (`http://localhost:5051`).

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register new patient user |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/verify-email` | Public | Verify user email via token |
| `POST` | `/api/auth/resend-verification` | Public | Resend email activation link |
| `POST` | `/api/auth/forgot-password` | Public | Initiate password reset request |
| `POST` | `/api/auth/reset-password` | Public | Reset password using reset token |
| `GET` | `/api/auth/user` | Authenticated | Retrieve authenticated user profile |

---

## 2. Doctor Endpoints (`/api/doctors`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Authenticated | Search active doctor profiles by specialty |
| `GET` | `/api/doctors/:id` | Authenticated | Get detailed doctor profile |
| `GET` | `/api/doctors/:id/slots` | Authenticated | Get available 30-minute booking slots (`?date=YYYY-MM-DD`) |
| `POST` | `/api/doctors/appointments/:id/consultation` | Doctor Only | Complete SOAP consultation notes & digital prescription |

---

## 3. Appointment Endpoints (`/api/appointments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments/hold` | Authenticated | Temporarily reserve a slot for 5 minutes in Redis |
| `POST` | `/api/appointments` | Authenticated | Book a held/available appointment slot |
| `POST` | `/api/appointments/:id/reschedule` | Owner / Admin | Reschedule an appointment to a new slot |
| `POST` | `/api/appointments/:id/cancel` | Owner / Admin | Cancel a booked appointment |
| `GET` | `/api/appointments/patient` | Patient Only | List appointments for logged-in patient |
| `GET` | `/api/appointments/doctor` | Doctor Only | List assigned appointments for logged-in doctor |
| `GET` | `/api/appointments/admin` | Admin Only | List all global appointments |
| `GET` | `/api/appointments/:id` | Owner / Admin | Get detailed appointment view with summaries |
| `POST` | `/api/appointments/:id/pre-visit-summary/retry` | Owner / Admin | Retry pre-visit AI summary generation |
| `POST` | `/api/appointments/:id/post-visit-summary/retry` | Owner / Admin | Retry post-visit AI summary generation |

---

## 4. Admin Operations Endpoints (`/api/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/doctors` | Admin Only | Create a new doctor profile & user account |
| `PUT` | `/api/admin/doctors/:id` | Admin Only | Update doctor specialisation, schedule, or status |
| `GET` | `/api/admin/doctors` | Admin Only | List all doctor profiles (active & inactive) |
| `POST` | `/api/admin/doctors/:id/leave` | Admin Only | Record doctor leave for a specific date |
| `DELETE` | `/api/admin/doctors/:id/leave/:date` | Admin Only | Cancel a registered doctor leave |

---

## 5. System Health Endpoints (`/api/health`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status check (Database & Timestamp) |
| `POST` | `/api/health/run-diagnostics` | Public | Run full database, Redis, and AI diagnostics |
