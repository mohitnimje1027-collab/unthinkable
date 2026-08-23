# Society Maintenance Tracker — System Design

**Word Count: ~780 words**

---

## Overview

The Society Maintenance Tracker is a role-based web application that helps apartment societies manage maintenance complaints end-to-end. The system handles complaint submission, lifecycle tracking, overdue detection, photo storage, and resident notifications through a RESTful API backed by PostgreSQL.

---

## Complaint History Model

The core of the system is the **immutable status history log**. Every complaint begins in the `Open` state, and every subsequent status transition — whether to `In Progress` or `Resolved` — is permanently recorded in a separate `complaint_history` table rather than overwriting a single field.

Each history record captures:
- **Status** at the time of change
- **Timestamp** (`changed_at`, default `NOW()`)
- **Actor** (`changed_by` FK → users) — the admin who made the change
- **Note** — an optional free-text explanation from the admin

This design preserves the complete audit trail, enabling features like timeline views for residents and accountability tracking for admins. The `complaints.status` column is always the current state (for fast queries), while `complaint_history` holds the full story.

When a complaint reaches `Resolved`, the backend rejects further status updates — enforcing the closed lifecycle. The history record for the final transition remains queryable forever.

**Why a separate table?** Storing history as JSONB in the complaints row would make querying, indexing, and joining on history attributes (e.g., "who resolved it?") expensive. A normalized `complaint_history` table allows efficient queries with standard SQL joins.

---

## Overdue Detection

Overdue detection is **threshold-based** with a configurable environment variable (`OVERDUE_DAYS`, default 7). A complaint is considered overdue if:

```
complaint.status != 'Resolved'
AND complaint.created_at < NOW() - INTERVAL '7 days'
```

The system exposes a dedicated endpoint (`POST /api/complaints/detect-overdue`) that admins can trigger manually from the dashboard. When called, it:

1. Queries all unresolved complaints older than the threshold
2. Sets `is_overdue = true` on each matching complaint
3. Returns the count of newly flagged items

In the admin view, overdue complaints are sorted to the **top** of the list (`ORDER BY is_overdue DESC`) with a red visual indicator. This surfacing strategy ensures critical items are never buried.

**Future enhancement:** A nightly cron job (e.g., via node-cron or a scheduled Render service) could automate this detection without manual triggers.

---

## Photo Handling

Photo uploads are handled via **Multer** middleware on the backend. The design decisions are:

1. **Storage**: Files are saved to a local `uploads/` directory on the server (excluded from git via `.gitignore`). In production, this would be replaced with **AWS S3** or **Cloudinary** for durability and CDN delivery.

2. **Naming**: Each file is assigned a unique name using `Date.now() + random()` to prevent collisions and avoid exposing original filenames.

3. **Validation**: Only image MIME types (jpeg, jpg, png, gif, webp) up to **5MB** are accepted. Invalid uploads are rejected before reaching the controller.

4. **Access**: Uploaded files are served as static assets via Express's `express.static` middleware at `/uploads/...`. The stored `photo_url` in the database is the relative path.

5. **Optional**: Photo is entirely optional on complaint submission — the field is nullable in the schema.

This approach keeps the implementation simple for the scope of this project while being architecturally ready for cloud storage migration via a single-line storage adapter swap.

---

## Notification Flow

Email notifications use **Nodemailer** with Gmail SMTP (free tier, configurable). Two events trigger emails:

### 1. Complaint Status Change
When an admin updates a complaint's status:
- The `complaintController` calls `updateComplaintStatus` → on success, fetches the resident's email via `findUserById`
- Calls `emailService.sendStatusUpdate(resident, complaint, note)`
- The email includes the new status (color-coded), the admin's note, and a portal link

### 2. Important Notice Posted
When an admin creates a notice marked `is_important: true`:
- The `noticeController` fetches all resident emails via `getAllResidentEmails()`
- Calls `emailService.sendImportantNotice(residents, notice)` — iterates and sends to each

### Resilience
Email failures are caught and logged without crashing the API response. The resident's complaint is still updated even if the email fails. This **fire-and-forget** pattern (with logging) is appropriate for a notification service where delivery failure is non-critical.

The `emailService` checks for `EMAIL_USER` and `EMAIL_PASS` environment variables before attempting to send — allowing the application to run fully in development without email credentials configured.

---

## API Design

The API follows RESTful conventions with clear resource nesting. Role-based access control is enforced via JWT middleware:
- `authenticate` — validates the Bearer token
- `requireAdmin` — enforces admin-only routes

All responses follow a consistent JSON envelope `{ data | error }` pattern.

---

## Database Indexing Strategy

Key indexes are created for performance:
- `idx_complaints_user_id` — fast resident-specific queries
- `idx_complaints_status`, `idx_complaints_category` — fast admin filters
- `idx_complaints_is_overdue` — fast overdue surfacing
- `idx_history_complaint_id` — fast timeline retrieval per complaint
