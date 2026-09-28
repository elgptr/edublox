# 🤖 Edublox - AI/Developer Reference

**Untuk**: AI Agents, Developers  
**Phase**: 2 - Firebase & Navigation ✅  

---

## 🏗️ Architecture

### Services
```
firebaseService.ts
├── login, signup, logout
├── getCurrentUser, isInitialized

firestoreService.ts
├── saveExamSetup, getExamSetup
├── saveExamResult, getExamResult
└── createUserProfile, getUserProfile

aiService.ts
├── generateQuestions
└── validateAnswers
```

### State Management
```
useAuth.ts Hook
├── State: isLoading, isLoggedIn, currentUser, userId
└── Methods: login, signup, logout
```

### Navigation
```
App.tsx
├── LoginScreen (if !isLoggedIn)
└── SetupScreen, AIKeyInput, Question, Result (if isLoggedIn)
```

---

## 📊 Firestore Schema

```
users/{userId}/
├── email, displayName, createdAt, lastLogin
├── exams/ (subcollection)
│   └── {examSetupId}/
│       ├── gradeLevel (1-6)
│       ├── semester (1-2)
│       ├── bookName, questionCount
│       ├── type: "multiple-choice"|"essay"|"mixed"
│       └── mode: "training"|"tryout"
└── results/ (subcollection)
    └── {resultId}/
        ├── correctAnswers, totalQuestions, score
        ├── mode, answers[], timestamps
```

---

## 🔄 Data Flows

### Auth Flow
```
User Input → LoginScreen → Validation 
→ firebaseService → Firebase 
→ useAuth Updates → App Navigation Changes
```

### Database Flow
```
Component → firestoreService.saveExamResult()
→ Firestore ADD → returns docId
→ Component stores/uses docId
```

---

## 🧩 Dependencies

```
App.tsx
├── useAuth hook
├── LoginScreen component
└── Other screen components

LoginScreen
├── firebaseService (login/signup)
├── firestoreService (createUserProfile)
└── State: email, password, name, loading, error

useAuth
├── firebaseService
├── Listens: Firebase Auth state
└── Provides: Auth state + methods

firestoreService
├── firebaseService.getFirestore()
└── Firestore CRUD operations
```

---

## 🔐 Security

### Client-Side
✅ API keys via react-native-keychain
✅ Credentials in .env (not in code)
✅ Input validation
✅ Safe error messages

### Firebase
✅ Firestore security rules
✅ User-based access (userId)
✅ Nested collections
✅ Test mode for dev

---

## 📝 Types

```typescript
interface User {
  uid: string; email: string; displayName?: string;
}

interface ExamSetup {
  gradeLevel: 1-6; semester: 1-2; bookName: string;
  questionCount: number; type: string; mode: string;
}

interface ExamResult {
  correctAnswers: number; totalQuestions: number;
  score: number; mode: string;
}
```

---

## 🧪 Testing Points

- Signup creates Firestore document
- Login with wrong password errors
- Session persists after restart
- Logout clears session
- All Firebase methods callable

---

## 🚀 Performance

Implemented:
✅ Lazy loading (React Navigation)
✅ Proper state management
✅ Minimal re-renders

Future:
- Pagination for history
- Offline support
- Image optimization
- Analytics

---

## 🔧 Config

### .env Template
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### tsconfig.json
- Strict mode: on
- Path aliases: @screens, @services, @types, @hooks
- Target: ES2020

### package.json
- React Native 0.87
- Firebase 12.19
- React Navigation 7.x
- TypeScript 7.0
- Expo 57

---

## 📚 Standards

### Naming
- Components: PascalCase
- Functions: camelCase
- Types: PascalCase
- Files: match export

### Files
```
src/
├── screens/
├── services/
├── hooks/
├── types/
├── utils/
└── App.tsx
```

### Error Handling
```typescript
try {
  const result = await method();
} catch (error: any) {
  const msg = error.message;
  if (msg.includes('specific')) {
    // handle
  }
}
```

---

## 🔗 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| firebase | ^12.19 | Backend |
| @react-navigation | ^7.x | Navigation |
| react-native-keychain | ^10.x | Storage |
| typescript | ^7.0 | Types |

---

## 📖 Phase 3 Architecture

### New Components
- SetupScreen: Config UI
- QuestionScreen: Display
- ResultScreen: Show results

### New Services
- resultService: Calculate scores

### New State
- examState, resultState

---

## 🎯 Deployment

- [ ] Firebase configured
- [ ] .env populated
- [ ] npm install done
- [ ] `npm run build` no errors
- [ ] `npm run dev` works
- [ ] Firestore has user profile
- [ ] Session persists
- [ ] Phase 3 ready

---

## 📞 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| Firebase not initialized | .env missing | Fill .env |
| user-not-found | Email not registered | Check signup |
| wrong-password | Bad password | Validate |
| email-already-in-use | Email exists | New email |

---

## 📊 Quality

| Metric | Status |
|--------|--------|
| TypeScript strict | ✅ |
| Type coverage | ✅ |
| Compilation | ✅ |
| Documentation | ✅ |

---

**Ready for Phase 3!** 🚀
