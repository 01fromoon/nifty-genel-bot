import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("mesaj-log")
    .setDescription("📝 Mesaj log kanalını ayarlar veya sistemi kapatır.")
    .addChannelOption(opt =>
      opt.setName("kanal")
        .setDescription("Mesaj loglarının gönderileceği kanal (boş bırakılırsa sistem kapatılır)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    const kanal = interaction.options.getChannel("kanal");

    if (kanal) {
      db.set(`mesajLog_${interaction.guild.id}`, kanal.id);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Mesaj Log Sistemi Aktif!")
        .setDescription(`Mesaj logları artık ${kanal} kanalına gönderilecek.`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      db.delete(`mesajLog_${interaction.guild.id}`);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Mesaj Log Sistemi Kapatıldı!")
        .setDescription("Artık mesaj işlemleri loglanmayacak.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}