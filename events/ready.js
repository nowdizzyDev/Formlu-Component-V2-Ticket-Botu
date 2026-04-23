const config = require("../config.json");
const e = require("../emoji.json");

module.exports = (client) => {
  client.once("ready", () => {
    console.log(`${e.check} ${client.user.tag} aktif`);
    client.user.setPresence({
      activities: [{ name: `${config.serverName} | Destek`, type: 3 }],
      status: "online",
    });
  });
};
