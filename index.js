require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

const path = './data.json';

// Erstelle den Bot-Client mit den richtigen Intents
const client = new Client({
intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
],
});

// Funktion zum Abrufen der Benutzerdaten aus der data.json
function getUserStats(userId) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        const jsonData = JSON.parse(data);
        const userStats = jsonData[userId];

        if (userStats) {
            return userStats;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error reading or parsing the data file:', error);
        return null;
    }
}

// Funktion zum Speichern der Benutzerdaten in der data.json
function saveUserStats(userId, stats) {
    try {
        // Versuche, die Datei zu laden
        let jsonData = {};
        try {
            const data = fs.readFileSync(path, 'utf8');
            jsonData = JSON.parse(data);
        } catch (error) {
            console.log('No existing data file found, creating a new one.');
        }

        // Aktualisiere die Benutzerdaten
        jsonData[userId] = stats;

        // Speichere die aktualisierten Daten zurück in die Datei
        fs.writeFileSync(path, JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to the data file:', error);
    }
}

// Beispiel-Slash-Commands
const commands = [
{
    name: 'hello',
    description: 'Says hello!',
},
{
    name: 'stats',
    description: 'Shows statistics of a user',
    options: [
    {
        type: 6, // User-Option
        name: 'user',
        description: 'Select a user',
        required: false,
    },
    ],
},
{
    name: 'rank',
    description: 'Shows the roles of a user',
    options: [
    {
        type: 6, // User-Option
        name: 'user',
        description: 'Select a user',
        required: false,
    },
    ],
},
{
    name: 'logflight',
    description: 'Log a flight and add Aeropoints',
    options: [
    {
        type: 4, // Integer-Option für Aeropoints
        name: 'aeropoints',
        description: 'Enter the Aeropoints for the flight',
        required: true,
    },
    ],
},
{
    name: 'members',
    description: 'Shows the number of members in the server',
},
{
    name: 'serverinfo',
    description: 'Shows the server information',
},
{
    name: 'userinfo',
    description: 'Shows basic information about a user',
    options: [
    {
        type: 6, // User-Option
        name: 'user',
        description: 'Select a user',
        required: false,
    },
    ],
},
{
    name: 'ping',
    description: 'Pings the bot to check its latency',
},
{
    name: 'help',
    description: 'Lists all available commands and explains them briefly',
},
{
    name: 'suggest',
    description: 'Make a suggestion for the bot or server',
    options: [
    {
        type: 3, // String-Option für Vorschläge
        name: 'suggestion',
        description: 'Enter your suggestion',
        required: true,
    },
    ],
},
];

// Registrierung der Slash-Befehle bei Discord
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
try {
    console.log('Starting command registration...');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
    });

    console.log('Slash commands registered successfully!');
} catch (error) {
    console.error('Error registering Slash commands:', error);
}
})();

// Wenn der Bot bereit ist
client.on('ready', () => {
console.log(`${client.user.tag} is now online!`);
});

// Behandle Interaktionen (Slash-Befehle)
client.on('interactionCreate', async (interaction) => {
if (!interaction.isCommand()) return;

const { commandName } = interaction;

  // /hello Befehl
if (commandName === 'hello') {
    await interaction.reply(`Hello ${interaction.user.tag}! How are you?`);
}

  // /stats Befehl
if (commandName === 'stats') {
    const user = interaction.options.getUser('user') || interaction.user;
    const userStats = getUserStats(user.id);

    if (userStats) {
    await interaction.reply(`${user.tag}'s stats: \nAeropoints: ${userStats.aeropoints} \nTotal Flights: ${userStats.totalFlights}`);
    } else {
    await interaction.reply(`${user.tag} has no stats available yet.`);
    }
}

  // /rank Befehl - Zeige alle Rollen eines Benutzers
if (commandName === 'rank') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const roles = member.roles.cache.map(role => role.name).join(', ');
    await interaction.reply(`The roles of ${user.tag} are: ${roles}`);
}

  // /logflight Befehl - Logge einen Flug und füge Aeropoints hinzu
if (commandName === 'logflight') {
    const aeropoints = interaction.options.getInteger('aeropoints');
    const user = interaction.user.id;

    let userStats = getUserStats(user);

    if (!userStats) {
    userStats = { aeropoints: 0, totalFlights: 0 };
    }

    userStats.aeropoints += aeropoints;
    userStats.totalFlights += 1;

    saveUserStats(user, userStats);

    await interaction.reply(`${interaction.user.tag}, you have successfully logged a flight with ${aeropoints} Aeropoints!`);
}

  // /members Befehl - Zeige die Anzahl der Mitglieder des Servers
if (commandName === 'members') {
    const memberCount = interaction.guild.memberCount;
    await interaction.reply(`The server has ${memberCount} members.`);
}

  // /serverinfo Befehl - Zeige die Server-Informationen
if (commandName === 'serverinfo') {
    const serverName = interaction.guild.name;
    const serverOwner = interaction.guild.ownerId;
    const serverRegion = interaction.guild.preferredLocale;
    const memberCount = interaction.guild.memberCount;
    await interaction.reply(`Server Info: \nName: ${serverName} \nOwner: <@${serverOwner}> \nRegion: ${serverRegion} \nTotal Members: ${memberCount}`);
}

  // /userinfo Befehl - Zeige Informationen über einen Benutzer
if (commandName === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const joinedDate = member.joinedAt;
    await interaction.reply(`User Info:\nUsername: ${user.tag}\nID: ${user.id}\nJoined: ${joinedDate}`);
}

  // /ping Befehl - Überprüfe die Latenz des Bots
if (commandName === 'ping') {
    await interaction.reply(`Pong! Latency is ${client.ws.ping}ms.`);
}

  // /help Befehl - Liste alle verfügbaren Befehle auf
if (commandName === 'help') {
    const helpMessage = `
    Available Commands:
    /hello: Says hello!
    /stats: Shows statistics of a user
    /rank: Shows the roles of a user
    /members: Shows the current members of the server
    /logflight: Logs a flight and adds aeropoints to the user
    /userinfo: Shows basic information about a user
    /serverinfo: Shows information about the server
    /ping: Pings the bot to check its status
    /suggest: Make a suggestion for the bot or server
    `;
    await interaction.reply(helpMessage);
}

  // /suggest Befehl - Vorschläge machen
if (commandName === 'suggest') {
    const suggestion = interaction.options.getString('suggestion');
    await interaction.reply(`Thank you for your suggestion: "${suggestion}"`);
}
});

// Login zum Bot
client.login(token);
