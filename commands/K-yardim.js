import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { command } from "../app.js";

export default command(
  new SlashCommandBuilder()
    .setName("yardım")
    .setDescription("Botun komutları hakkında bilgi al."),
  async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("🧰 Yardım Menüsü")
      .setDescription("Aşağıdaki butonlardan kategori seçebilirsin!")
      .setColor(0x5865F2)
      .setFooter({ text: "Bot geliştiricisi: 01fromoon" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("yardim_premium")
        .setLabel("💎 Premium")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("yardim_moderasyon")
        .setLabel("🛡️ Moderasyon")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("yardim_kullanici")
        .setLabel("👤 Kullanıcı")
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
);