const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with a Pong!'),

  async execute(interaction) {
    await interaction.reply('Dang lil boy');
  },
};