# AI Chat Interface with Gemini

A modern, responsive chat interface built with Next.js and Google's Gemini AI. Features a beautiful UI with typing animations, code snippet support, and mobile responsiveness.

![AI Chat Interface](https://rafiframadhana.site/assets/ai-chatbot-C83HSFrn.png)

## Features

- 🤖 Powered by Google's Gemini AI
- 💻 Beautiful code snippet rendering with syntax highlighting
- ✨ Smooth typing animations for AI responses
- 📱 Fully responsive design (mobile-friendly)
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time chat interactions
- 💬 Suggested messages for quick interactions
- 🚀 Built with Next.js 15 and TypeScript

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** 
  - Radix UI
  - Material UI Icons
  - Shadcn UI
- **AI Integration:** Google Gemini AI
- **Animations:** Custom typing effect
- **State Management:** React Hooks

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/rafiframadhana/chatbot-ai-gemini
cd chatbot-ai-gemini
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── ai/              # AI integration and flows
├── app/             # Next.js app directory
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── services/        # External services
```

## Core Features

- **Real-time Chat:** Instant message sending and receiving
- **Code Highlighting:** Supports multiple programming languages
- **Responsive Design:** Works on desktop and mobile devices
- **Typing Animation:** Smooth AI response animations
- **Error Handling:** Proper error states and notifications
- **Suggested Messages:** Quick action buttons for common queries
- **Markdown Support:** Rich text formatting in messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Rafif Ramadhana
- GitHub: [@rafiframadhana](https://github.com/rafiframadhana)
- Portfolio: [rafiframadhana.site](https://rafiframadhana.site)
