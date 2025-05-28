import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class PremiumCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Premium kodunu girerek premium özellikleri aç!")
    .addStringOption(opt =>
      opt.setName("kod")
        .setDescription("30 haneli premium kodunu gir")
        .setRequired(true)
    );

  async execute(client, interaction) {
    const kod = interaction.options.getString("kod");
    const kodlar = db.get("premiumCodes") || {};

    if (!kodlar[kod]) {
      return interaction.reply({
        content: "❌ Geçersiz premium kodu!",
        ephemeral: true
      });
    }
    if (kodlar[kod].used) {
      return interaction.reply({
        content: "❌ Bu kod zaten kullanılmış!",
        ephemeral: true
      });
    }

    db.set(`premiumUser.${interaction.user.id}`, { expires: null });
    kodlar[kod].used = true;
    kodlar[kod].user = interaction.user.id;
    db.set("premiumCodes", kodlar);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎉 Premium Aktif!")
          .setDescription("Tebrikler! Artık tüm premium özellikleri kullanabilirsin.\n\nPremium avantajlarını görmek için komutları kullanmaya başlayabilirsin!")
          .setColor("Gold")
      ],
      ephemeral: true
    });
  }
}