# SkillCompass — REST API Architecture

## 1. Overview & Architectural Principles

The SkillCompass backend exposes a clean, synchronous REST API built with FastAPI. It strictly separates request validation (Pydantic v2), route handling, and domain business logic.

### 1.1 Base URL & Versioning
All endpoints are prefixed with the `/api/v1` namespace:
```
http://localhost:8000/api/v1
```

### 1.2 Authentication Assumption for 24-Hour MVP
To eliminate complex JWT refresh flows, third-party OAuth redirect bugs, and setup friction during demo evaluation, the MVP employs **Header-Based Demo Identity**:
- The client passes an `X-User-Id` header containing the user's UUID with requests.
- A pre-seeded mock user (e.g., `user_id = 00000000-0000-0000-0000-000000000001`) is initialized upon database seeding.
- The `get_current_user` dependency in `app/api/deps.py` extracts this ID and verifies its existence in the database.

---

## 2. Standard Response & Error Envelopes

### 2.1 Success Response Envelope
All non-collection endpoints return standard JSON objects. Collections return direct JSON arrays or paginated wrappers.

### 2.2 Error Response Format
All errors follow RFC 7807 problem details:
```json
{
  "detail": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Assessment with id 'f3c4...' was not found or has expired.",
    "field": "assessment_id"
  }
}
```

Common HTTP status codes used:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully initialized.
- `400 Bad Request`: Payload validation failed or business rule violated.
- `404 Not Found`: Entity not found.
- `422 Unprocessable Entity`: Pydantic schema validation error.
- `500 Internal Server Error`: Unhandled server exception.

---

## 3. Endpoints Specification

### 3.1 Roles & Taxonomy

#### `GET /api/v1/roles`
- **Purpose:** Retrieve all available benchmark roles for the role selection screen.
- **Request Body:** None.
- **Response Body (`200 OK`):**
```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "Junior Data Scientist",
    "description": "Foundational data science role focusing on Python, exploratory data analysis, and predictive modeling.",
    "competency_count": 6
  }
]
```

#### `GET /api/v1/roles/{id}`
- **Purpose:** Fetch detailed competency requirements and benchmark scores for a specific role.
- **Request Body:** None.
- **Response Body (`200 OK`):**
```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "title": "Junior Data Scientist",
  "description": "Foundational data science role...",
  "requirements": [
    {
      "competency_id": "22222222-2222-2222-2222-222222222201",
      "competency_name": "Python Basics",
      "category": "Programming",
      "required_score": 80,
      "weight": 1.0
    },
    {
      "competency_id": "22222222-2222-2222-2222-222222222202",
      "competency_name": "Data Structures & Algorithms",
      "category": "Computer Science",
      "required_score": 75,
      "weight": 1.0
    }
  ]
}
```

---

### 3.2 User & Profile

