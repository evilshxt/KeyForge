# ⚡ KeyForge — Modern Typing Speed Challenge

**KeyForge** is a modern typing speed app built with **React + Vite** and styled using **Tailwind CSS**.
It helps users improve their typing speed, accuracy, and consistency across multiple challenge modes — with real-time multiplayer support and global leaderboards powered by Firebase.

> 💡 **Firebase Required**: Authentication and data storage are handled by Firebase. All features require an internet connection and Firebase account.

---

## 🚀 Features

### 🧩 Core Modes
1. **Normal Mode** — Type multiple random paragraphs within 60 seconds.
   - **3-5 paragraphs** randomly selected from 30+ available texts
   - **Sequential typing** with Enter key to advance between paragraphs
   - **Smart completion** - finishes immediately when all text is typed (even with errors)
   - Character-based accuracy calculation with real-time error highlighting
2. **Free-Form Mode** — Type anything you want; accuracy is checked against a built-in dictionary.
   - **Post-test validation** - Dictionary checking happens after test completion, not during typing
   - **Persistent results modal** - Stays open until manually dismissed for thorough word analysis
   - **Enhanced word display** - Large, scrollable invalid words list with bullet separators
   - **Copy to clipboard** - Export invalid words for further analysis
   - Uses optimized in-memory dictionary caching for fast validation
3. **Monkey Mode** — Type random words from a comprehensive English dictionary.
   - **GitHub Dictionary Integration** - Uses the same 370,000+ word dictionary as freeform mode
   - **Smart Word Selection** - Filters for common words (3-8 characters) for optimal typing practice
   - **Fallback System** - 400+ curated common words if dictionary fails to load
   - **Random Generation** - Fresh word selection each time for variety

---

### 🔐 Authentication
- **Firebase Authentication** — Secure login and signup with email/password.
- User sessions are managed via Firebase Auth.
- Protected routes ensure only authenticated users can access the app.

---

### 📊 Analytics Dashboard
- Track historical scores, accuracy, and WPM over time in Firebase.
- Real-time charts and insights with cloud-synced data.
- Filter stats by mode and session date.
- See personal bests and average performance.
- Restart, pause, and reset test easily.

---

### 🔥 Real-Time Features 
- **Firebase Realtime Database** — Sync typing sessions in real-time for multiplayer challenges.
- Compete with friends or globally in live typing races.
- Real-time leaderboards and progress tracking.

---

### 🎯 Enhanced Typing Test Features

#### **Multi-Paragraph Normal Tests**
- ✅ **30+ Test Paragraphs**: Vast selection of engaging, varied content
- ✅ **Random Combinations**: 3-5 paragraphs selected randomly for each test
- ✅ **Sequential Advancement**: Press Enter to move between paragraphs
- ✅ **No Text Exhaustion**: Never run out of unique content combinations

#### **Smart Completion Logic**
- ✅ **Immediate Completion**: Tests finish as soon as all text is typed (even with errors)
- ✅ **No Timer Penalty**: WPM calculated based on actual typing time, not continued timer
- ✅ **Real-time Stats**: Live WPM, accuracy, and error tracking
- ✅ **Visual Progress**: Clear indicators showing current paragraph and completion status

#### **Dictionary Integration**
- ✅ **GitHub Dictionary API** - 370,000+ words for comprehensive validation and word generation
- ✅ **Smart Fallback System** - 400+ curated words if API fails
- ✅ **In-Memory Caching** - Fast loading with 7-day cache duration
- ✅ **Common Word Filtering** - Monkey mode uses optimal 3-8 character words

---

## ⚙️ Tech Stack

| Tool | Purpose |
|------|----------|
| ⚛️ **React + Vite** | Fast, modern frontend environment |
| 💨 **Tailwind CSS** | Styling and responsive layout |
| 🔥 **Firebase** | Authentication, Firestore, Realtime Database |
| 🧠 **JavaScript (ES2025)** | Core typing logic and analytics |
| 📦 **Firebase Firestore** | Cloud database for scores and user data |
| 🌐 **GitHub API** | 370,000+ word English dictionary for validation |

---

## 🗂️ Project Structure

