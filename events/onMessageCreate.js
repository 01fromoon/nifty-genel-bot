import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

// Basit küfür listesi, istediğiniz gibi çoğaltabilirsiniz.
const kufurler = [
  "amk", "aq", "orospu", "piç", "sik", "yarrak", "ananı", "sikerim", "göt", "mal", "salak", "ambiti", "amcık", "amın feryadı", "amınoğlu"
];

const reklamDesenler = [
  "discord.gg/", "discord.com/invite/", ".com", ".net", ".org", ".xyz", ".shop", ".site",
  "http://", "https://", "www.", "invite.gg/", "davet.gg/", "instagram.com/", "twitter.com/", "tiktok.com/", "youtube.com/"
];

export default event("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const kufurEngel = db.get(`kufurEngel_${message.guild.id}`);
  if (kufurEngel && kufurler.some(k => message.content.toLowerCase().includes(k))) {
    try {
      await message.delete();
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription(`⚠️ ${message.author}, Bu sunucuda **küfür koruması** açık halde! Mesajın silindi.`);
      await message.channel.send({ content: `${message.author}`, embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    } catch {}
    return;
  }

  // REKLAM ENGEL SİSTEMİ (Yönetici de olsa herkese uygula)
  const reklamEngel = db.get(`reklamEngel_${message.guild.id}`);
  if (reklamEngel && reklamDesenler.some(k => message.content.toLowerCase().includes(k))) {
    try {
      await message.delete();
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setDescription(`🚫 ${message.author}, Bu sunucuda **Reklam koruması** açık halde! Mesajın silindi.`);
      await message.channel.send({ content: `${message.author}`, embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    } catch {}
    return;
  }

  // YASAKLI KELİME SİSTEMİ (herkese uygula, admin dahil)
  const yasakliKelimeler = db.get(`yasakliKelimeler_${message.guild.id}`) || [];
  if (yasakliKelimeler.length > 0) {
    const contentLower = message.content.toLowerCase();
    const bulunan = yasakliKelimeler.find(kelime => contentLower.includes(kelime));
    if (bulunan) {
      try { await message.delete(); } catch {}
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(`⛔ **Bu kelime sunucuda yasaklanmış:** \`${bulunan}\``)
        .setFooter({ text: "Uygunsuz içerik koruması aktif." });
      return message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }
  }
});