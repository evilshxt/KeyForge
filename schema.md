# KeyForge Firebase Database Schema

## Overview
This document outlines the Firestore database schema for KeyForge, a typing challenge app. The schema is designed for optimal performance, cost efficiency, and scalability.

## Collections

### 1. `users`
Stores user profiles and authentication data.

**Document ID**: Firebase Auth UID

**Fields**:
- `email`: string (required) - User's email address
- `displayName`: string (optional) - User's display name
- `photoURL`: string (optional) - Profile picture URL
- `createdAt`: timestamp - Account creation date
- `lastLoginAt`: timestamp - Last login timestamp
- `lastActivityDate`: string (optional) - Last activity date (YYYY-MM-DD format)
- `totalTests`: number (default: 0) - Total typing tests completed
- `totalTime`: number (default: 0) - Total time spent typing (in seconds)
- `bestWPM`: number (default: 0) - Highest WPM achieved
- `averageWPM`: number (default: 0) - Average WPM across all tests
- `accuracy`: number (default: 0) - Average accuracy percentage
- `streak`: number (default: 0) - Current daily streak
- `longestStreak`: number (default: 0) - Longest streak achieved

**Indexes**:
- `bestWPM` (descending) - For leaderboard queries
- `totalTests` (descending) - For activity-based queries

### 2. `scores`
Stores individual typing test results.

**Document ID**: Auto-generated

**Fields**:
- `userId`: string (required) - Reference to users/{uid}
- `wpm`: number (required) - **Adjusted** words per minute (raw WPM × accuracy %)
- `rawWpm`: number (required) - Raw words per minute (unadjusted)
- `accuracy`: number (required) - Accuracy percentage (0-100)
- `mode`: string (required) - 'normal', 'freeform', or 'monkey'
- `time`: number (required) - Time taken in seconds
- `date`: timestamp (required) - Test completion date
- `textLength`: number (optional) - Length of text typed
- `errors`: number (optional) - Number of errors made

**Indexes**:
- `bestWPM` (descending) - For global leaderboard queries (users collection)
- `userId` + `date` (descending) - For user history queries
- `mode` + `wpm` (descending) - For mode-specific leaderboards
- `date` (descending) - For recent scores

## Query Optimization Strategies

### 1. Leaderboard Queries
- Query `users` collection directly by `bestWPM` (descending) with limit
- No Cloud Functions needed - direct queries work well for small user bases
- Use real-time listeners for live updates

### 2. User Analytics
- Pre-compute averages in `users` collection
- Use `scores` collection for detailed history
- Paginate large result sets

### 3. Real-time Updates
- Use Firestore real-time listeners for live leaderboards
- Debounce updates to prevent excessive reads

### 4. Cost Reduction
- Composite indexes only where necessary
- Use `limit()` on large queries
- Cache frequently accessed data in app state
- Batch writes for multiple score submissions

## Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all users (for leaderboards) but only write their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can write their scores, read all scores
    match /scores/{scoreId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
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

## Implementation Notes

- Use Firebase Auth for user management
- Implement Cloud Functions for leaderboard updates
- Consider using Firestore bundles for offline support
- Monitor usage with Firebase Analytics

## Responsive Design Features

### Mobile (up to 640px)
- Single column layouts for all components
- Hamburger navigation menu
- Touch-optimized button sizes
- Compressed spacing and typography

### Tablet (641px to 1024px)
- Two-column layouts for charts and mode selection
- Balanced spacing and typography
- Touch-friendly interactions maintained

### Desktop (1025px and above)
- Scaled-down UI elements (75% of original size)
- Three-column layouts where appropriate
- Optimal spacing for larger screens
- Full navigation bar with all features visible
