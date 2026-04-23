const {
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");

const config = require("../config.json");
const e = require("../emoji.json");

module.exports = async (message) => {
  if (message.content !== ".ticket") return;
  if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;

  const container = new ContainerBuilder()
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(config.bannerUrl)
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${e.support} Destek Merkezi\n\n` +
        `${e.wave} Sunucumuza hoş geldin!\n\n` +
        `Herhangi bir konuda yardıma ihtiyaç duyuyorsan, aşağıdaki butona tıklayarak bir destek talebi oluşturabilirsin.`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.info} **Ticket açmadan önce:**\n` +
        `> ${e.star} Sorununu veya talebini açık ve net şekilde belirt\n` +
        `> ${e.star} Ekran görüntüsü veya kanıt varsa hazır bulundur\n` +
        `> ${e.star} Gereksiz ticket açmaktan kaçın`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${e.time} Ekibimiz en kısa sürede sana geri dönecektir.`
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_open")
          .setEmoji(e.ticket)
          .setLabel("Ticket Aç")
          .setStyle(ButtonStyle.Primary)
      )
    );

  await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  await message.delete().catch(() => {});
};
