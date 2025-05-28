import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("kanal-log")
    .setDescription("📺 Kanal log kanalını ayarla veya sistemi kapat.")
    .addChannelOption(opt =>
      opt.setName("kanal")
        .setDescription("Kanal loglarının gönderileceği kanal (boş bırakılırsa sistem kapatılır)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    const kanal = interaction.options.getChannel("kanal");

    if (kanal) {
      db.set(`kanalLog_${interaction.guild.id}`, kanal.id);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Kanal Log Sistemi Aktif!")
        .setDescription(`Kanal logları artık ${kanal} kanalına gönderilecek.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      db.delete(`kanalLog_${interaction.guild.id}`);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Kanal Log Sistemi Kapatıldı!")
        .setDescription("Artık kanal işlemleri loglanmayacak.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}