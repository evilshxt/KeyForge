# ⚡ KeyForge — Modern Typing Speed Challenge

**KeyForge** is a modern, offline-friendly typing speed app built with **React + Vite** and styled using **Tailwind CSS**.
It helps users improve their typing speed, accuracy, and consistency across multiple challenge modes — all while storing progress and analytics locally in the browser and syncing with Firebase for authentication and real-time features.

> 💡 Everything runs 100% on the client — no backend, no database, no API keys required for local features. Firebase handles authentication and optional real-time syncing.

---

## 🚀 Features

### 🧩 Core Modes
1. **Normal Mode** — Type a random paragraph within 60 seconds.
   - Words-per-minute (WPM) and accuracy are calculated against a fixed passage.
2. **Free-Form Mode** — Type anything you want; accuracy is checked against a built-in dictionary.
   - Uses a lightweight English word list (optimized `.txt`) loaded lazily for performance.
3. **Monkey Mode** — Random sequence of short words.
   - Designed for raw speed and character-level precision.

---

### 🔐 Authentication
- **Firebase Authentication** — Secure login and signup with email/password.
- User sessions are managed via Firebase Auth.
- Protected routes ensure only authenticated users can access the app.

---

### 📊 Analytics Dashboard
- Track historical scores, accuracy, and WPM over time.
- LocalStorage-based charts and insights (no network requests).
- Filter stats by mode and session date.
- See personal bests and average performance.
- Restart, pause, and reset test easily.
- Optional loading spinner for free-form dictionary.

---

### 🔥 Real-Time Features (Optional)
- **Firebase Realtime Database** — Sync typing sessions in real-time for multiplayer challenges.
- Compete with friends or globally in live typing races.
- Real-time leaderboards and progress tracking.

---

### 💾 Local-Only Functionality
- **All data stored in browser**:
  - Test results
  - Analytics
  - Preferences (theme, mode, settings)
- **No backend / API / sign-in required** for basic features (local storage fallback)

---

## ⚙️ Tech Stack

| Tool | Purpose |
|------|----------|
| ⚛️ **React + Vite** | Fast, modern frontend environment |
| 💨 **Tailwind CSS** | Styling and responsive layout |
| 🔥 **Firebase** | Authentication, Firestore, Realtime Database |
| 🧠 **JavaScript (ES2025)** | Core typing logic and analytics |
| 📦 **LocalStorage API** | Persistent data & settings |
| 📜 **words.txt** | Offline English dictionary for free-form mode |

---

## 🗂️ Project Structure

```
KeyForge/
├── public/
│   ├── data/
│   │   └── words.txt            # Local dictionary (trimmed word list)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ModeSelector.jsx     # Select between modes
│   │   ├── TypingBox.jsx        # Typing input area and word highlighting
│   │   ├── StatsDisplay.jsx     # Post-test stats & analytics summary
│   │   ├── AnalyticsPanel.jsx   # Charts using stored local data
│   │   ├── ThemeToggle.jsx      # Dark/light mode toggle
│   │   └── Login.jsx            # Authentication page
│   ├── contexts/
│   │   └── AuthContext.jsx      # Firebase auth context
│   ├── firebase.js              # Firebase config and services
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                         # Firebase environment variables
├── package.json
└── README.md
```

---

## 🧠 Core Techniques

| Technique | Description |
|------------|-------------|
| **Lazy Loading** | The English dictionary (`words.txt`) is fetched only when Free-Form Mode is selected. |
| **Set() Lookup Optimization** | Dictionary words are stored in a JavaScript `Set` for O(1) lookups. |
| **Local Analytics Engine** | Aggregates and stores scores, accuracy, and WPM in localStorage. |
| **Firebase Integration** | Handles authentication and real-time syncing without external servers. |
| **Debounced Input Parsing** | Improves performance for real-time character comparison. |
| **Dynamic Rendering** | Components re-render smoothly on mode or theme change. |

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

## 🧩 LocalStorage Schema

| Key                  | Type   | Description                                                    |
| -------------------- | ------ | -------------------------------------------------------------- |
| `keyforge:scores`    | Array  | Stores all past test sessions (mode, WPM, accuracy, timestamp) |
| `keyforge:theme`     | String | `"light"` or `"dark"`                                          |
| `keyforge:settings`  | Object | Stores app preferences                                         |
| `keyforge:analytics` | Object | Precomputed aggregates for charts                              |

---

## 🔥 Firebase Integration

- **Authentication**: Users must log in to access the app.
- **Firestore**: For storing user profiles and advanced analytics.
- **Realtime Database**: For real-time multiplayer typing challenges.

---

## 🧰 Future Enhancements

* Multiplayer typing races (WebSocket version)
* Offline-first PWA support
* Advanced analytics (streaks, typing consistency graphs)
* Custom paragraph imports
* Sound effects & background music

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **English Word List**: The free-form typing test uses a word list from the [dwyl/english-words](https://github.com/dwyl/english-words) repository. This comprehensive dictionary enables accurate word validation without requiring external APIs.
- **Firebase**: For providing robust authentication and real-time database services.

---

**🔥 Practice. Improve. Forge your typing speed with KeyForge.**
