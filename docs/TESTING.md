# CareManager — Automated Testing & Verification Documentation

This document summarizes the test suite configuration, execution commands, and verified test cases for **CareManager**.

---

## 📊 Summary of Test Execution

| Test Suite | Test File Location | Execution Engine | Status | Tests Passed |
| :--- | :--- | :--- | :--- | :--- |
| **Concurrency & Slot Engine** | `tests/concurrency.test.ts` | `npx ts-node` | **PASSED** | **11 / 11** |
| **Clinical AI & Workflow** | `tests/workflow.test.ts` | `npx ts-node` | **PASSED** | **26 / 26** |
| **Frontend Production Build**| `frontend/` | `npm run build` (Vite) | **PASSED** | **1.59s / 0 errors** |

---

## 🛠️ Execution Commands

To execute the test suites locally, navigate to the `backend-node` directory and run:

```bash
# 1. Run Concurrency & Race Condition Test Suite
cd backend-node
npx ts-node tests/concurrency.test.ts

# 2. Run Clinical Workflow & AI Test Suite
cd backend-node
npx ts-node tests/workflow.test.ts

# 3. Run Frontend Production Compile Check
cd ../frontend
npm run build
```

---

## 🔒 1. Concurrency Test Suite breakdown (`concurrency.test.ts`)

The concurrency test suite validates double-booking prevention, atomic holds, slot validity, leaves, cancellation mechanics, and transactional rescheduling rollbacks.

### Verified Test Cases (11/11 Passed)

1. **[TEST 1] Standard Slot Booking**:
   - Patient A books an available slot within doctor working hours.
   - **Verification**: Appointment created successfully with status `BOOKED` and `active: true`.

2. **[TEST 2] Double-Booking Rejection**:
   - Patient B attempts to book the exact same slot already held by Patient A.
   - **Verification**: Rejected with HTTP `400 Bad Request` ("Requested slot is not available or is invalid.").

3. **[TEST 3] High-Throughput Simultaneous Race Condition (10 Concurrent Requests)**:
   - 10 distinct requests trigger `bookAppointment` concurrently for the same unbooked slot.
   - **Verification**: Exactly **1** request succeeds (Fulfilled Count: 1) and **9** are rejected (Rejected Count: 9). Database check verifies exactly 1 active appointment exists for that slot.

4. **[TEST 4] Doctor Leave Enforcement**:
   - Attempting to book a slot on a date listed in `DoctorLeave`.
   - **Verification**: Rejected with HTTP 400.

5. **[TEST 5] Working Hours Boundary Protection**:
   - Requesting a slot outside doctor's configured working schedule (e.g., 08:00 AM when working hours start at 09:00 AM).
   - **Verification**: Rejected with HTTP 400.

6. **[TEST 6] Invalid Slot Alignment Check**:
   - Requesting an unaligned slot timestamp (e.g. 09:15 AM for a doctor with 30-minute slot duration).
   - **Verification**: Rejected with HTTP 400.

7. **[TEST 7] Cancellation & Slot Rebooking**:
   - Patient A cancels an active appointment; Patient B immediately attempts to book the freed slot.
   - **Verification**: Appointment marked `CANCELLED` (`active: null`); Patient B successfully books the newly opened slot.

8. **[TEST 8] Expired Redis Slot Hold Safety**:
   - Patient A places a slot hold and waits for expiration TTL.
   - **Verification**: Once expired, Patient B can successfully book the slot without conflict.

9. **[TEST 9] Active Slot Hold Owner Verification**:
   - Patient A holds a slot in Redis; Patient B attempts to hold/book the same slot before TTL expires.
   - **Verification**: Redis rejects Patient B's hold attempt (`set` returns null); booking is denied.

10. **[TEST 10] Unauthorized Cancellation Defense**:
    - Patient B attempts to cancel Patient A's appointment.
    - **Verification**: Blocked with `403 Forbidden` ("Unauthorized to cancel this appointment.").

11. **[TEST 11] Rescheduling Transactional Rollback**:
    - Patient A attempts to reschedule an existing appointment to a slot already occupied by another patient.
    - **Verification**: Rejection caught ("New requested slot is not available or is invalid."). Original appointment remains intact, active, and status `BOOKED`.

---

## 🤖 2. Clinical Workflow Test Suite Breakdown (`workflow.test.ts`)

The workflow test suite validates end-to-end clinical operations from patient symptom intake to AI triage, doctor consultation notes, digital prescriptions, and failure resilience.

### Verified Test Cases (26/26 Passed)

1. **[TESTS 1 & 2] Symptom Submission & Pre-Visit AI Triage**:
   - Patient submits symptoms during appointment creation.
   - **Verification**: Pre-visit summary generated with `status: SUCCESS`, valid `urgency` level (`LOW`, `MEDIUM`, or `HIGH`), `chiefComplaint`, and `suggestedQuestions`.

2. **[TEST 3] Doctor Pre-Visit Summary Access**:
   - Assigned doctor views appointment details.
   - **Verification**: Doctor accesses patient symptoms, chief complaint, and AI triage recommendations.

3. **[TEST 4] Unauthorized Doctor Access Prevention**:
   - Unassigned Doctor C attempts to access Patient A's pre-visit summary.
   - **Verification**: Access denied with `403 Forbidden`.

4. **[TESTS 5, 6, 7 & 8] Consultation Completion, Prescriptions & Post-Visit AI**:
   - Assigned doctor submits SOAP notes, diagnosis, and prescription items (`medicineName`, `dosage`, `frequency`, `duration`, `instructions`).
   - **Verification**:
     - Consultation record created in database.
     - `Prescription` and `PrescriptionItem` rows persisted with matching structured fields.
     - `PostVisitSummary` generated with `status: SUCCESS` containing patient-friendly summary and medication schedule.
     - Patient can view post-visit summary on patient appointments dashboard.

5. **[TEST 9] LLM Connection Failure Resilience**:
   - Simulates external LLM API timeout during booking.
   - **Verification**: Appointment booking completes successfully (`status: BOOKED`); `PreVisitSummary` record is created with `status: FAILED` and error message recorded. System remains stable.

6. **[TEST 10] Malformed LLM Response Handling**:
   - Simulates LLM returning unparseable or non-JSON output.
   - **Verification**: Appointment remains valid; `PreVisitSummary` status is set to `FAILED` without throwing unhandled server exceptions.

7. **[TEST 11] Patient Consultation Submission Guard**:
   - Patient attempts to call doctor consultation endpoint directly.
   - **Verification**: Operation rejected with `403 Forbidden`.

8. **[TEST 12] AI Schema Validation Strictness**:
   - LLM returns missing required JSON fields (e.g. fewer than 3 `suggestedQuestions`).
   - **Verification**: Validation failure caught; summary marked as `FAILED` with exact validation error reason recorded.
