# 🧠 Data Model Explanation

This section explains the database structure used in the **Practice Arena** system.

The system is designed to support personalized music practice sessions, track progress, and learn from user feedback.

---

## 👤 User

Represents a user in the system.

### Purpose
Stores user identity, preferences, and practice goals.

### Fields
- `id` — unique identifier (UUID)
- `email` — unique email address
- `password` — user password (will be hashed)
- `instrument` — instrument (e.g., guitar, piano)
- `level` — skill level (beginner, intermediate, advanced)
- `goals` — user’s practice goals
- `createdAt` — account creation timestamp

### Relationships
- A user can have multiple practice sessions

---

## 🎯 Session

Represents a single practice session generated for a user.

### Purpose
Captures the user’s state (mood, time) and defines a personalized practice plan.

### Fields
- `id` — unique identifier
- `userId` — reference to the user
- `mood` — user’s mood at session start
- `availableTime` — time available for practice (in minutes)
- `createdAt` — session creation time

### Relationships
- Belongs to one user
- Contains multiple tasks (via SessionTask)
- May have one feedback entry

---

## 🧩 Task

Represents a reusable practice activity.

### Purpose
Defines building blocks for practice sessions.

### Examples
- Practice scales
- Chord transitions
- Ear training
- Improvisation

### Fields
- `id` — unique identifier
- `name` — task name
- `difficulty` — difficulty level
- `duration` — estimated duration (minutes)
- `category` — type of task (technique, theory, etc.)

### Relationships
- Can be used in multiple sessions
- Connected via SessionTask

---

## 🔗 SessionTask

Represents the connection between a session and a task.

### Purpose
Implements a **many-to-many relationship**:
- One session → many tasks
- One task → many sessions

Also tracks progress per session.

### Fields
- `id` — unique identifier
- `sessionId` — reference to session
- `taskId` — reference to task
- `completed` — whether the task was completed

### Relationships
- Belongs to one session
- Belongs to one task

---

## ⭐ Feedback

Represents user feedback after completing a session.

### Purpose
Allows the system to learn and improve future recommendations.

### Fields
- `id` — unique identifier
- `sessionId` — reference to session (unique)
- `difficultyRating` — how difficult the session felt
- `focusRating` — how focused the user felt

### Relationships
- Each session can have only one feedback entry

---

## 🧠 System Insight

This data model enables:

- Personalized session generation
- Tracking user progress over time
- Adapting recommendations based on feedback
- Reusing tasks efficiently across sessions

---

## 🔄 Relationships Summary

- **User → Session**: One-to-many  
- **Session → Task**: Many-to-many (via SessionTask)  
- **Session → Feedback**: One-to-one  

---

## 🏗️ Conceptual Analogy

- User → the musician  
- Session → a practice day  
- Task → individual exercises  
- SessionTask → which exercises were assigned  
- Feedback → how the practice felt  

---