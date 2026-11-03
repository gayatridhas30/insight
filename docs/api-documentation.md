# InsightLoop — RESTful API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Content Type: `application/json`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Register a new host or organizer account and initialize an organization.
- **Body**:
  ```json
  {
    "name": "Prof. Ananya Sharma",
    "email": "organizer@college.edu",
    "password": "Password123!",
    "organizationName": "MIT Pune Tech Council",
    "category": "college"
  }
  ```
- **Response**: `201 Created` with JWT token, user object, and created organization.

### `POST /api/auth/login`
Authenticate user with email and password.
- **Body**:
  ```json
  {
    "email": "organizer@mitpune.edu",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` with JWT token, user details, organizations list, and activeOrganization.

### `GET /api/auth/me`
Fetch currently authenticated user profile and membership roster.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`.

### `PUT /api/auth/profile`
Update user name, phone, or language/theme preferences.

---

## 2. Organization Management (`/api/organizations`)

- `GET /api/organizations/my`: List all organizations user belongs to.
- `POST /api/organizations`: Create new organization (assigns caller as owner).
- `GET /api/organizations/:orgId`: Retrieve organization metadata and member roster.
- `POST /api/organizations/:orgId/invite`: Invite co-host or member by email.
- `PUT /api/organizations/:orgId/members/:memberId`: Update member role (`admin`, `member`, `analyst`).
- `DELETE /api/organizations/:orgId/members/:memberId`: Remove member from organization.

---

## 3. Event Management (`/api/events`)

- `GET /api/events`: List events for current organization with category, status, and search filters.
- `POST /api/events`: Create new event. Auto-generates unique short code (e.g. `HACK-2026`) and default feedback form.
- `GET /api/events/:id`: Full details of an event including sessions, form metadata, response counts, and QR code data.
- `GET /api/events/code/:code`: **Public endpoint (No auth required)**. Retrieves event info and feedback form for attendees.
- `PUT /api/events/:id`: Update event title, status, location, feedback deadlines, or toggle `isFeedbackOpen`.
- `DELETE /api/events/:id`: Delete event and cascade cleanup.
- `POST /api/events/:id/sessions`: Add scheduled session/agenda item.
- `POST /api/events/compare`: Compare 2-3 events side-by-side with ratings, sentiment scores, and response volume.

---

## 4. Dynamic Feedback Forms (`/api/forms`)

- `GET /api/forms/event/:eventId`: Retrieve form configuration and questions.
- `GET /api/forms/event/:eventId/public`: Public access to form questions.
- `PUT /api/forms/event/:eventId/settings`: Update settings (`isAnonymousAllowed`, `allowVoiceFeedback`, `allowDuplicateSubmissions`, `supportedLanguages`).
- `PUT /api/forms/event/:eventId/questions`: Save dynamic questions (reordering, Star rating, NPS, single/multi choice, text).
- `POST /api/forms/event/:eventId/ai-generate`: AI-assisted generation of tailored questions based on event category.

---

## 5. Public Feedback Collection (`/api/feedback`)

### `POST /api/feedback/submit`
**Public endpoint (No login required)**. Allows attendees to submit feedback.
- **Body**:
  ```json
  {
    "eventCode": "HACK-2026",
    "submissionLanguage": "mr",
    "isAnonymous": true,
    "answers": [
      {
        "questionId": "65bc1234...",
        "questionType": "star_rating",
        "ratingValue": 5
      },
      {
        "questionId": "65bc5678...",
        "questionType": "long_text",
        "textResponse": "हॅकाथॉनचे आयोजन खूप छान होते."
      }
    ]
  }
  ```
- **Response**: `201 Created` with estimated sentiment polarity and confirmation receipt. Triggers async AI pipeline.

### `GET /api/feedback/event/:eventId`
Protected endpoint for organizers to view paginated responses with sentiment and language filters.

---

## 6. AI Intelligence & RAG (`/api/ai`)

- `POST /api/ai/events/:eventId/analyze`: Run NLP pipeline on event responses. Computes sentiment summary, theme extraction, recurring issue detection, positive highlights, and actionable recommendations.
- `GET /api/ai/events/:eventId/analysis`: Retrieve latest analysis and recommendations.
- `POST /api/ai/rag/query`: Natural language vector Q&A scoped to organization.
  ```json
  {
    "organizationId": "65bc0001...",
    "query": "What were the biggest problems in my previous events?"
  }
  ```

---

## 7. Improvement Tracker (`/api/tasks`)

- `GET /api/tasks`: List improvement tasks with status (`todo`, `in_progress`, `completed`, `verified`), priority, and event filters.
- `POST /api/tasks`: Create task manually or convert from an AI recommendation.
- `PUT /api/tasks/:id`: Update status, assignee, or notes.
- `DELETE /api/tasks/:id`: Remove task.

---

## 8. Bhashini Integration (`/api/bhashini`)

- `GET /api/bhashini/status`: Provider config, live credentials status, and supported Indian languages (`en`, `hi`, `mr`, `ta`, `te`, `gu`, `kn`, `bn`).
- `POST /api/bhashini/translate`: Multilingual translation between supported languages.
- `POST /api/bhashini/transcribe`: Speech-to-text (ASR) audio processing.

---

## 9. Reports & Exports (`/api/reports`)

- `GET /api/reports/events/:eventId/pdf`: Download formatted Executive Summary PDF.
- `GET /api/reports/events/:eventId/excel`: Download structured Excel (.xlsx) data sheet.

---

## 10. Platform Administration (`/api/admin`)

- `GET /api/admin/stats`: Universal platform metrics.
- `GET /api/admin/users`: User management table.
- `PUT /api/admin/users/:id/toggle-status`: Suspend or activate user.
- `GET /api/admin/organizations`: Organization management.
- `GET /api/admin/events`: Platform-wide event feed.
- `GET /api/admin/audit-logs`: System audit trail.
