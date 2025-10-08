# 1) Executive Summary
This document outlines the backend development plan for the MindBloom application, a cognitive wellness platform. The backend will be built using FastAPI and MongoDB Atlas, adhering to the constraints of no Docker, frontend-driven manual testing, and a `main`-only Git workflow. The plan is structured into a dynamic number of sprints to cover all features observed in the existing frontend, ensuring a scalable and maintainable architecture.

# 2) In-scope & Success Criteria
- **In-scope:**
  - User registration and authentication (signup, login, logout).
  - Storage and retrieval of user profile data, including preferences and cognitive conditions.
  - Adaptive exercise session management based on user's mood and focus areas.
  - Tracking and storage of user progress, including session history, streaks, and performance metrics.
  - API endpoints to support the dashboard, training, and progress pages.
- **Success criteria:**
  - All frontend features are fully supported by the backend.
  - Each sprint's deliverables pass manual testing via the UI.
  - The backend is successfully deployed and connected to the frontend.
  - Code is committed and pushed to the `main` branch after each successful sprint.

# 3) API Design
- **Conventions:**
  - Base path: `/api/v1`
  - Errors will return a consistent JSON object: `{"detail": "Error message"}`.
- **Endpoints:**
  - **Auth**
    - `POST /api/v1/auth/signup`: Register a new user.
      - Request: `{ "name": "string", "email": "string", "password": "string", "ageGroup": "string", "cognitiveConditions": ["string"], "otherCondition": "string", "reminderTime": "string" }`
      - Response: `{ "access_token": "string", "token_type": "bearer" }`
    - `POST /api/v1/auth/login`: Authenticate a user.
      - Request: `{ "username": "string", "password": "string" }` (Note: username is the email)
      - Response: `{ "access_token": "string", "token_type": "bearer" }`
    - `GET /api/v1/auth/me`: Get the current user's data.
      - Response: User object.
  - **Users**
    - `GET /api/v1/users/me`: Get the current user's profile.
      - Response: User object.
  - **Training**
    - `POST /api/v1/training/session`: Start a new training session.
      - Request: `{ "mood": "string", "focusAreas": ["string"] }`
      - Response: `{ "sessionId": "string", "exercises": ["object"] }`
    - `POST /api/v1/training/session/{sessionId}/complete`: Complete a training session.
      - Request: `{ "results": ["object"] }`
      - Response: `{ "message": "Session completed successfully" }`
  - **Progress**
    - `GET /api/v1/progress`: Get the user's progress data.
      - Response: `{ "summary": "object", "history": ["object"] }`

# 4) Data Model (MongoDB Atlas)
- **Collections:**
  - **users**
    - `_id`: ObjectId
    - `name`: string, required
    - `email`: string, required, unique
    - `hashed_password`: string, required
    - `ageGroup`: string
    - `cognitiveConditions`: array of strings
    - `otherCondition`: string
    - `reminderTime`: string
    - `streak`: integer, default 0
    - `totalSessions`: integer, default 0
    - `createdAt`: datetime, default now
    - *Example Document:*
      ```json
      {
        "_id": "60c72b9f9b1d8b001f8e4bde",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "hashed_password": "...",
        "ageGroup": "50-59",
        "cognitiveConditions": ["mild-memory"],
        "reminderTime": "morning",
        "streak": 5,
        "totalSessions": 12,
        "createdAt": "2023-01-15T10:00:00Z"
      }
      ```
  - **training_sessions**
    - `_id`: ObjectId
    - `userId`: ObjectId, ref: 'users'
    - `mood`: string
    - `focusAreas`: array of strings
    - `exercises`: array of objects
    - `averageScore`: float
    - `duration`: integer (minutes)
    - `completedAt`: datetime, default now
    - *Example Document:*
      ```json
      {
        "_id": "60c72b9f9b1d8b001f8e4bdf",
        "userId": "60c72b9f9b1d8b001f8e4bde",
        "mood": "motivated",
        "focusAreas": ["memory", "attention"],
        "exercises": [
          {"exerciseId": "memory", "score": 85},
          {"exerciseId": "attention", "score": 90}
        ],
        "averageScore": 87.5,
        "duration": 10,
        "completedAt": "2023-05-20T09:15:00Z"
      }
      ```

# 5) Frontend Audit & Feature Map
- **Routes/Components:**
  - `Registration.tsx`: User creation.
    - Backend: `POST /api/v1/auth/signup`, `users` model.
  - `SignIn.tsx`: User login.
    - Backend: `POST /api/v1/auth/login`.
  - `Dashboard.tsx`: Main user dashboard.
    - Backend: `GET /api/v1/users/me`, `training_sessions` model.
  - `Training.tsx`: Active exercise session.
    - Backend: `POST /api/v1/training/session`, `POST /api/v1/training/session/{sessionId}/complete`.
  - `Progress.tsx`: User progress and analytics.
    - Backend: `GET /api/v1/progress`, `training_sessions` model.
