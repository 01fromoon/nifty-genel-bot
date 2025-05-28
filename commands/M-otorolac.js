import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from "discord.js";
import db from "croxydb";
import { SlashCommand } from "../app.js";

export default class OtorolAcCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("otorol-aç")
    .setDescription("Otorol sistemini açar ve ayarları belirler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(opt =>
      opt.setName("üyerolü")
        .setDescription("Üyelere verilecek rol")
        .setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName("botrolü")
        .setDescription("Botlara verilecek rol")
        .setRequired(true)
    )
    .addChannelOption(opt =>
      opt.setName("logkanalı")
        .setDescription("Otorol log kanalı")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: "❌ Bu komutu kullanmak için yönetici olmalısın.", ephemeral: true });
      return;
    }

    const uyeRol = interaction.options.getRole("uye_rolu");
    const botRol = interaction.options.getRole("bot_rolu");
    const logKanal = interaction.options.getChannel("log_kanali");

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ content: "❌ Rolleri atamak için 'Rolleri Yönet' yetkim yok.", ephemeral: true });
      return;
    }
    if (
      uyeRol.position >= interaction.guild.members.me.roles.highest.position ||
      botRol.position >= interaction.guild.members.me.roles.highest.position
    ) {
      await interaction.reply({ content: "❌ Ayarlanan roller, botun rolünün üstünde olmamalı.", ephemeral: true });
      return;
    }

    db.set(`otorol.${interaction.guild.id}`, {
      uyeRolId: uyeRol.id,
      botRolId: botRol.id,
      logKanalId: logKanal.id
    });

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Otorol Sistemi Aktif!")
          .setColor("Green")
          .setDescription(`Yeni üyelere <@&${uyeRol.id}>, yeni botlara <@&${botRol.id}> rolü verilecek.\nLog kanalı: ${logKanal}`)
      ]
    });
  }
}