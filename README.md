# Edublox - Educational Try Out & Training App

A React Native application for Indonesian elementary school (SD) students to practice exam questions with AI-generated content. Features Firebase authentication, Firestore storage, and multi-AI provider support.

## 🎯 Features

- ✅ **User Authentication**: Firebase Email/Password auth with signup
- ✅ **Try Out Mode**: Full exams, results at end
- ✅ **Training Mode**: Instant feedback & explanations
- ✅ **AI-Powered**: OpenAI, Google Gemini, Anthropic Claude
- ✅ **Exam Configuration**: Grade, semester, subject, questions, type
- ✅ **Secure Storage**: Encrypted API keys locally
- ✅ **Progress Tracking**: Firestore exam history

## 📋 Current Status: Phase 2 Complete

- ✅ Phase 1: Base structure & types
- ✅ Phase 2: Firebase & Navigation
- ⏳ Phase 3: Exam flow (next)
- ⏳ Phase 4: Testing & deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+, npm
- Expo CLI: `npm install -g expo`

### Setup

1. **Clone & Install**:
```bash
git clone https://github.com/elgptr/edublox.git
cd edublox
npm install
```

2. **Firebase Setup** (Required!):
   - Follow `FIREBASE_SETUP.md` to create Firebase project
   - Copy credentials to `.env`

3. **Run**:
```bash
npm run dev
```

## 📁 Project Structure

```
edublox/
├── src/
│   ├── screens/           # 5 React Native screens
│   ├── services/          # Firebase & AI services
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Helpers (encryption, etc)
│   ├── hooks/             # useAuth hook
│   └── App.tsx            # Navigation setup
├── FIREBASE_SETUP.md      # Firebase guide (READ FIRST!)
├── PHASE_2_IMPLEMENTATION.md
├── README.md              # This file
├── .env.example           # Copy to .env and fill
└── package.json
```

## 🔥 Firebase Configuration

**IMPORTANT**: App requires Firebase credentials!

1. Go to https://console.firebase.google.com/
2. Create project "edublox"
3. Setup Authentication + Firestore
4. Copy config to `.env`

**Detailed steps**: See `FIREBASE_SETUP.md`

## 🎓 Features By Phase

### Phase 1: Foundation ✅
- TypeScript types
- Screen components
- AI services
- Encryption utils

### Phase 2: Authentication ✅
- Firebase setup guide
- Login/Signup screens
- useAuth hook
- Firestore services
- React Navigation

### Phase 3: Exam Flow (Next)
- Setup screen navigation
- AI question generation
- Exam interface
- Result calculation

### Phase 4: Polish & Deploy
- Testing
- Bug fixes
- Android/iOS builds
- App Store deployment

## 💻 Development

### NPM Scripts
```bash
npm run dev       # Start Expo dev server
npm run build     # TypeScript check
npm run preview   # Preview build
```

### File Changes in Phase 2
- ✅ `LoginScreen.tsx` - Firebase auth
- ✅ `App.tsx` - Navigation + useAuth
- ✅ `firebaseService.ts` - Auth methods
- ✅ `firestoreService.ts` - Database ops
- ✅ `useAuth.ts` - State management hook

## 🔒 Security

- API keys encrypted in device storage (Keychain)
- Firebase security rules enabled
- Credentials in `.env` (not in code)
- No server-side key storage

## 🧪 Testing

Before running, ensure:
- [ ] Firebase project created
- [ ] `.env` filled with credentials
- [ ] `npm install` completed
- [ ] No TypeScript errors

Test flow:
1. Create new account
2. Login
3. Check Firestore user document created
4. Logout
5. Login again (session persistence)

## 📝 Documentation

- `FIREBASE_SETUP.md` - Step-by-step Firebase setup
- `PHASE_2_IMPLEMENTATION.md` - What's new in Phase 2
- `IMPLEMENTATION_SUMMARY.md` - Code summary
- `COMPLETION_REPORT.md` - Project stats

## 🚀 Roadmap

