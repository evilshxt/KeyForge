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
    // Users collection: Each user can read and write only their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Scores collection: Users can read all scores but only write their own
    match /scores/{scoreId} {
      allow read: if request.auth != null; // All authenticated users can view scores
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Additional collections if needed (e.g., for future features)
    // match /otherCollection/{docId} {
    //   allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    // }
  }
}
```

## Explanation

1. **Users Collection**:
   - Users can only access their own user document based on their UID.
   - This protects personal stats and settings.

2. **Scores Collection**:
   - All authenticated users can read scores (for leaderboards and analytics).
   - Users can only write/create scores that belong to them (based on `userId` field).
   - This allows sharing scores publicly while preventing tampering.

## Deployment

1. Go to the Firebase Console.
2. Select your project.
3. Navigate to Firestore Database > Rules.
4. Copy and paste the rules above.
5. Click "Publish".

## Best Practices

- Always test rules in a development environment before deploying to production.
- Use Firebase Emulator for local testing.
- Monitor for security events in the Firebase Console.
- Keep rules simple and auditable.

## Troubleshooting

- If users can't save scores, check that the `userId` field matches the authenticated user's UID.
- If analytics aren't loading, ensure read permissions are correct.
- For any access issues, verify authentication state in the app.
