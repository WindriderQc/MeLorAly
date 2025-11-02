# Onboarding Routes

## GET /onboarding/welcome
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** Renders the `onboarding/welcome` view.
- **Validation:** None

## GET /onboarding/children
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** Renders the `onboarding/children` view.
- **Validation:** None

## POST /onboarding/children
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "children": [
      {
        "name": "string",
        "birthDate": "date",
        "grade": "string"
      }
    ]
  }
  ```
- **Response:** Redirects to `/onboarding/adults` on success, or re-renders the `onboarding/children` view with errors on failure.
- **Validation:** `childrenValidator`

## GET /onboarding/adults
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** Renders the `onboarding/adults` view.
- **Validation:** None

## POST /onboarding/adults
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "adults": [
      {
        "email": "string",
        "role": "string"
      }
    ]
  }
  ```
- **Response:** Redirects to `/onboarding/family-space` on success, or re-renders the `onboarding/adults` view with errors on failure.
- **Validation:** `adultsValidator`

## GET /onboarding/family-space
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** Renders the `onboarding/family-space` view.
- **Validation:** None

## POST /onboarding/family-space
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "familyName": "string"
  }
  ```
- **Response:** Redirects to `/onboarding/ready` on success, or re-renders the `onboarding/family-space` view with errors on failure.
- **Validation:** `familySpaceValidator`

## GET /onboarding/ready
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** Redirects to `/dashboard` on success, or `/onboarding/welcome` on failure.
- **Validation:** None

---

# Education Routes

## GET /education
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** Renders the education index with age filters, recommended activities, and completion statistics.
- **Validation:** None (CSRF token injected for subsequent POST requests).

## GET /education/activity/:id
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** Renders the detailed activity view (description, objectives, materials, steps, tips, progress controls).
- **Validation:** Returns 404 if the activity identifier is unknown.

## POST /education/activity/:id/complete
- **Auth Required:** Yes
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "childId": "uuid",
    "completed": true
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Activité marquée comme terminée.",
    "completion": {
      "activityId": "string",
      "childId": "uuid",
      "completedAt": "2025-01-12T10:45:00.000Z",
      "durationMinutes": 25
    }
  }
  ```
- **Validation:**
  - Ensures `childId` belongs to the authenticated user's family.
  - `completed` defaults to `true`; set to `false` to remove the completion record.
  - CSRF token required via `X-CSRF-Token` header.

---

# Notification Routes

## GET /notifications/latest
- **Auth Required:** Yes
- **Request Body:** None
- **Response (200):**
  ```json
  {
    "success": true,
    "notifications": [
      {
        "id": "uuid",
        "title": "string",
        "message": "string",
        "type": "info|success|warning|alert",
        "read": false,
        "created_at": "2025-01-12T10:30:00.000Z"
      }
    ]
  }
  ```
- **Notes:** Returns the 10 most recent notifications ordered by `created_at` descending.

## POST /notifications/:id/read
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** `{ "success": true }` on success.
- **Validation:** Ensures the notification belongs to the authenticated user. Requires `X-CSRF-Token` header.

## POST /notifications/mark-all
- **Auth Required:** Yes
- **Request Body:** None
- **Response:** `{ "success": true }` on success.
- **Validation:** Marks all unread notifications for the user as read. Requires `X-CSRF-Token` header.

---

# Support Routes

## POST /contact/send
- **Auth Required:** No
- **Content-Type:** `application/x-www-form-urlencoded`
- **Request Body Parameters:**
  - `name` (string, required)
  - `email` (string, required)
  - `subject` (string, required)
  - `message` (string, required)
- **Response:** Redirects back to `/contact` with success or error flash messages.
- **Behavior:**
  - Persists the request in the `contact_requests` table (links to the authenticated user when available).
  - Attempts to send an email via SMTP when environment variables are configured; otherwise logs to stdout.
  - Requires CSRF token (hidden input `_csrf`) provided by the rendered form.
