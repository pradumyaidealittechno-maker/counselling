# Interview Question Generation - OpenAI Integration

## Issue
The system was trying to use n8n webhook for question generation, which wasn't configured. Error: "N8N questions webhook not configured"

## Solution
Replaced n8n webhook with direct OpenAI API integration for generating interview questions.

---

## Changes Made

### 1. Added Question Generation to AI Service
**File**: `server/src/services/ai.service.ts`

Added new method `generateInterviewQuestions()`:
- Uses OpenAI GPT-4 Turbo to generate questions
- Maps questions to Job DNA traits
- Includes evaluation criteria and follow-up questions
- Falls back to mock questions if API key is invalid
- Generates 8-12 questions covering all categories

**Question Structure**:
```typescript
{
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'situational' | 'communication';
  estimatedDuration: number;
  dnaMapping: [{
    dimension: string;
    trait: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    signalsToEvaluate: string[];
  }];
  evaluationCriteria: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
  };
  followUpQuestions: string[];
}
```

### 2. Updated Job Routes
**File**: `server/src/routes/job.routes.ts`

Changed from n8n to AI service:
```typescript
// OLD: const questions = await n8nService.generateInterviewQuestions(...)
// NEW: const questions = await aiService.generateInterviewQuestions(...)
```

Added CRUD endpoints for questions:
- `POST /api/jobs/:id/questions` - Add new question
- `PATCH /api/jobs/:id/questions/:questionId` - Update question
- `DELETE /api/jobs/:id/questions/:questionId` - Delete question

### 3. Updated API Service
**File**: `src/services/api.ts`

Added methods:
- `addQuestion(jobId, question)` - Add new question
- `updateQuestion(jobId, questionId, question)` - Update question
- `deleteQuestion(jobId, questionId)` - Delete question

### 4. Updated InterviewBuilder
**File**: `src/pages/InterviewBuilder.tsx`

Added functionality:
- `handleDeleteQuestion()` - Delete a question
- `handleEditQuestion()` - Edit a question (placeholder for future modal)
- Connected delete button to handler
- Connected edit button to handler

---

## API Endpoints

### Generate Questions
```
POST /api/jobs/:id/generate-questions
Authorization: Bearer <token>

Response:
{
  "questions": [...]
}
```

### Get Questions
```
GET /api/jobs/:id/questions
Authorization: Bearer <token>

Response:
{
  "questions": [...]
}
```

### Add Question
```
POST /api/jobs/:id/questions
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "text": "Question text",
  "category": "technical",
  "estimatedDuration": 5,
  "dnaMapping": [...],
  "evaluationCriteria": {...},
  "followUpQuestions": [...]
}

Response:
{
  "question": {...}
}
```

### Update Question
```
PATCH /api/jobs/:id/questions/:questionId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "text": "Updated question text",
  ...
}

Response:
{
  "question": {...}
}
```

### Delete Question
```
DELETE /api/jobs/:id/questions/:questionId
Authorization: Bearer <token>

Response:
{
  "message": "Question deleted successfully"
}
```

---

## Question Generation Logic

### Real API (OpenAI)
When OpenAI API key is configured:
1. Analyzes job title, description, skills, and Job DNA
2. Generates 8-12 questions mapped to DNA traits
3. Includes evaluation criteria for each question
4. Provides follow-up questions
5. Covers all categories: technical, behavioral, situational, communication

### Mock Mode
When OpenAI API key is not configured:
1. Generates 8 context-aware questions
2. Detects technologies from job description (React, Node, Python, etc.)
3. Adjusts questions based on experience level
4. Includes realistic DNA mapping and evaluation criteria

---

## Mock Question Examples

The mock generator creates intelligent questions based on:
- **Technology Detection**: React, Node.js, Python, Java
- **Experience Level**: Entry, Mid, Senior, Lead
- **Job Description Keywords**: Analyzes description for context

Example categories:
1. **Technical** - Framework-specific or general architecture
2. **Behavioral** - STAR format questions about past experiences
3. **Situational** - Hypothetical scenarios
4. **Communication** - Explaining concepts, code reviews

---

## Features

### ✅ Implemented
- Generate questions using OpenAI API
- Mock question generation (fallback)
- Save questions to database
- Delete questions
- Questions persist across sessions
- DNA mapping for each question
- Evaluation criteria
- Follow-up questions

### 🚧 To Implement
- Edit question modal/form
- Reorder questions (drag & drop)
- Duplicate questions
- Question templates
- Bulk import/export questions

---

## Testing

### Test Question Generation
1. Create a job with Job DNA
2. Navigate to Interview Builder
3. Click "Generate Questions from DNA"
4. Verify 8-12 questions are generated
5. Verify questions are saved to database
6. Refresh page - questions should persist

### Test Delete
1. Click trash icon on any question
2. Verify question is removed from UI
3. Refresh page - question should stay deleted

### Test with Mock Mode
1. Ensure OpenAI API key is not configured
2. Generate questions
3. Verify mock questions are generated
4. Verify they're contextual to job description

---

## Database Storage

Questions are stored in the Job model:
```typescript
{
  _id: ObjectId,
  title: "Job Title",
  interviewQuestions: [
    {
      id: "q1-technical",
      text: "Question text",
      category: "technical",
      estimatedDuration: 5,
      dnaMapping: [...],
      evaluationCriteria: {...},
      followUpQuestions: [...]
    }
  ]
}
```

---

## Benefits

1. **No External Dependencies**: No need for n8n webhook configuration
2. **Persistent Storage**: Questions saved in database
3. **Editable**: Can modify, delete, or add questions
4. **Context-Aware**: Questions mapped to Job DNA traits
5. **Evaluation Criteria**: Clear rubric for each question
6. **Follow-ups**: Suggested follow-up questions
7. **Mock Mode**: Works without OpenAI API key for testing

---

## Next Steps

1. **Implement Edit Modal**: Full question editing interface
2. **Add Question Templates**: Pre-built question library
3. **Drag & Drop Reordering**: Change question order
4. **Bulk Operations**: Import/export questions
5. **Question Analytics**: Track which questions work best
6. **AI Refinement**: Improve question quality based on feedback

---

## Files Modified

### Backend
- `server/src/services/ai.service.ts` - Added generateInterviewQuestions method
- `server/src/routes/job.routes.ts` - Replaced n8n with AI service, added CRUD endpoints

### Frontend
- `src/services/api.ts` - Added question CRUD methods
- `src/pages/InterviewBuilder.tsx` - Added delete/edit handlers

---

## Summary

Interview questions are now generated using OpenAI API (with mock fallback), saved to the database, and can be deleted. The system no longer depends on n8n webhooks and provides full control over interview questions with persistent storage.
