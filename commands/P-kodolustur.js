import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

const OWNER_ID = process.env.OWNERID;

function randomKod(uzunluk = 30) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  for (let i = 0; i < uzunluk; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
  return str;
}

export default class KodOlusturCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("kod-olustur")
    .setDescription("Premium kodu oluşturur (sadece bot sahibi).")
    .addIntegerOption(opt =>
      opt.setName("adet")
        .setDescription("Kaç adet kod oluşturulsun? (1-20)")
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(true)
    );

  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Bu komutu sadece bot sahibi kullanabilir.",
        ephemeral: true
      });
    }

    const adet = interaction.options.getInteger("adet");
    const kodlar = db.get("premiumCodes") || {};
    const yeniKodlar = [];

    for (let i = 0; i < adet; i++) {
      let kod;
      do {
        kod = randomKod();
      } while (kodlar[kod]);
      kodlar[kod] = { used: false, user: null };
      yeniKodlar.push(kod);
    }
    db.set("premiumCodes", kodlar);

    const embed = new EmbedBuilder()
      .setTitle("✨ Premium Kodlar Oluşturuldu")
      .setDescription(yeniKodlar.map((k, i) => `\`${k}\``).join("\n"))
      .setColor("Gold")
      .setFooter({ text: "Kodlar bir başkasına verilebilir ve sadece bir kez kullanılabilir." });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}