import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time } from "discord.js";
import { SlashCommand } from "../app.js";

function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

export default class TimeoutCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Bir kullanıcıya süreli timeout (sessiz) uygular.")
    .addUserOption(opt =>
      opt.setName("kullanıcı")
        .setDescription("Timeout uygulanacak üye")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("süre")
        .setDescription("Süre: 10s, 5m, 1h, 7d (s: saniye, m: dakika, h: saat, d: gün)")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("sebep")
        .setDescription("Timeout sebebi")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

  async execute(client, interaction) {
    const target = interaction.options.getUser("kullanıcı");
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const sure = interaction.options.getString("süre");
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({content: "❌ Timeout için `Üyeleri Zaman Aşımına Uğrat` yetkin olmalı.", ephemeral: true});
    }
    if (!member || !member.moderatable) {
      return interaction.reply({content: "❌ Bu kullanıcıya timeout uygulanamıyor.", ephemeral: true});
    }
    if (member.id === interaction.user.id) {
      return interaction.reply({ content: "❌ Kendine timeout atamazsın!", ephemeral: true });
    }
    if (member.id === interaction.guild.ownerId) {
      return interaction.reply({ content: "❌ Sunucu sahibine timeout atamazsın!", ephemeral: true });
    }
    if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({ content: "❌ Senden yüksek veya eşit yetkili kişiye timeout atamazsın.", ephemeral: true });
    }

    const ms = parseDuration(sure);
    if (!ms || ms < 10000 || ms > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: "❌ Süreyi doğru gir! (10s-28d arası, ör: 10m, 2h, 1d)", ephemeral: true });
    }

    await member.timeout(ms, `${sebep} (by ${interaction.user.tag})`);

    const embed = new EmbedBuilder()
      .setTitle("⏳ Kullanıcıya timeout atıldı!")
      .setColor("Orange")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "Kullanıcı", value: `${member} (\`${member.user.tag}\`)`, inline: true },
        { name: "Yetkili", value: `${interaction.user}`, inline: true },
        { name: "Süre", value: sure, inline: true },
        { name: "Sebep", value: sebep }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}