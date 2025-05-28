import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("hoşgeldin-sistemi-sıfırla")
    .setDescription("❌ Hoşgeldin sistemini kapatır/sıfırlar.");

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    db.delete(`hosgeldin_${interaction.guild.id}`);
    const kapatEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🧹 Hoşgeldin Sistemi Sıfırlandı!")
      .setDescription("🔕 Artık hoşgeldin/hoşça kal mesajı gönderilmeyecek!")
      .setFooter({ text: "Nifty - Hoşgeldin Sistemi", iconURL: "https://cdn.discordapp.com/attachments/1106795876392368198/1176124713989337139/nifty.png?size=96" })
      .setTimestamp();

    return interaction.reply({ embeds: [kapatEmbed], ephemeral: true });
  }
}