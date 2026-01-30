// Simple Agora Audio Call demo
// Requires Agora RTC SDK script to be loaded first

const appIdInput = document.getElementById('appId');
const tokenInput = document.getElementById('token');
const channelInput = document.getElementById('channel');
const startMicBtn = document.getElementById('startMic');
const joinBtn = document.getElementById('join');
const leaveBtn = document.getElementById('leave');
const muteBtn = document.getElementById('mute');
const remoteList = document.getElementById('remoteList');
const remoteAudio = document.getElementById('remoteAudio');

let client;
let localAudioTrack;
let joined = false;
let muted = false;

function setButtonStates() {
  startMicBtn.disabled = !!localAudioTrack;
  joinBtn.disabled = !localAudioTrack || joined;
  leaveBtn.disabled = !joined;
  muteBtn.disabled = !joined;
  muteBtn.textContent = muted ? 'Unmute' : 'Mute';
}

async function startMic() {
  try {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    startMicBtn.textContent = 'Microphone Ready';
    startMicBtn.disabled = true;
    joinBtn.disabled = false;
  } catch (err) {
    alert('Microphone access denied or not available: ' + err.message);
  }
}

async function joinChannel() {
  const appId = appIdInput.value.trim();
  const token = tokenInput.value.trim() || null;
  const channel = channelInput.value.trim();

  if (!appId) return alert('Please enter an Agora App ID');
  if (!channel) return alert('Please enter a channel name');

  client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

  client.on('user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === 'audio') {
      const remoteAudioTrack = user.audioTrack;
      // Play remote audio in the available audio element
      remoteAudioTrack.play(remoteAudio);
    }
  });

  client.on('user-unpublished', user => {
    // Nothing fancy for now; if needed, stop remote audio
  });

  try {
    await client.join(appId, channel, token, null);
    await client.publish([localAudioTrack]);
    joined = true;
    setButtonStates();
    leaveBtn.disabled = false;
  } catch (err) {
    console.error(err);
    alert('Failed to join/publish: ' + err.message);
  }
}

async function leaveChannel() {
  if (!client) return;
  try {
    await client.unpublish();
  } catch (e) {
    // ignore
  }
  try {
    await client.leave();
  } catch (e) {
    console.warn('Error leaving channel', e);
  }
  joined = false;
  // stop local track
  if (localAudioTrack) {
    localAudioTrack.stop();
    localAudioTrack.close();
    localAudioTrack = null;
  }
  // clear remote audio
  remoteAudio.srcObject = null;
  setButtonStates();
}

function toggleMute() {
  if (!localAudioTrack) return;
  muted = !muted;
  localAudioTrack.setEnabled(!muted);
  setButtonStates();
}

startMicBtn.addEventListener('click', startMic);
joinBtn.addEventListener('click', joinChannel);
leaveBtn.addEventListener('click', leaveChannel);
muteBtn.addEventListener('click', toggleMute);

// When microphone available, enable join
setButtonStates();
