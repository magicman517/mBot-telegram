# Telegram AI Chat & Voice Transcription Bot

This is a simple Telegram bot designed for chatting with AI and transcribing voice messages using AI technologies. The bot is intended to be lightweight and portable, utilizing SQLite as the database.

## Features

- **Chat with AI**: The bot allows users to interact with an AI powered by the Groq (GroqCloud) API for intelligent conversation.
- **Voice Message Transcription**: Users can send voice messages to the bot, which are then transcribed into text using Groq-based AI transcription services.
- **Portable**: The project uses SQLite for data storage, making it easy to move and set up without needing complex database infrastructure.

## Technologies Used

- **Deno**: A secure runtime for JavaScript and TypeScript.
- **SQLite**: A lightweight database used to store user information and interaction logs.
- **Groq (GroqCloud) API**: The AI for both chat and transcription is provided by Groq's API.
- **Telegram Bot API**: The bot is developed using [grammy](https://grammy.dev/) library for handling Telegram bot functionality.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Deno](https://deno.com/)
- A Telegram Bot Token (You can get one from [BotFather](https://t.me/BotFather))
- Groq API Key (Sign up at [GroqCloud](https://console.groq.com))

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/magicman517/mBot-telegram.git
   cd mBot-telegram
   ```

2. **Create a `.env` file**:
   Create a `.env` file in the root of your project and add your Telegram bot token and Groq API key:
   ```bash
   BOT_TOKEN=your-telegram-bot-token
   GROQ_API_KEY=your-groq-api-key
   ```

3. **Run the bot**:
   ```bash
   deno run bot
   ```

## Usage

Once the bot is running, you can interact with it via Telegram by searching for your bot's username and starting a conversation. The bot will:

- Respond to text messages with AI-generated responses from Groq API.
- Transcribe voice messages, audio files, video notes sent to the chat using Groq-based transcription services.
