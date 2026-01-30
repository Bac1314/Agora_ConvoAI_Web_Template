const axios = require('axios');

// Note: User returning status is now determined by presence of chat history

const getChannelInfo = (req, res) => {
  const { channel, uid } = req.query;
  
  if (!channel || !uid) {
    return res.status(400).json({ error: 'Channel and uid are required' });
  }

  try {
    res.json({ 
      appId: process.env.AGORA_APP_ID,
      channel,
      uid: parseInt(uid)
    });
  } catch (error) {
    console.error('Channel info error:', error);
    res.status(500).json({ error: 'Failed to get channel info' });
  }
};

const startConversation = async (req, res) => {
  try {
    const { channel, agentName, remoteUid, userName, previousConversations, voiceId } = req.body;
    
    if (!channel || !agentName || !remoteUid) {
      return res.status(400).json({ 
        error: 'Channel, agentName, and remoteUid are required' 
      });
    }

    const agentUid = Math.floor(Math.random() * 100000) + 1000;

    // Check if credentials are configured
    if (!process.env.AGORA_API_KEY || !process.env.AGORA_API_SECRET || !process.env.AGORA_APP_ID) {
      console.log('Agora credentials not configured, returning demo response');
      return res.json({
        success: true,
        agentId: `DEMO_AGENT_${Date.now()}`,
        agentUid: agentUid,
        channel: channel,
        demo: true,
        message: 'Demo mode - configure API credentials for full functionality'
      });
    }

    // Use provided system prompt or fall back to env variable or default
    const defaultSystemPrompt = "You are a friendly AI companion " || process.env.LLM_SYSTEM_PROMPT;

    const requestBody = {
      name: agentName,
      properties: {
        channel: channel,
        token: "", // Empty token for testing, should generate proper token for production
        agent_rtc_uid: agentUid.toString(),
        remote_rtc_uids: [remoteUid.toString()],
        enable_string_uid: false,
        idle_timeout: 30,
        asr: {
          vendor: "ares",
          language: "en-US"
        },
        llm: {
          url: process.env.LLM_URL,
          api_key: process.env.LLM_API_KEY,
          system_messages: [
            {
              role: "system",
              content: effectiveSystemPrompt
            }
          ],
          greeting_message: defaultSystemPrompt,
          failure_message: "Sorry, I'm having some trouble right now. Let me try again!",
          params: {
            model: process.env.LLM_MODEL || "gpt-4o-mini"
          },
          input_modalities: ["text", "image"],
          output_modalities: ["text"]
        },
        // tts: {
        //   vendor: "elevenlabs",
        //   params: {
        //     key: process.env.TTS_ElevenLabs_API_KEY,
        //     base_url: process.env.TTS_ElevenLabs_BASE_URL,
        //     voice_id: process.env.TTS_ElevenLabs_VOICE_ID,
        //     model_id: process.env.TTS_ElevenLabs_MODEL_ID, 
        //     sample_rate: 16000
        //   }
        // },
        // tts: { 
        //   vendor: "microsoft",
        //   params: {
        //     key: process.env.TTS_Microsoft_API_KEY,
        //     region: process.env.TTS_Microsoft_REGION,
        //     voice_name: process.env.TTS_Microsoft_VOICE, 
        //     sample_rate: 16000
        //   }
        // },
        tts: { 
          vendor: "minimax", 
          params: { 
            url: "wss://api-uw.minimax.io/ws/v1/t2a_v2",
            key: process.env.TTS_MINIMAX_API_KEY,
            group_id: process.env.TTS_MINIMAX_GROUP_ID,
            model: "speech-2.6-turbo",
            voice_setting: {
              voice_id: voiceId || process.env.TTS_MINIMAX_VOICE_ID
            },
            audio_setting: {
              sample_rate: 16000,
            }
          }
        },
        advanced_features: {
          enable_aivad: true,
          enable_bhvs: true,
          enable_rtm: true
        },
        parameters: {
          data_channel: "rtm",
          transcript: {
            redundant: false
          },
          silence_config: { 
            timeout_ms: 30000, // 30 seconds of silence detection
            action: "think", // Agent will think/respond after silence
            content: "User hasn't spoken for a while. Engage the user with a question or prompt."
          }
        }
      }
    };

    const auth = Buffer.from(`${process.env.AGORA_API_KEY}:${process.env.AGORA_API_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${process.env.AGORA_APP_ID}/join`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        }
      }
    );

    res.json({
      success: true,
      agentId: response.data.agent_id,
      agentUid: agentUid,
      avatarUid: avatarUid,
      channel: channel
    });

  } catch (error) {
    console.error('Agora API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to start conversation',
      details: error.response?.data || error.message
    });
  }
};

const stopConversation = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }

    // Check if credentials are configured
    if (!process.env.AGORA_API_KEY || !process.env.AGORA_API_SECRET || !process.env.AGORA_APP_ID) {
      console.log('Agora credentials not configured, simulating stop conversation');
      return res.json({ 
        success: true, 
        message: 'Conversation stopped (demo mode - no API credentials)',
        demo: true
      });
    }

    const auth = Buffer.from(`${process.env.AGORA_API_KEY}:${process.env.AGORA_API_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${process.env.AGORA_APP_ID}/agents/${agentId}/leave`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        }
      }
    );

    res.json({ success: true, message: 'Conversation stopped ' + response.data.message });

  } catch (error) {
    console.error('Stop conversation error:', error.response?.data || error.message);
    
    // Return success in demo mode to avoid blocking UI
    res.json({ 
      success: true, 
      message: 'Conversation stopped (demo mode - API error handled)',
      error: error.response?.data || error.message,
      demo: true
    });
  }
};

module.exports = {
  getChannelInfo,
  startConversation,
  stopConversation
};