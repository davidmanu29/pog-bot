const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the music, clears the queue, and disconnects the bot'),

  async execute(interaction, queueManager) {
    const queueData = queueManager.getQueueData(interaction.guild.id);

    if (!queueData.connection || !queueData.isPlaying) {
      return await interaction.reply('Nothing is currently playing!');
    }

    queueData.audioPlayer.stop();

    queueData.songQueue = [];
    queueData.isPlaying = false;

    queueData.connection.destroy();
    queueData.connection = null;

    await interaction.reply('Stopped playback, cleared the queue, and disconnected!');
  },
};
