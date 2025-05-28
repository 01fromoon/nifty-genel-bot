import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("reklam-engel")
    .setDescription("🚫 Reklam engel sistemini açar veya kapatır.")
    .addStringOption(opt =>
      opt.setName("durum")
        .setDescription("Sistemi aç veya kapat")
        .addChoices(
          { name: "Aç", value: "aç" },
          { name: "Kapat", value: "kapat" }
        )
        .setRequired(true)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    const durum = interaction.options.getString("durum");
    if (durum === "aç") {
      db.set(`reklamEngel_${interaction.guild.id}`, true);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🚫 Reklam Engel Sistemi Aktif!")
        .setDescription("Artık reklam içeren mesajlar otomatik olarak silinecek ve uyarı gönderilecek.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      db.delete(`reklamEngel_${interaction.guild.id}`);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("🚫 Reklam Engel Sistemi Kapalı!")
        .setDescription("Reklam engelleme artık devre dışı.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}