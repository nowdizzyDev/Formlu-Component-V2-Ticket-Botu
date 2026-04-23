const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");

const { createTranscript } = require("discord-html-transcripts");
const config = require("../config.json");
const e = require("../emoji.json");

module.exports = (client, tickets, userTickets) => {
  client.on("interactionCreate", async (interaction) => {

    if (interaction.isButton() && interaction.customId === "ticket_open") {
      if (userTickets.has(interaction.user.id)) {
        return interaction.reply({
          content: `${e.warning} Zaten açık bir ticketın var: <#${userTickets.get(interaction.user.id)}>`,
          flags: MessageFlags.Ephemeral,
        });
      }
      const modal = new ModalBuilder().setCustomId("ticket_modal").setTitle("Ticket Aç");
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Açılma Sebebi")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(500)
        )
      );
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === "ticket_modal") {
      const reason = interaction.fields.getTextInputValue("reason");
      const ticketId = tickets.size + 1;
      const guild = interaction.guild;

      const channel = await guild.channels.create({
        name: `ticket-${ticketId}`,
        type: ChannelType.GuildText,
        parent: config.ticketCategoryId,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ],
      });

      tickets.set(channel.id, { ticketId, userId: interaction.user.id, reason });
      userTickets.set(interaction.user.id, channel.id);

      const container = new ContainerBuilder()
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(config.bannerUrl)
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${e.ticket} Ticket #${ticketId}\n\n` +
            `${e.wave} Merhaba <@${interaction.user.id}>, destek talebin başarıyla oluşturuldu!`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.user} **Açan:** <@${interaction.user.id}>\n` +
            `${e.reason} **Açılma Sebebi:**\n> ${reason}\n` +
            `${e.time} **Açılış Zamanı:** <t:${Math.floor(Date.now() / 1000)}:F>`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.support} Ekibimiz <@&${config.staffRoleId}> en kısa sürede seninle ilgilenecek.\n\n` +
            `${e.info} Lütfen sorununu veya talebini daha ayrıntılı açıklamaya devam edebilirsin.\n` +
            `Ekran görüntüsü, hata mesajı veya kanıt varsa bu kanala gönderebilirsin.\n\n` +
            `${e.warning} Ticket'ını gereksiz yere kapatmamaya özen göster.\n` +
            `${e.pray} Sabırlı olduğun için teşekkür ederiz!`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("ticket_add_user")
              .setEmoji(e.user)
              .setLabel("Kullanıcı Ekle")
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("ticket_remove_user")
              .setEmoji(e.user)
              .setLabel("Kullanıcı Kaldır")
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("ticket_close")
              .setEmoji(e.lock)
              .setLabel("Ticket Kapat")
              .setStyle(ButtonStyle.Danger)
          )
        );

      await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      return interaction.reply({
        content: `${e.check} Ticket kanalın açıldı: <#${channel.id}>`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (interaction.isButton() && interaction.customId === "ticket_add_user") {
      if (!interaction.member.roles.cache.has(config.staffRoleId))
        return interaction.reply({ content: `${e.cross} Yetkin yok.`, flags: MessageFlags.Ephemeral });
      const modal = new ModalBuilder().setCustomId("ticket_add_modal").setTitle("Kullanıcı Ekle");
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("user_id").setLabel("Kullanıcı ID").setStyle(TextInputStyle.Short).setRequired(true)
      ));
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === "ticket_add_modal") {
      const userId = interaction.fields.getTextInputValue("user_id");
      await interaction.channel.permissionOverwrites.edit(userId, { ViewChannel: true, SendMessages: true }).catch(() => {});
      return interaction.reply({ content: `${e.check} <@${userId}> eklendi.`, flags: MessageFlags.Ephemeral });
    }

    if (interaction.isButton() && interaction.customId === "ticket_remove_user") {
      if (!interaction.member.roles.cache.has(config.staffRoleId))
        return interaction.reply({ content: `${e.cross} Yetkin yok.`, flags: MessageFlags.Ephemeral });
      const modal = new ModalBuilder().setCustomId("ticket_remove_modal").setTitle("Kullanıcı Kaldır");
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("user_id").setLabel("Kullanıcı ID").setStyle(TextInputStyle.Short).setRequired(true)
      ));
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === "ticket_remove_modal") {
      const userId = interaction.fields.getTextInputValue("user_id");
      const ticketData = tickets.get(interaction.channel.id);
      if (ticketData && userId === ticketData.userId)
        return interaction.reply({ content: `${e.cross} Ticket sahibi kaldırılamaz.`, flags: MessageFlags.Ephemeral });
      await interaction.channel.permissionOverwrites.delete(userId).catch(() => {});
      return interaction.reply({ content: `${e.check} <@${userId}> kaldırıldı.`, flags: MessageFlags.Ephemeral });
    }

    if (interaction.isButton() && interaction.customId === "ticket_close") {
      if (!interaction.member.roles.cache.has(config.staffRoleId))
        return interaction.reply({ content: `${e.cross} Yetkin yok.`, flags: MessageFlags.Ephemeral });

      const ticketData = tickets.get(interaction.channel.id);
      if (!ticketData) return;

      await interaction.reply({ content: `${e.lock} Ticket kapatılıyor, transcript hazırlanıyor...` });

      const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
      if (logChannel) {
        const attachment = await createTranscript(interaction.channel, {
          filename: `ticket-${ticketData.ticketId}.html`,
          saveImages: true,
          poweredBy: false,
        });
        const logContainer = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${e.log} Ticket #${ticketData.ticketId} Transcript\n\n` +
            `${e.user} **Açan:** <@${ticketData.userId}>\n` +
            `${e.lock} **Kapatan:** <@${interaction.user.id}>\n` +
            `${e.reason} **Sebep:** ${ticketData.reason}\n` +
            `${e.time} **Kapanış:** <t:${Math.floor(Date.now() / 1000)}:F>`
          )
        );
        await logChannel.send({ components: [logContainer], flags: MessageFlags.IsComponentsV2 });
        await logChannel.send({ files: [attachment] });
      }

      await interaction.channel.permissionOverwrites.edit(ticketData.userId, { ViewChannel: false }).catch(() => {});
      await interaction.channel.setParent(config.archiveCategoryId, { lockPermissions: false }).catch(() => {});
      await interaction.channel.setName(`arsiv-${ticketData.ticketId}`).catch(() => {});
      userTickets.delete(ticketData.userId);

      const reopenContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${e.lock} **Ticket kapatıldı.**\n` +
            `Kapatan: <@${interaction.user.id}> — <t:${Math.floor(Date.now() / 1000)}:R>\n\n` +
            `Yeniden açmak veya silmek için aşağıdaki butonları kullan.`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("ticket_reopen")
              .setEmoji(e.ticket)
              .setLabel("Yeniden Aç")
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId("ticket_delete")
              .setEmoji(e.cross)
              .setLabel("Sil")
              .setStyle(ButtonStyle.Danger)
          )
        );

      await interaction.channel.send({ components: [reopenContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (interaction.isButton() && interaction.customId === "ticket_delete") {
      if (!interaction.member.roles.cache.has(config.staffRoleId))
        return interaction.reply({ content: `${e.cross} Yetkin yok.`, flags: MessageFlags.Ephemeral });

      const ticketData = tickets.get(interaction.channel.id);
      if (ticketData) {
        userTickets.delete(ticketData.userId);
        tickets.delete(interaction.channel.id);
      }

      await interaction.reply({ content: `${e.cross} Kanal siliniyor...` });
      await interaction.channel.delete().catch(() => {});
      return;
    }

    if (interaction.isButton() && interaction.customId === "ticket_reopen") {
      if (!interaction.member.roles.cache.has(config.staffRoleId))
        return interaction.reply({ content: `${e.cross} Yetkin yok.`, flags: MessageFlags.Ephemeral });

      const ticketData = tickets.get(interaction.channel.id);
      if (!ticketData) return;

      if (userTickets.has(ticketData.userId)) {
        return interaction.reply({
          content: `${e.warning} Kullanıcının zaten açık bir ticketi var: <#${userTickets.get(ticketData.userId)}>`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.channel.setParent(config.ticketCategoryId, { lockPermissions: false }).catch(() => {});
      await interaction.channel.setName(`ticket-${ticketData.ticketId}`).catch(() => {});
      await interaction.channel.permissionOverwrites.edit(ticketData.userId, {
        ViewChannel: true,
        SendMessages: true,
      }).catch(() => {});

      userTickets.set(ticketData.userId, interaction.channel.id);

      return interaction.reply({
        content: `${e.check} Ticket yeniden açıldı. <@${ticketData.userId}> tekrar erişebilir.`,
      });
    }
  });
};
