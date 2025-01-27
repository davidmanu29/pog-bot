const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token, guildId } = require('./config.json');
const ffmpegPath = require('ffmpeg-static');

const QueueManager = require('./queue/queueManager');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const queueManager = new QueueManager();

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  //each command should export {data, execute} where data is the command and execute the function
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, async c => {
  console.log(`Logged in as ${c.user.tag}`);

  try {
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
      console.error('Guild with ID "${guildId}" not found in cache.');
      return;
    }

    await guild.commands.set(client.commands.map(cmd => cmd.data));
    console.log(`Slash commands registered locally to guild ID ${guildId}`);
    } 
    catch (err) {
        console.error('Error registering guild commands:', err);
    }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, queueManager);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Error client.on', ephemeral: true });
  }
});

client.login(token);