#### `POST /api/v1/users`
- **Purpose:** Create or initialize a demo user session.
- **Request Body:**
```json
{
  "email": "alex.chen@example.com",
  "full_name": "Alex Chen",
  "target_role_id": "11111111-1111-1111-1111-111111111111"
}
```
- **Response Body (`201 Created`):**
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "email": "alex.chen@example.com",
  "full_name": "Alex Chen",
  "target_role_id": "11111111-1111-1111-1111-111111111111",
  "created_at": "2026-09-21T12:00:00Z"
}
```

#### `PUT /api/v1/users/{id}/target-role`
- **Purpose:** Update the user's selected target role.
- **Request Body:**
```json
{
  "role_id": "11111111-1111-1111-1111-111111111111"
}
```
- **Response Body (`200 OK`):** Updated user profile object.

---

### 3.3 Diagnostic Assessment

#### `POST /api/v1/assessment/start`
- **Purpose:** Initialize a new diagnostic assessment session for the user's target role.
- **Request Body:**
```json
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "role_id": "11111111-1111-1111-1111-111111111111"
}
```
- **Response Body (`201 Created`):**
*(Note: Correct answers and explanations are strictly omitted)*
```json
{
  "assessment_id": "99999999-9999-9999-9999-999999999999",
  "assessment_type": "DIAGNOSTIC",
  "total_questions": 12,
  "questions": [
    {
      "id": "33333333-3333-3333-3333-333333333301",
      "text": "What is the time complexity of looking up a key in a standard Python dictionary with no collisions?",
      "question_type": "SINGLE_CHOICE",
      "difficulty": "BEGINNER",
      "options": [
        {"id": "A", "text": "O(n)"},
        {"id": "B", "text": "O(1)"},
        {"id": "C", "text": "O(log n)"},
        {"id": "D", "text": "O(n log n)"}
      ]
    }
  ]
}
```

#### `POST /api/v1/assessment/submit`
- **Purpose:** Submit answers, evaluate correctness, store evidence, and recalibrate user competencies.
- **Request Body:**
```json
{
  "assessment_id": "99999999-9999-9999-9999-999999999999",
  "answers": [
    {
      "question_id": "33333333-3333-3333-3333-333333333301",
      "selected_answer": "B"
    },
    {
      "question_id": "33333333-3333-3333-3333-333333333302",
      "selected_answer": "A"
    }
  ]
}
```
- **Response Body (`200 OK`):**
```json
{
  "assessment_id": "99999999-9999-9999-9999-999999999999",
  "raw_score": 58.33,
  "total_questions": 12,
  "correct_count": 7,
  "answers_summary": [
    {
      "question_id": "33333333-3333-3333-3333-333333333301",
      "selected_answer": "B",
      "correct_answer": "B",
      "is_correct": true,
      "explanation": "Dictionary lookups are average O(1) due to hash table indexing."
    },
    {
      "question_id": "33333333-3333-3333-3333-333333333302",
      "selected_answer": "A",
      "correct_answer": "C",
      "is_correct": false,
      "explanation": "List slicing creates a shallow copy, resulting in O(k) complexity.",
      "ai_feedback": "You chose O(1), but slicing elements from index i to j requires copying j-i memory pointers."
    }
  ],
  "profile_recalculated": true
}
```

---

### 3.4 Competency & Skill Gap Analytics

#### `GET /api/v1/users/{id}/competencies`
- **Purpose:** Fetch user's current competency matrix and status compared against target role requirements.
- **Request Body:** None.
- **Response Body (`200 OK`):**
```json
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "role_title": "Junior Data Scientist",
  "overall_readiness_percentage": 62.5,
  "competencies": [
    {
      "competency_id": "22222222-2222-2222-2222-222222222201",
      "competency_name": "Python Basics",
      "category": "Programming",
      "current_score": 75.0,
      "required_score": 80,
      "skill_gap": 5.0,
      "status": "PROFICIENT",
      "last_assessed_at": "2026-09-21T12:05:00Z"
    },
    {
      "competency_id": "22222222-2222-2222-2222-222222222202",
      "competency_name": "Data Structures & Algorithms",
      "category": "Computer Science",
      "current_score": 33.33,
      "required_score": 75,
      "skill_gap": 41.67,
      "status": "NOVICE",
      "last_assessed_at": "2026-09-21T12:05:00Z"
    }
  ]
}
```

#### `GET /api/v1/users/{id}/skill-gaps`
- **Purpose:** Returns only the deficient competencies ($\text{SkillGap} > 0$), sorted by priority.
- **Request Body:** None.
- **Response Body (`200 OK`):**
```json
[
  {
    "competency_id": "22222222-2222-2222-2222-222222222202",
    "competency_name": "Data Structures & Algorithms",
    "current_score": 33.33,
    "required_score": 75,
    "gap": 41.67,
    "priority_rank": 1,
    "prerequisite_satisfied": true
  }
]
```

---

### 3.5 Learning Recommendations

#### `GET /api/v1/users/{id}/learning-path`
- **Purpose:** Generate a prerequisite-aware recommended list of learning modules tailored to the user's skill gaps.
- **Request Body:** None.
- **Response Body (`200 OK`):**
```json
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "target_role": "Junior Data Scientist",
  "learning_path": [
    {
      "sequence_order": 1,
      "competency_id": "22222222-2222-2222-2222-222222222202",
      "competency_name": "Data Structures & Algorithms",
      "gap": 41.67,
      "resources": [
        {
          "resource_id": "44444444-4444-4444-4444-444444444401",
          "title": "Mastering Hash Maps & Trees in Python",
          "resource_type": "ARTICLE",
          "url": "https://docs.python.org/3/tutorial/datastructures.html",
          "estimated_minutes": 20,
          "status": "NOT_STARTED"
        }
      ]
    }
  ]
}
```

#### `PUT /api/v1/learning/{resource_id}/status`
- **Purpose:** Update the learner's progress on a specific learning resource.
- **Request Body:**
```json
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "status": "COMPLETED"
}
```
- **Response Body (`200 OK`):**
```json
{
  "resource_id": "44444444-4444-4444-4444-444444444401",
  "status": "COMPLETED",
  "completed_at": "2026-09-21T12:30:00Z",
  "reassessment_ready": true,
  "competency_id": "22222222-2222-2222-2222-222222222202"
}
```

---

### 3.6 Targeted Reassessment

#### `POST /api/v1/reassessment/start`
- **Purpose:** Generate a short, focused assessment session (3 questions) targeting a single deficit competency.
- **Request Body:**
```json
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "competency_id": "22222222-2222-2222-2222-222222222202"
}
```
- **Response Body (`201 Created`):**
```json
{
  "reassessment_id": "88888888-8888-8888-8888-888888888888",
  "competency_id": "22222222-2222-2222-2222-222222222202",
  "competency_name": "Data Structures & Algorithms",
  "total_questions": 3,
  "questions": [
    {
      "id": "33333333-3333-3333-3333-333333333303",
      "text": "Which built-in Python module provides a double-ended queue with O(1) appends and pops?",
      "question_type": "SINGLE_CHOICE",
      "difficulty": "INTERMEDIATE",
      "options": [
        {"id": "A", "text": "collections.deque"},
        {"id": "B", "text": "queue.Queue"},
        {"id": "C", "text": "heapq"},
        {"id": "D", "text": "sys.deque"}
      ]
    }
  ]
}
```

#### `POST /api/v1/reassessment/submit`
- **Purpose:** Submit answers to the targeted reassessment, add new evidence, and update competency scores in real time.
- **Request Body:**
```json
{
  "reassessment_id": "88888888-8888-8888-8888-888888888888",
  "answers": [
    {
      "question_id": "33333333-3333-3333-3333-333333333303",
      "selected_answer": "A"
    }
  ]
}
```
- **Response Body (`200 OK`):**
```json
{
  "reassessment_id": "88888888-8888-8888-8888-888888888888",
  "competency_id": "22222222-2222-2222-2222-222222222202",
  "competency_name": "Data Structures & Algorithms",
  "previous_score": 33.33,
  "new_score": 75.0,
  "score_delta": 41.67,
  "previous_gap": 41.67,
  "new_gap": 0.0,
  "previous_status": "NOVICE",
  "new_status": "PROFICIENT",
  "benchmark_achieved": true
}
```
