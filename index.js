const { Client, GatewayIntentBits } = require('discord.js');

// Client mit den benötigten Intents erstellen
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Sobald der Bot bereit ist
client.once('ready', () => {
    console.log('Bot ist online!');
});

// Reagiere auf Nachrichten
client.on('messageCreate', (message) => {
    if (message.content === '!hello') {
        message.reply('Hallo! Wie kann ich dir helfen?');
    }
});

// Logge den Bot mit deinem Token ein
client.login('MTMxNTEwNzg2MDk0MTYzOTc3Mg.GGtTwk.Dy7i_pskKGFNoZ8LFKKKG-d79xEHBgmnFBrn18');
