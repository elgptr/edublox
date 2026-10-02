# Edublox - Educational Try Out & Training App

A React Native application for Indonesian elementary school (SD) students. Firebase auth, Firestore storage, multi-AI support.

## 📖 START HERE - Choose Your Guide

### 👤 **For Users/Developers**: `HUMAN_GUIDE.md`
Quick setup, FAQ, 5-10 min read

### 🤖 **For AI/Technical**: `AI_REFERENCE.md`
Architecture, specs, implementation details

---

## 🎯 Features

✅ Firebase Email/Password auth with signup  
✅ Try Out Mode - Full exams, results at end  
✅ Training Mode - Instant feedback & explanations  
✅ AI-Powered - OpenAI, Google Gemini, Anthropic Claude  
✅ Exam Config - Grade, semester, subject, questions, type  
✅ Secure Storage - Encrypted API keys locally  
✅ Progress Tracking - Firestore exam history  

## 📋 Status: Phase 2 Complete ✅

- ✅ Phase 1: Base structure
- ✅ Phase 2: Firebase & Navigation
- ⏳ Phase 3: Exam flow (next)
- ⏳ Phase 4: Testing & deploy

## 🚀 Quick Start

```bash
git clone https://github.com/elgptr/edublox.git
cd edublox
npm install
# Setup Firebase (see FIREBASE_SETUP.md)
# Fill .env with credentials
npm run dev
```

## 📁 Structure

```
src/
├── screens/          # 5 UI screens
├── services/         # Firebase & AI
├── hooks/            # useAuth
├── types/            # TypeScript
└── utils/            # Helpers

📖 Guides/
├── HUMAN_GUIDE.md        # ← START HERE
├── AI_REFERENCE.md       # ← OR HERE
├── FIREBASE_SETUP.md     # Firebase config
├── README.md             # This file
└── Others (reference)
```

## 📚 Docs Map

| Document | For | Time |
|----------|-----|------|
| HUMAN_GUIDE.md | Getting started | 5 min |
| AI_REFERENCE.md | Tech implementation | 10 min |
| FIREBASE_SETUP.md | Firebase setup | 15 min |
| README.md | Overview | 5 min |

## 🔥 Firebase (REQUIRED!)

1. Go to https://console.firebase.google.com/
2. Create project "edublox"
3. Setup Authentication + Firestore
4. Copy config to `.env`

👉 **Detailed**: See `FIREBASE_SETUP.md`

## 💻 Dev

```bash
npm run dev       # Start
npm run build     # Check
npm run preview   # Preview
```

## 📋 Test Checklist

- [ ] Firebase project created
- [ ] .env filled
- [ ] npm install done
- [ ] No TypeScript errors
- [ ] npm run dev works
- [ ] Create test account
- [ ] Firestore has user
- [ ] Login/logout works

## 📚 Tech Stack

- React Native 0.87 + Expo 57
- TypeScript 7.0
- Firebase 12.19
- React Navigation 7.x
- OpenAI + Gemini + Claude

## 🚀 Roadmap

| Phase | Status |
|-------|--------|
| 1 | ✅ Done |
| 2 | ✅ Done |
| 3 | ? Done |
| 4 | Then |

## 📞 Support

- GitHub Issues
- Firebase: https://firebase.google.com/support
- React Native: https://react-native.dev/
- Expo: https://docs.expo.dev/

## 📄 License

ISC

## 👤 Author

elgptr (Erlangga Utama)

---

👆 **Pick your guide above and get started!**
