# Agora Conversational AI Web Template

A web application template for building conversational AI experiences using Agora's Real-Time Communication (RTC) and Real-Time Messaging (RTM) SDKs with integrated speech recognition, language models, and text-to-speech capabilities.

## Features

- **Real-Time Voice Communication** - Powered by Agora RTC SDK
- **Real-Time Messaging** - Agora RTM for text-based interactions
- **Conversational AI Integration** - Support for multiple LLM providers (OpenAI, custom endpoints)
- **Speech Recognition** - Automatic Speech Recognition (ASR) with ARES vendor
- **Text-to-Speech** - Multiple TTS vendor support (Microsoft, ElevenLabs, MiniMax)
- **Secure Authentication** - HTTP Basic Auth with optional IP whitelisting
- **Token Generation** - Secure Agora token generation for RTC and RTM

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Agora account with App ID and App Certificate

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Agora_ConvoAI_Web_Template.git
cd Agora_ConvoAI_Web_Template
```

2. Install dependencies:
```bash
npm install --force
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Configuration

### Required Environment Variables

#### Agora Credentials
- `AGORA_APP_ID` - Your Agora App ID from [Agora Console](https://console.agora.io/)
- `AGORA_APP_CERTIFICATE` - Your Agora App Certificate
- `AGORA_API_KEY` - API key for Agora Conversational AI
- `AGORA_API_SECRET` - API secret for Agora Conversational AI

#### LLM Configuration
- `LLM_URL` - LLM endpoint URL (e.g., OpenAI API)
- `LLM_API_KEY` - API key for the LLM service
- `LLM_MODEL` - Model to use (default: gpt-4o-mini)
- `LLM_SYSTEM_PROMPT` - Custom system prompt for the AI agent

#### TTS Configuration (MiniMax)
- `TTS_MINIMAX_API_KEY` - MiniMax API key
- `TTS_MINIMAX_GROUP_ID` - MiniMax group ID
- `TTS_MINIMAX_VOICE_ID` - Voice ID (default: English_PlayfulGirl)

### Optional Configuration

#### Authentication
- `AUTH_USERNAME` - Username for basic auth (leave blank to disable)
- `AUTH_PASSWORD` - Password for basic auth

#### Security
- `ALLOWED_IPS` - Comma-separated list of allowed IP addresses
- `PORT` - Server port (default: 3000)

## Project Structure

```
├── backend/
│   ├── server.js              # Express server setup
│   ├── controllers/
│   │   └── agoraController.js # Agora API integration
│   ├── routes/
│   │   └── agora_routes.js    # API endpoints
│   └── middleware/
│       └── auth.js             # Authentication middleware
├── frontend/
│   ├── index.html              # Main UI
│   ├── app.js                  # Frontend application logic
│   ├── styles.css              # Styling
│   └── utils/
│       └── config.js           # Frontend configuration
├── package.json
├── .env.example                # Environment variables template
└── CLAUDE.md                   # AI assistant documentation
```

## API Endpoints

### GET `/api/agora/channel-info`
Get channel information and token for joining.

Query parameters:
- `channel` - Channel name
- `uid` - User ID

### POST `/api/agora/start-conversation`
Start a conversational AI agent.

Request body:
```json
{
  "channel": "channel_name",
  "agentName": "agent_name",
  "remoteUid": 123,
  "voiceId": "optional_voice_id"
}
```

### POST `/api/agora/stop-conversation/:agentId`
Stop an active conversation.

## Usage

1. **Join a Channel**: Click the "Join" button to start a conversation with the AI agent
2. **Speak**: The AI agent will listen and respond to your voice input
3. **Leave**: Click "Leave" to end the conversation

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build command (no-op for vanilla JS)
- `npm test` - Run tests (not configured)

### Security Considerations

- Always use HTTPS in production
- Keep your API credentials secure
- Enable authentication for production deployments
- Consider implementing rate limiting
- Use environment variables for sensitive data
- Never commit `.env` file to version control

## Customization

### System Prompt
Modify the `LLM_SYSTEM_PROMPT` in your `.env` file to customize the AI agent's personality and behavior.

### Voice Selection
Change the `TTS_MINIMAX_VOICE_ID` to use different voice profiles:
- English_PlayfulGirl (default)
- Other voice options available in MiniMax documentation

### Frontend UI
The frontend uses vanilla JavaScript and can be easily customized by modifying:
- `frontend/index.html` - UI structure
- `frontend/styles.css` - Visual styling
- `frontend/app.js` - Application behavior

## Troubleshooting

### Common Issues

1. **"Channel info not initialized"**
   - Ensure all Agora credentials are correctly set in `.env`
   - Check network connectivity to Agora servers

2. **"Failed to start conversation"**
   - Verify API_KEY and API_SECRET are correct
   - Check if your Agora app has Conversational AI enabled

3. **No audio input/output**
   - Check browser microphone permissions
   - Ensure HTTPS is used (required for WebRTC)

## License

MIT

## Support

For issues and questions:
- [Agora Documentation](https://docs.agora.io/)
- [GitHub Issues](https://github.com/yourusername/Agora_ConvoAI_Web_Template/issues)