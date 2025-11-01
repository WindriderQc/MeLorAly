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
