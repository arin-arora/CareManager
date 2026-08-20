# CareManager — Final Feature Checklist

This matrix lists all verified functional features implemented in the **CareManager** platform.

---

## 👤 Patient Features

- [x] **Account Authentication**: Sign up with complexity validation, login with JWT tokens, email verification flow, and password reset capability.
- [x] **Specialist Directory Search**: Filter active doctors by specialization (e.g. Cardiology, Dermatology).
- [x] **Interactive Slot Picker**: Date picker calendar displaying 30-minute available booking slots.
- [x] **5-Minute Live Slot Hold**: Automatic Redis reservation holding selected slot while completing symptom notes.
- [x] **Symptom Log Submission**: Chief complaint and symptom duration input during checkout.
- [x] **Patient Appointments Registry**: Tabbed overview (All, Upcoming, Completed) of booked appointments.
- [x] **AI Pre-Visit Triage Summary View**: View pre-visit urgency level and suggested doctor questions.
- [x] **Patient Post-Visit Summary View**: View patient-friendly post-consultation summaries and instructions.
- [x] **Medication Tracking & Reminders**: Active prescription list with automated reminder status management.

---

## 🩺 Doctor Features

- [x] **Doctor Workspace Schedule**: Comprehensive dashboard listing daily assigned patient appointments.
- [x] **Patient Pre-Visit Triage Inspection**: Access patient symptom logs and AI-generated urgency rating before appointment starts.
- [x] **SOAP Consultation Workbench**: Digital input form for subjective/objective clinical notes and diagnosis.
- [x] **Digital Prescription Builder**: Add structured medications with medicine name, dosage, frequency, duration, and instructions.
- [x] **Follow-Up Appointment Planning**: Set target follow-up date and clinical instructions.
- [x] **Working Hours Configuration**: Configurable start/end daily hours and custom slot durations (e.g., 30 mins).
- [x] **Doctor Leave Management**: Block out full dates for doctor leave.

---

## 🛡️ Admin Features

- [x] **Operations Console Dashboard**: Overview of system statistics (total users, active doctors, total appointments).
- [x] **Doctor Profile Onboarding**: Form to register new doctor profiles with initial specializations and working schedules.
- [x] **Doctor Activation / Deactivation Toggle**: Enable or disable doctor profiles from directory listing.
- [x] **System Diagnostics & Outbox Monitoring**: Monitor API health and inspect outbox job queues.

---

## ⚙️ Appointment Engine Features

- [x] **Atomic Double-Booking Protection**: PostgreSQL unique constraint lock (`@@unique([doctorId, dateTime, active])`) guaranteeing zero double-bookings.
- [x] **Redis Slot Holding Service**: In-memory distributed lock using `SET key val PX 300000 NX`.
- [x] **Atomic Lua Lock Release**: Script verifying owner identity before releasing held Redis keys.
- [x] **Appointment Cancellation**: Cancellation flow marking appointment `CANCELLED` (`active: null`) and freeing the slot for rebooking.
- [x] **Rescheduling Engine with Rollback**: Single-transaction rescheduling that cancels the old appointment and reserves the new slot, rolling back cleanly on conflict.
- [x] **Working Hours & Leave Validation**: Pre-booking schedule validation asserting slot falls within active working hours and non-leave days.

---

## 🤖 AI Clinical Workflow Features

- [x] **Asynchronous Pre-Visit Triage**: Automatic AI summary generation triggered upon appointment creation.
- [x] **Structured LLM Prompts & JSON Parsing**: Strict system prompts producing validated JSON schemas.
- [x] **Multi-Provider Fallback**: Support for Groq API (`llama-3.3-70b-versatile`), Google Gemini API (`gemini-1.5-flash`), or Mock provider.
- [x] **AI Failure Resilience**: Failure isolation ensuring LLM API timeouts or malformed JSON responses do not block appointment booking or crash backend services.
- [x] **Post-Visit Patient Summary Generation**: LLM pipeline translating complex physician SOAP notes into plain-language patient summaries.

---

## 🏗️ Infrastructure & Notifications

- [x] **Transactional Outbox Worker**: Background processor polling `OutboxNotification` table every 10 seconds for reliable delivery.
- [x] **Nodemailer / Resend Email Integration**: Email notification service for booking confirmations, cancellations, and reschedules.
- [x] **Prisma ORM & PostgreSQL Database**: Type-safe relational schema management with 10 tables and relations.
- [x] **Environment Variable Configuration**: Centralized environment variable support across frontend and backend.
- [x] **Vite Build Optimization**: Production Single-Page Application bundle generation.

---

## 🧪 Testing Features

- [x] **Concurrency & Race Condition Test Suite**: `tests/concurrency.test.ts` (11/11 tests passed).
- [x] **Clinical Workflow & AI Test Suite**: `tests/workflow.test.ts` (26/26 tests passed).
- [x] **Production Compilation Verification**: Clean `npm run build` pass (1.59s / 0 errors).
