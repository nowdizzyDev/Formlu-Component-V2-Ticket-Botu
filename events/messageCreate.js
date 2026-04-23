const pingCmd = require("../commands/ping");
const ticketCmd = require("../commands/ticket");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    await pingCmd(message);
    await ticketCmd(message);
  });
};
