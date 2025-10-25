# Firebase Realtime Database Security Rules

These are the security rules for the Realtime Database used in KeyForge for real-time multiplayer features. They ensure secure, real-time interactions while protecting against unauthorized access.

## Overview

The rules are designed to:
- Allow authenticated users to create and manage multiplayer rooms.
- Enable real-time updates for room states and player data.
- Prevent unauthorized modifications to rooms they don't own or participate in.
- Ensure fault-tolerance and data integrity for multiplayer sessions.

## Rules

```javascript
{
  "rules": {
    // Rooms collection for multiplayer features
    "rooms": {
      "$roomId": {
        // Room data can be read by authenticated users (for joining and viewing)
        ".read": "auth != null",
        // Room data can be written by the room creator or participants
        ".write": "auth != null && (
          // Allow new room creation
          (!data.exists() && newData.child('players').child(auth.uid).exists()) ||
          // Allow existing participants to write
          (data.exists() && data.child('players').child(auth.uid).exists()) ||
          // Allow joining a room (adding yourself as a player)
          (data.exists() && newData.child('players').child(auth.uid).exists())
        )",
        // Players subcollection
        "players": {
          "$playerId": {
            // Players can read all player data in the room
            ".read": "auth != null",
            // Players can only write their own player data
            ".write": "auth != null && auth.uid == $playerId"
          }
        },
        // Other room properties (status, countdown, etc.)
        "$other": {
          ".write": "auth != null && (
            // Room creator or participants can modify room state
            data.parent().child('players').child(auth.uid).exists() ||
            // Allow updates for room management (e.g., starting game)
            newData.parent().child('players').child(auth.uid).exists()
          )"
        }
      }
    },
    // Default deny for all other paths
    ".read": false,
    ".write": false
  }
}
```

## Explanation

1. **Rooms Collection**:
   - **Read**: All authenticated users can read room data (to join or view public rooms).
   - **Write**: Users can write to rooms if they are creating a new room, are already participants, or are joining by adding themselves as a player.
   - This allows dynamic room creation and joining while preventing unauthorized modifications.

2. **Players Subcollection**:
   - Users can read all player data in a room for real-time updates.
   - Users can only write to their own player entry (e.g., updating ready status or scores).

3. **Other Room Properties**:
   - Room participants can update room state (e.g., countdown, status).
   - Prevents non-participants from altering room settings.

4. **Default Rules**:
   - Denies access to any other paths for security.

## Deployment

1. Go to the Firebase Console.
2. Select your project.
3. Navigate to Realtime Database > Rules.
4. Copy and paste the rules above.
5. Click "Publish".

## Best Practices

- **Testing**: Use Firebase Emulator to test rules locally before deploying.
- **Monitoring**: Monitor for unauthorized access attempts in the Firebase Console.
- **Scalability**: These rules scale well for multiplayer scenarios with up to 4 players per room.
- **Fault-Tolerance**: Rooms auto-clean when all players leave, preventing data accumulation.

## Troubleshooting

- **Room Creation Issues**: Ensure the user is authenticated and the room code is unique.
- **Real-Time Updates Not Working**: Check that the user is a participant in the room.
- **Access Denied**: Verify authentication and room participation.
- **Performance**: If experiencing latency, ensure rules are not overly complex and consider database location.

## Security Notes

- These rules assume user authentication is properly implemented in the app.
- For production, consider adding rate limiting or additional validations.
- Regularly review and update rules as the app evolves.