```
KeyForge/
├── src/
│   ├── components/
│   │   ├── Login.tsx            # Firebase authentication
│   │   ├── ModeSelector.tsx     # Mode selection interface
│   │   ├── TypingBox.tsx        # Main typing interface
│   │   ├── TestPage.tsx         # Test page with live stats
│   │   ├── AnalyticsPanel.tsx   # Firebase-synced analytics
│   │   ├── Leaderboard.tsx      # Global rankings
│   │   ├── MultiplayerRoom.tsx  # Real-time multiplayer
│   │   └── StatsDisplay.tsx     # Results display
│   ├── contexts/
│   │   └── AuthContext.tsx      # Firebase auth context
│   ├── utils/
│   │   ├── accuracy.ts          # WPM and accuracy calculations
│   │   ├── textSources.ts       # Text generation utilities
│   │   └── wordValidator.ts     # Dictionary validation logic
│   ├── firebase.ts              # Firebase configuration
│   ├── App.tsx                  # Main application
│   └── main.tsx
├── firestore-rules.md           # Firestore security rules
├── rtdb-rules.md               # Realtime Database rules
├── schema.md                   # Database schema documentation
└── .env                        # Firebase environment variables
```

---

## 🧠 Core Techniques

| Technique | Description |
|------------|-------------|
| **Post-Test Validation** | Freeform mode validates words after test completion, not during typing |
| **In-Memory Dictionary** | Dictionary loaded once and cached in memory, avoiding localStorage quota issues |
| **GitHub API Integration** | Loads 370,000+ word dictionary from GitHub for comprehensive validation |
| **Smart Fallback System** | Falls back to basic word list if GitHub API fails |
| **Cloud Analytics Engine** | Aggregates and stores scores, accuracy, and WPM in Firebase Firestore. |
| **Firebase Integration** | Handles authentication and real-time syncing without external servers. |
| **Adjusted WPM Calculation** | WPM scores are adjusted based on accuracy for fairer competition. |
| **Real-time Multiplayer** | Firebase Realtime Database enables live typing races with other players. |

---

## 🧭 Getting Started

### 1️⃣ Clone & Install
```bash
git clone https://github.com/evilshxt/KeyForge.git
cd KeyForge
npm install
```

### 2️⃣ Set Up Firebase
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. Enable Authentication (Email/Password).
3. Enable Firestore and Realtime Database.
4. Update `.env` with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   ```

### 3️⃣ Run Development Server

```bash
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** (default Vite port).

### 4️⃣ Build for Production

```bash
npm run build
npm run preview
```

---

## 🔥 Firebase Integration

- **Authentication**: Users must log in to access the app via Firebase Auth.
- **Firestore Database**: Stores user profiles, test scores, and analytics in the cloud.
- **Realtime Database**: Enables real-time multiplayer typing challenges and live leaderboards.
- **Security Rules**: Comprehensive Firestore and RTDB rules ensure data security and user privacy.

---

## 🗂️ Firebase Database Schema

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles and stats | `bestWPM`, `totalTests`, `averageWPM`, `accuracy`, `streak`, `longestStreak` |
| `scores` | Individual test results | `userId`, `wpm` (adjusted), `rawWpm`, `accuracy`, `mode`, `date` |

**Analytics Features:**
- ✅ Real-time Firebase-synced user statistics
- ✅ Weekly WPM progress charts using adjusted WPM scores
- ✅ Accuracy breakdown and week-over-week progress
- ✅ Streak tracking (current and longest streaks) synced with Firebase
- ✅ Achievement badges based on performance
- ✅ Global leaderboard with real-time updates

**Required Firestore Indexes:**
- `users` collection: `bestWPM` (descending)
- `scores` collection: `userId` + `date` (descending), `mode` + `wpm` (descending)

**Responsive Design:**
- ✅ Mobile-first responsive navbar with hamburger menu
- ✅ No horizontal scroll on any screen size
- ✅ Adaptive layouts for mobile, tablet, and desktop
- ✅ Touch-friendly buttons and interactions
- ✅ Optimized typography and spacing for all devices

---

## 🧰 Future Enhancements

* Enhanced multiplayer features (private rooms, tournaments)
* Advanced analytics (typing heatmaps, consistency metrics)
* Custom paragraph imports and text generation
* Sound effects & haptic feedback
* Mobile app versions (iOS/Android)
* Team competitions and challenges

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **English Word Dictionary**: The free-form typing test uses the comprehensive English word list from the [dwyl/english-words](https://github.com/dwyl/english-words) repository via GitHub API. This enables accurate validation of 370,000+ words with smart caching and fallback systems.
- **Firebase**: For providing robust authentication and real-time database services.

---

**🔥 Practice. Improve. Forge your typing speed with KeyForge.**
