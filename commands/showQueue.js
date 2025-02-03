const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show current queue list'),

    async execute(interaction, queueManager) {
        const queueData = queueManager.getQueueData(interaction.guild.id);

        if (!queueData.isPlaying) {
            await interaction.reply('There is no song playing right now!');
            return;
        }
        
        const queueItems = queueData.songQueue.map((song, index) => `${index + 1}. ${song} \n`);

        await interaction.reply('💿 Current queue: \n' + queueItems.join(''));
    },
};