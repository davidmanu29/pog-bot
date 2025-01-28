const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');
const ytsr = require('ytsr');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Plays a YouTube link or searches for a song by name')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('The YouTube URL or name of the song to play')
        .setRequired(true)
    ),

  async execute(interaction, queueManager) {
    const query = interaction.options.getString('query').trim();

    let songUrl = query;

    const isValidYouTubeURL = (url) => ytdl.validateURL(url);

    if (!isValidYouTubeURL(query)) {
      await interaction.deferReply();
      try {
        const searchResults = await ytsr(query, { limit: 5 });

        const videoResults = searchResults.items.filter(item => item.type === 'video');

        if (videoResults.length === 0) {
          await interaction.editReply('❌ No video results found for your query.');
          return;
        }

        const selectedVideo = videoResults[0];
        songUrl = selectedVideo.url;

        await interaction.editReply(`🔍 Found and selected: **${selectedVideo.title}**\n${songUrl}`);
      } catch (error) {
        console.error('Error during YouTube search:', error);
        await interaction.editReply('❌ An error occurred while searching for the song.');
        return;
      }
    } else {
      await interaction.deferReply();
      await interaction.editReply(`🎶 Playing: ${songUrl}`);
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      await interaction.followUp('❌ You need to join a voice channel first!');
      return;
    }

    try {
      await queueManager.addSong(interaction.guild.id, voiceChannel, songUrl);
      await interaction.followUp(`✅ Added to queue: <${songUrl}>`);
    } catch (err) {
      console.error('Error adding song to queue:', err);
      await interaction.followUp('❌ Failed to add the song to the queue!');
    }
  },
};
