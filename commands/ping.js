module.exports = async (message) => {
  if (message.content !== ".ping") return;
  const msg = await message.reply(`Ms: ...`);
  const ms = msg.createdTimestamp - message.createdTimestamp;
  await msg.edit(`Ms: ${ms}`);
};
