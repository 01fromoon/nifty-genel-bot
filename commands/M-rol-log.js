import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("rol-log")
    .setDescription("🔔 Rol log kanalını ayarlar veya sistemi kapatır.")
    .addChannelOption(opt =>
      opt.setName("kanal")
        .setDescription("Rol loglarının gönderileceği kanal (boş bırakılırsa sistem kapatılır)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    const kanal = interaction.options.getChannel("kanal");

    if (kanal) {
      db.set(`rolLog_${interaction.guild.id}`, kanal.id);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Rol Log Sistemi Aktif!")
        .setDescription(`Rol log mesajları artık ${kanal} kanalına gönderilecek.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      db.delete(`rolLog_${interaction.guild.id}`);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Rol Log Sistemi Kapatıldı!")
        .setDescription("Artık rol işlemleri loglanmayacak.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}