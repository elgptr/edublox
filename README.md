# Edublox - Educational Try Out & Training App

A companion React Native application for Indonesian elementary school (SD) students to practice exam questions and training with AI-generated content.

## 🎯 Features (MVP)

- **Try Out Mode**: Take full exams and see results at the end
- **Training Mode**: Get instant feedback and explanations after each answer
- **User Authentication**: Firebase authentication support
- **AI-Powered Questions**: Generate questions using OpenAI, Google Gemini, or Anthropic Claude
- **Flexible Configuration**: Choose grade level, semester, subject, question type, and quantity
- **Secure API Key Storage**: Encrypted local storage for user's AI API keys

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo`)
- Git
- GitHub account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/elgptr/edublox.git
cd edublox
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

4. Start the Expo development server:
```bash
npm run dev
```

## 📱 Project Structure

```
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
