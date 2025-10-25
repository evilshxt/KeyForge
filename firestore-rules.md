# Firebase Firestore Security Rules

These are the security rules for the Firestore database used in KeyForge. They ensure that users can only access their own data and that the app functions securely.

## Overview

The rules are designed to:
- Allow authenticated users to read and write their own user documents and scores.
- Prevent unauthorized access to other users' data.
- Ensure data integrity and security.

## Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: Each user can read all users (for leaderboards) but only write their own document
    match /users/{userId} {
      allow read: if request.auth != null; // All authenticated users can read all user documents (for leaderboards)
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Scores collection: Users can read all scores but only write their own
    match /scores/{scoreId} {
      allow read: if request.auth != null; // All authenticated users can view scores
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Explanation

1. **Users Collection**:
   - All authenticated users can read all user documents (needed for global leaderboards).
   - Users can only write to their own user document based on their UID.
   - This protects personal stats while allowing public leaderboard access.

2. **Scores Collection**:
   - All authenticated users can read scores (for leaderboards and analytics).
   - Users can only write/create scores that belong to them (based on `userId` field).
   - This allows sharing scores publicly while preventing tampering.

## Troubleshooting

- If users can't save scores, check that the `userId` field matches the authenticated user's UID.
- If analytics aren't loading, ensure read permissions are correct.
- For any access issues, verify authentication state in the app.
