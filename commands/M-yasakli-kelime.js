import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } from "discord.js";
import { SlashCommand } from "../app.js";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("yasaklı-kelime")
    .setDescription("🚫 Yasaklı kelime panelini açar. (Sadece yönetici)");

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🚫 Yasaklı Kelime Sistemi")
      .setColor("Red")
      .setDescription([
        "・ Yasaklı kelime eklemek için **Ekle** butonuna tıklayın",
        "・ Yasaklı kelime silmek için **Sil** butonuna tıklayın",
        "・ Kelime listesine bakmak için **Yasaklı Kelimeler** butonuna tıklayın"
      ].join("\n"));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("yasakliKelimeEkle")
        .setLabel("Ekle")
        .setStyle(ButtonStyle.Success)
        .setEmoji("➕"),
      new ButtonBuilder()
        .setCustomId("yasakliKelimeSil")
        .setLabel("Sil")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("➖"),
      new ButtonBuilder()
        .setCustomId("yasakliKelimeListe")
        .setLabel("Yasaklı Kelimeler")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📋")
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
}