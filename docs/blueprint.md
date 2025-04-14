# **App Name**: PortfolioPal

## Core Features:

- Chat Interface: Implement a chat interface with a text input area and a chat window, with a bubble float for opening and closing the window.
- Secure AI Request Handling: Create a backend endpoint to handle AI requests using your Hugging Face API key, securely fetching responses from the AI model.
- File Upload for Context: Implement a file upload feature that allows the user to upload a .txt file, which will be used as context for the chatbot.
- Website Scraping for Context: Allow the user to input a URL, scrape the content from that URL, and use the scraped data as additional context for the chatbot. The chatbot uses a tool to decide when to incorporate the new information.
- AI-Powered Chat Responses: Integrate the AI model to generate responses based on the provided context (uploaded .txt file and scraped website content) and display these responses in the chat window.

## Style Guidelines:

- Primary color: Dark background, as depicted in the image.
- Secondary color: Light text for readability against the dark background.
- Accent: A vibrant blue (#007BFF) to highlight interactive elements and the chat bubble outline.
- Clean, sans-serif font for both input and chat messages.
- Simple, outlined icons for the send button and the chat bubble.
- Rounded corners for the chat window and message bubbles.
- Smooth transitions when opening/closing the chat window.

## Original User Request:
I want to build an AI chatbot for my portfolio website. The chatbot will:
• Use an AI model via an API key that I will provide later (from Hugging Face).
• Use a single .txt file I will provide as a source of information about the website.
• If possible, be able to scrape content from a link I provide (e.g., sections or text from my site).
• Be embedded and fully functional in my portfolio website (React project).
Please help me set up:
• A backend (Node.js/Express) to securely handle the AI requests using my API key.
• A frontend chat interface with a text input and a chat window also with its bubble float where i can close and open from it, it should follow the attached design.
• A file upload option to upload the .txt file, which will be used as chatbot context.
• A way to scrape a website link I provide and use that as extra context.
Make sure the API key is kept secure (don't expose it in frontend), and guide me on how to replace it when needed.
Output the complete project structure, or at least the main code files, and explain each part if needed.
  