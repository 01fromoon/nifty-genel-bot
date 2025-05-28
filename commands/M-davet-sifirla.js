import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("davet-sıfırla")
    .setDescription("🎟️ Davet sistemini kapatır.");

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    const before = db.get(`davetSistemi_${interaction.guild.id}`);
    if (!before) {
      return interaction.reply({ content: "❌ | Davet sistemi zaten kapalı!", ephemeral: true });
    }

    db.delete(`davetSistemi_${interaction.guild.id}`);

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🎟️ Davet Sistemi Kapatıldı!")
      .setDescription("Artık davet giriş/çıkış mesajları gönderilmeyecek.");

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}