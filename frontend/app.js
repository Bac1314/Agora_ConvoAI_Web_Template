// Secure app wrapper to prevent console access
(function() {
  // Private variables - not accessible from console
  let rtcClient = null;
  let rtcLocalAudioTrack;
  let rtcJoined = false;
  let rtcMicMuted = false;
  let rtcRemoteUsers = {};
  let rtmClient = null;
  let agoraConvoAIAgentID = null;
  let agoraChannel = null;
  let agoraUserUID = 123;
  let agoraChannelInfo = null; 

  // UI Elements
  const joinBtn = document.getElementById('join');
  const leaveBtn = document.getElementById('leave');
  const muteBtn = document.getElementById('mute');

  init() // Initialize the app

  async function init() { 
    try { 
      // Step 1 - Fetch the necessary info AppID, Channel, Tokens, etc from backend 
      agoraChannel = UTILS.generateChannelName();
      
      // Fetch public channel/app info from backend. Keep in-memory only.
      agoraChannelInfo = await API.agora.getChannelInfo(agoraChannel, agoraUserUID);
            
      // Step 2a - Initialize RTC client
      if (rtcClient == null) { 
        rtcClient = AgoraRTC.createClient({ mode: "live", codec: "vp8", role: 'host' });
        rtcClient.on("user-published", handleRTCUserPublished);
        rtcClient.on("user-unpublished", handleRTCUserUnpublished);
      }
      // Step 2b - Initialize RTM client
      if (rtmClient == null) { 
        rtmClient = new AgoraRTM.RTM(agoraChannelInfo.appId, agoraUserUID.toString());
        rtmClient.on('message', handleRTMMessage);
        rtmClient.on('presence', handleRTMPresenceEvent);
      }
      // Step 3 - Init UI Event listeners
      joinBtn.addEventListener('click', startAgoraConvoAIAgent);
      leaveBtn.addEventListener('click', stopAgoraConvoAIAgent);
      // muteBtn.addEventListener('click', toggleMute);
    }catch (e) {  
      console.error('Init failed', e);
    }
  }

  async function startAgoraConvoAIAgent() {
    try { 
      if (!agoraChannelInfo) return alert('Channel info not initialized');
      const response = await API.agora.startConversation({
        channel: agoraChannelInfo.channel,
        agentName: "AgoraConvoAI_"+agoraChannelInfo.channel,
        remoteUid: agoraUserUID,
      });

      agoraConvoAIAgentID = response.agentId;

      await joinRTCChannel(agoraChannelInfo.appId, agoraChannelInfo.channel, agoraChannelInfo.uid, agoraChannelInfo.token);
      await joinRTMChannel(agoraChannelInfo.channel, agoraChannelInfo.uid, agoraChannelInfo.token);
      
      joinBtn.disabled = true;
      leaveBtn.disabled = false;
    }catch (e) {
      console.error('Failed to start ConvoAI agent', e);
    }
  }

  async function stopAgoraConvoAIAgent() {
    try { 
      if (!agoraConvoAIAgentID) return;
      await API.agora.stopConversation(agoraConvoAIAgentID);
      agoraConvoAIAgentID = null;
      
      if (rtcJoined) {
        await rtcClient.leave();
        rtcJoined = false;
      }
      if (rtmClient) {
        await rtmClient.logout();
      }
      
      joinBtn.disabled = false;
      leaveBtn.disabled = true;
    }catch (e) {
      console.error('Failed to stop ConvoAI agent', e);
    }
  }

  async function joinRTCChannel(appId, channel, uid, token) {
    rtcLocalAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    try {
      await rtcClient.join(appId, channel, token || null, uid);
      await rtcClient.publish([rtcLocalAudioTrack]);
      rtcJoined = true;
      leaveBtn.disabled = false;
    } catch (err) {
      console.error(err);
      alert('Failed to join/publish: ' + err.message);
    }
  }

  async function joinRTMChannel(channel, uid, token) {
    try {
      await rtmClient.login({ token: token || null, uid: uid.toString() });
      await rtmClient.subscribe(channel);
    } catch (err) {
      console.error('RTM join failed', err);
    }
  }

  async function rtcSubscribe(user, mediaType) {
    // subscribe to a remote user
    if (mediaType === 'audio') {
      await rtcClient.subscribe(user, mediaType);
      user.audioTrack.play();
    }
  }

  function handleRTCUserPublished(user, mediaType) {
    const id = user.uid;
    rtcRemoteUsers[id] = user;
    rtcSubscribe(user, mediaType);
  }

  function handleRTCUserUnpublished(user) {
    delete rtcRemoteUsers[user.uid];
  }

  function handleRTMMessage(event) {
    try {
      console.log('RTM message received:', event);
    } catch (error) {
      console.error('Error handling RTM message:', error);
    }
  }

  function handleRTMPresenceEvent(event) {
    try {
      console.log('RTM presence event received:', event);
    } catch (error) {
      console.error('Error handling RTM presence event:', error);
    }
  }

})(); // Close the IIFE to protect variables from console access