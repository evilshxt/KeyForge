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
- `totalTests`: number (default: 0) - Total typing tests completed
- `totalTime`: number (default: 0) - Total time spent typing (in seconds)
- `bestWPM`: number (default: 0) - Highest WPM achieved
- `averageWPM`: number (default: 0) - Average WPM across all tests
- `accuracy`: number (default: 0) - Average accuracy percentage
- `streak`: number (default: 0) - Current daily streak

**Indexes**:
- `bestWPM` (descending) - For leaderboard queries
- `totalTests` (descending) - For activity-based queries

### 2. `scores`
Stores individual typing test results.

**Document ID**: Auto-generated

**Fields**:
- `userId`: string (required) - Reference to users/{uid}
- `wpm`: number (required) - Words per minute
- `accuracy`: number (required) - Accuracy percentage (0-100)
- `mode`: string (required) - 'normal', 'freeform', or 'monkey'
- `time`: number (required) - Time taken in seconds
- `date`: timestamp (required) - Test completion date
- `textLength`: number (optional) - Length of text typed
- `errors`: number (optional) - Number of errors made

**Indexes**:
- `userId` + `date` (descending) - For user history queries
- `wpm` (descending) - For global leaderboard
- `mode` + `wpm` (descending) - For mode-specific leaderboards
- `date` (descending) - For recent scores

### 3. `leaderboards`
Pre-computed aggregated data to reduce query costs (updated via Cloud Functions).

**Document ID**: 'global', 'normal', 'freeform', 'monkey'

**Fields**:
- `topUsers`: array - Top 100 users with their best scores
  - Each item: { userId, displayName, bestWPM, totalTests }
- `lastUpdated`: timestamp - When data was last refreshed

**Indexes**:
- None required (small collection)

## Query Optimization Strategies

### 1. Leaderboard Queries
- Use `leaderboards` collection for top scores instead of sorting `users` or `scores`
- Update via background Cloud Functions on score submission
- Limit to top 100 to control costs

### 2. User Analytics
- Pre-compute averages in `users` collection
- Use `scores` subcollection for detailed history
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
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can write their scores, read all scores
    match /scores/{scoreId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
    
    // Leaderboards are publicly readable
    match /leaderboards/{boardId} {
      allow read: if true;
    }
  }
}
```

## Implementation Notes

- Use Firebase Auth for user management
- Implement Cloud Functions for leaderboard updates
- Consider using Firestore bundles for offline support
- Monitor usage with Firebase Analytics
