const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current song'),

  async execute(interaction, queueManager) {
    const queueData = queueManager.getQueueData(interaction.guild.id);

    if (!queueData.isPlaying) {
      await interaction.reply('There is no song playing right now!');
      return;
    }

    queueData.audioPlayer.stop();

    await interaction.reply('Skipped the current song!');
  },
};
