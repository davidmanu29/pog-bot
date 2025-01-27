const {
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus,
    createAudioResource,
    createAudioPlayer,
    AudioPlayerStatus,
    StreamType,
  } = require('@discordjs/voice');
  const ytdl = require('@distube/ytdl-core');
  
  class QueueManager {
    constructor() {
      this.queues = new Map();
    }
  
    getQueueData(guildId) {
      if (!this.queues.has(guildId)) {
        this.queues.set(guildId, {
          songQueue: [],
          connection: null,
          audioPlayer: createAudioPlayer(),
          isPlaying: false,
        });
  
        const queueData = this.queues.get(guildId);
        const { audioPlayer } = queueData;
  
        audioPlayer.on('stateChange', (oldState, newState) => {
          if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
            queueData.songQueue.shift();
            this.playNextSong(guildId);
          }
        });
  
        audioPlayer.on('error', (err) => {
          console.error('Audio player error:', err);
          audioPlayer.stop(); 
        });
      }
      return this.queues.get(guildId);
    }
  
    async addSong(guildId, voiceChannel, url) {
      const queueData = this.getQueueData(guildId);
      queueData.songQueue.push(url);
  
      if (!queueData.connection || queueData.connection.state.status === 'destroyed') {
        queueData.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        console.log(`[${guildId}] Joined voice channel: ${voiceChannel.id}`);
      }
  
      if (!queueData.isPlaying) {
        this.playNextSong(guildId);
      }
    }
  
    async playNextSong(guildId) {
      const queueData = this.getQueueData(guildId);
  
      if (queueData.songQueue.length === 0) {
        console.log(`[${guildId}] Queue empty, leaving channel.`);
        queueData.isPlaying = false;
        if (queueData.connection) {
          queueData.connection.destroy();
          queueData.connection = null;
        }
        return;
      }
  
      queueData.isPlaying = true;
      const nextUrl = queueData.songQueue[0];
      console.log(`[${guildId}] Now playing: ${nextUrl}`);
  
      try {
        await entersState(queueData.connection, VoiceConnectionStatus.Ready, 5000);
  
        const stream = ytdl(nextUrl, { filter: 'audioonly' });
        const resource = createAudioResource(stream, {
          inputType: StreamType.Arbitrary,
        });
  
        queueData.connection.subscribe(queueData.audioPlayer);
        queueData.audioPlayer.play(resource);
  
      } catch (err) {
        console.error(`[${guildId}] Error playing next song:`, err);
        queueData.songQueue.shift();
        this.playNextSong(guildId);
      }
    }
  }
  
  module.exports = QueueManager;
  