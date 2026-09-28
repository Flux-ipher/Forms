# Implementation Plan: Dynamic Form Builder (Google Forms Clone)

## Overview
This document outlines the architecture and step-by-step implementation plan for a dynamic form builder. The application allows users to create forms via a visual, "natural" interface, share a public link to collect responses, and view aggregated analytics. 

**Tech Stack:**
*   **Frontend:** React (Vite), Tailwind CSS (styling), React Hook Form (rendering), Recharts (analytics)
*   **Backend:** Node.js, Express.js
*   **Database:** Supabase (PostgreSQL using `JSONB`)

---

## Phase 1: Database Architecture (Supabase)
Instead of creating new tables for each form, we will use PostgreSQL's `JSONB` capabilities to store dynamic schemas and responses flexibly.

**SQL Schema:**
```sql
-- Table: Forms (Stores the form structure)
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Form',
  description TEXT,
  schema JSONB NOT NULL DEFAULT '[]', -- The hidden array of question objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Submissions (Stores user responses)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Maps question IDs to user answers
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Phase 2: Backend API (Node.js + Express)
The backend acts as a secure bridge between the React application and Supabase. 

**Core Endpoints:**
1.  `POST /api/forms`
    *   **Purpose:** Create a new, blank form.
    *   **Action:** Inserts a new row into the `forms` table and returns the generated `id`.
2.  `PUT /api/forms/:id`
    *   **Purpose:** Auto-save the form builder state.
    *   **Action:** Updates the `title`, `description`, and `schema` (JSONB array of questions) for a specific form.
3.  `GET /api/forms/:id`
    *   **Purpose:** Fetch the form schema. Used by both the Builder UI (to load saved state) and the Renderer (to display the form to respondents).
4.  `POST /api/submissions`
    *   **Purpose:** Submit a completed form.
    *   **Action:** Saves the `answers` JSON payload to the `submissions` table.
5.  `GET /api/analytics/:id`
    *   **Purpose:** Fetch all submissions for a specific form to populate the dashboard charts.

---

## Phase 3: Frontend - The Visual Builder
This is the core "natural" interface where the user types questions without interacting with code.

**Key Components:**
*   **`FormBuilder.jsx`:** The main container holding the `questions` state array.
*   **`QuestionCard.jsx`:** A UI component representing a single question. Includes text inputs for the question title and a dropdown for the question type (Short Answer, Paragraph, Multiple Choice).
*   **`MultipleChoiceEditor.jsx`:** A sub-component that appears if the "Multiple Choice" type is selected. Allows users to click "Add Option" and type option labels naturally.

**Features to Implement:**
1.  **State Mapping:** Bind standard `<input>` fields directly to the React state. When a user types a question title, it updates `questions[index].title`.
2.  **Auto-Save (Debouncing):** Implement a `useEffect` hook that listens to changes in the `questions` state. Use a utility like `lodash.debounce` to wait for the user to stop typing for 1.5 seconds, then trigger the `PUT /api/forms/:id` endpoint in the background.

---

## Phase 4: Frontend - The Public Renderer
This is the view respondents see when they click the public form link.

**Key Components:**
*   **`FormRenderer.jsx`:** Fetches the form data via `GET /api/forms/:id`. 
*   **Dynamic Mapping:** Iterates through the `schema` array. 
    *   If `type === 'text'`, render `<input type="text">`.
    *   If `type === 'radio'`, render a list of `<input type="radio">` with labels based on the `options` array.
*   **Form Management:** Use `react-hook-form` to capture all inputs easily and package them into a single `answers` object.
*   **Submission:** On submit, send the `answers` object to `POST /api/submissions`.

---

## Phase 5: Analytics Dashboard
The analytics page provides a visual summary of the collected data, matching the Google Forms "Responses" tab.

**Implementation Steps:**
1.  **Fetch Data:** Call `GET /api/analytics/:id` to retrieve an array of all submissions.
2.  **Data Aggregation (Frontend or Backend):** Loop through the submissions to count answers. 
    *   *Example:* For Question 1 (Multiple Choice), count how many people chose "Option A" vs "Option B".
3.  **Visualization:** Pass the aggregated counts into a charting library (like Recharts).
    *   Render Pie Charts for Multiple Choice/Dropdown questions.
    *   Render scrollable text lists for Short Answer/Paragraph questions.

---

## Recommended Step-by-Step Execution
1.  **Initialize Project:** Setup Vite + React, and Express + Node.js.
2.  **Database:** Run the SQL commands in your Supabase project.
3.  **API Skeleton:** Build the 5 Express routes and connect them to Supabase using `@supabase/supabase-js`.
4.  **Builder UI (The hardest part):** Build the React interface where you can add, edit, and reorder questions visually. Wire it up to save to the database.
5.  **Renderer:** Build the public-facing view that reads the saved database schema.
6.  **Analytics:** Finally, build the charts to display the submitted data.