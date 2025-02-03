const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('np')
    .setDescription('Shows now playing'),

    async execute(interaction, queueManager) {
        const queueData = queueManager.getQueueData(interaction.guild.id);

        if (!queueData.isPlaying) {
            await interaction.reply('There is no song playing right now!');
            return;
        }
        
        const nowPlaying = queueData.songQueue[0];

        await interaction.reply('💿 Now playing: ' + nowPlaying);
    },
};