- **Forms:**
  - Registration form: Collects name, email, age group, cognitive conditions.
  - Login form: Collects email and password.
- **Async Needs:**
  - All interactions with the backend are async (fetching user data, starting/completing sessions).

# 6) Configuration & ENV Vars (core only)
- `APP_ENV`: "development"
- `PORT`: 8000
- `MONGODB_URI`: (user provided)
- `JWT_SECRET`: (randomly generated string)
- `JWT_EXPIRES_IN`: 3600
- `CORS_ORIGINS`: "http://localhost:5173" (or frontend URL)

# 9) Testing Strategy (Manual via Frontend)
- **Policy:** All backend features will be validated by interacting with the connected frontend. Network tab in browser DevTools will be used to inspect API requests and responses.
- **Per-sprint Manual Test Checklist (Frontend):** Each sprint will include a specific checklist of UI actions to perform.
- **User Test Prompt:** Each sprint will include a short, clear prompt for a non-technical user to test the implemented features.
- **Post-sprint:** If all tests pass, changes will be committed and pushed to the `main` branch on GitHub.

# 10) Dynamic Sprint Plan & Backlog (S0…Sn)
- **S0 - Environment Setup & Frontend Connection**
  - **Objectives:**
    - Create a basic FastAPI application with `/api/v1` base path and a `/healthz` endpoint.
    - Prompt the user for the `MONGODB_URI` and configure it.
    - Implement `/healthz` to check database connectivity.
    - Enable CORS for the frontend origin.
    - Connect the frontend to the backend by updating the API base URL.
    - Initialize a Git repository and push the initial setup to GitHub.
  - **Definition of Done:**
    - The backend runs locally, and the `/healthz` endpoint returns a successful response indicating DB connectivity.
    - The frontend can make API calls to the backend.
    - The project is on GitHub with `main` as the default branch.
  - **Manual Test Checklist (Frontend):**
    - Start the backend server.
    - Open the frontend application in the browser.
    - Check the browser's developer console and network tab to confirm successful API calls to `/healthz`.
  - **User Test Prompt:**
    - "Please run the application and confirm that the main page loads without any connection errors."
  - **Post-sprint:**
    - Commit changes and push to `main`.

- **S1 - Basic Auth (signup, login, logout)**
  - **Objectives:**
    - Implement user signup, login, and logout functionality.
    - Protect the `/api/v1/users/me` endpoint to require authentication.
  - **Endpoints:**
    - `POST /api/v1/auth/signup`
    - `POST /api/v1/auth/login`
    - `GET /api/v1/auth/me`
  - **Tasks:**
    - Create the `users` collection in MongoDB.
    - Use Argon2 for password hashing.
    - Implement JWT-based authentication.
  - **Definition of Done:**
    - A new user can register through the frontend.
    - A registered user can log in and out.
    - Unauthorized users cannot access protected routes.
  - **Manual Test Checklist (Frontend):**
    - Navigate to the registration page and create a new account.
    - Log out.
    - Log back in with the new credentials.
    - Verify that you can access the dashboard.
    - Attempt to access the dashboard after logging out to ensure it's protected.
  - **User Test Prompt:**
    - "Please create an account, log out, and log back in to ensure the authentication system is working correctly."
  - **Post-sprint:**
    - Commit changes and push to `main`.

- **S2 - Training Session Management**
  - **Objectives:**
    - Implement the logic for creating and managing training sessions.
    - Store session data, including exercises and results.
  - **Endpoints:**
    - `POST /api/v1/training/session`
    - `POST /api/v1/training/session/{sessionId}/complete`
  - **Tasks:**
    - Create the `training_sessions` collection.
    - Develop the adaptive logic for selecting exercises based on mood and focus areas.
  - **Definition of Done:**
    - Users can start a training session from the dashboard.
    - Session results are saved to the database upon completion.
  - **Manual Test Checklist (Frontend):**
    - Log in and start a new training session from the dashboard.
    - Complete a few exercises.
    - Finish the session and verify that you are redirected to the session complete page.
  - **User Test Prompt:**
    - "Please start and complete a training session to ensure your progress is being saved."
  - **Post-sprint:**
    - Commit changes and push to `main`.

- **S3 - Progress Tracking and Display**
  - **Objectives:**
    - Implement the endpoint to retrieve user progress data.
    - Aggregate data from `training_sessions` to provide analytics.
  - **Endpoints:**
    - `GET /api/v1/progress`
  - **Tasks:**
    - Create the logic to calculate trends and statistics for the progress page.
  - **Definition of Done:**
    - The progress page on the frontend is populated with data from the backend.
  - **Manual Test Checklist (Frontend):**
    - After completing a few training sessions, navigate to the progress page.
    - Verify that the charts and stats reflect your recent activity.
  - **User Test Prompt:**
    - "Please check the progress page to see if your performance history is displayed correctly."
  - **Post-sprint:**
    - Commit changes and push to `main`.