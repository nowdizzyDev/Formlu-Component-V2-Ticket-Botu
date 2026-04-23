require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const tickets = new Map();
const userTickets = new Map();

require("./events/ready")(client);
require("./events/messageCreate")(client);
require("./events/interactionCreate")(client, tickets, userTickets);

client.login(process.env.TOKEN);
