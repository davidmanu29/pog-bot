const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a YouTube link')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('The YouTube URL of the song to play')
        .setRequired(true)
    ),

  async execute(interaction, queueManager) {
    const songUrl = interaction.options.getString('url');

    if (!songUrl || !ytdl.validateURL(songUrl)) {
      await interaction.reply('Please provide a valid YouTube URL!');
      return;
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply('You need to join a voice channel first!');
      return;
    }

    try {
      await queueManager.addSong(interaction.guild.id, voiceChannel, songUrl);
      await interaction.reply(`Added to queue: ${songUrl}`);
    } catch (err) {
      console.error('Error adding song to queue:', err);
      await interaction.reply('Failed to add the song to the queue!');
    }
  },
};