| Phase | Focus | ETA |
|-------|-------|-----|
| 1 | Structure & Types | ✅ Done |
| 2 | Firebase & Auth | ✅ Done |
| 3 | Exam Flow | This week |
| 4 | Testing & Docs | Next week |
| 5 | Mobile Build | After testing |

## 📚 Tech Stack

- **Frontend**: React Native 0.87 + Expo 57
- **Language**: TypeScript 7.0
- **Backend**: Firebase 12.19
- **AI APIs**: OpenAI 7.23 + Gemini 0.24 + Claude 0.128
- **Navigation**: React Navigation 7.x
- **Storage**: React Native Keychain 10

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Test locally
4. Commit: `git commit -m 'description'`
5. Push: `git push origin feature/name`
6. Open Pull Request

## ❓ FAQ

**Q: Do I need Expo?**
A: Yes, recommended for development. Native builds need Android SDK/Xcode later.

**Q: Can I use different AI providers?**
A: Yes! LoginScreen has option to input OpenAI, Gemini, or Claude keys.

**Q: Is data secure?**
A: Yes. API keys encrypted locally, Firebase rules secure database, HTTPS only.

**Q: How do I build APK?**
A: See Phase 4 docs (use EAS build or local gradle).

## 📞 Support

- Issues: GitHub Issues
- Firebase Help: https://firebase.google.com/support
- React Native: https://react-native.dev/
- Expo: https://docs.expo.dev/

## 📄 License

ISC

## 👤 Author

elgptr (Erlangga Utama)

---

## ✨ Next: Phase 3 Implementation

Ready for Phase 3? Next we'll:
- Complete exam configuration flow
- Implement AI question generation
- Build exam interface
- Add results calculation

**Start with**: Read `PHASE_2_IMPLEMENTATION.md` then setup Firebase!

edublox/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx          # User authentication
│   │   ├── SetupScreen.tsx          # Exam configuration
│   │   ├── AIKeyInputScreen.tsx     # AI provider setup
│   │   ├── QuestionScreen.tsx       # Main exam interface
│   │   └── ResultScreen.tsx         # Results & review
│   ├── services/
│   │   ├── aiService.ts            # AI API integration
│   │   └── firebaseService.ts      # Firebase setup
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── utils/
│   │   └── encryption.ts           # Secure API key storage
│   ├── components/
│   │   └── (reusable components)
│   └── App.tsx                     # Main app entry
├── package.json
├── tsconfig.json
├── .gitignore
├── .env.example
└── README.md
```

## 🔐 Security

- API keys are encrypted and stored securely using `react-native-keychain`
- Never transmitted to external servers except directly to AI providers
- Users can revoke access at any time

## 🤖 Supported AI Providers

- **OpenAI**: GPT-4 Turbo (recommended for quality)
- **Google Gemini**: Fast and cost-effective
- **Anthropic Claude**: Excellent reasoning capabilities

Users can configure one or multiple providers. The app will use the selected provider for each exam.

## 📚 Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Backend**: Firebase (Auth, Firestore)
- **AI Integration**: OpenAI SDK, Google Generative AI, Anthropic SDK
- **Storage**: React Native Keychain (encrypted keys)
- **Navigation**: React Navigation

## 🎮 Usage Flow

1. **Login** → Authenticate with Firebase
2. **Setup** → Choose grade, semester, subject, question count, type
3. **AI Keys** → Enter API key(s) for AI provider
4. **Generate** → AI generates questions based on setup
5. **Answer** → Take the exam (training or try out mode)
6. **Review** → See results and review answers

## 📝 Environment Variables

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🧪 Testing

```bash
npm run build  # Build TypeScript
```

## 📦 Building for Production

```bash
# For Android
expo build:android

# For iOS
expo build:ios
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

elgptr

## 🙏 Acknowledgments

- Mattpocock Skills - Best practices in code organization and TypeScript
- React Native & Expo communities
- Firebase documentation
- OpenAI, Google, and Anthropic for their excellent APIs

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Status**: MVP Development in progress
**Last Updated**: 2026-09-28
