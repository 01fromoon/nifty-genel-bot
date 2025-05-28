import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder } from "discord.js";

export default event("messageUpdate", async (oldMessage, newMessage) => {
  if (!oldMessage.guild || oldMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;
  const kanalId = db.get(`mesajLog_${oldMessage.guild.id}`);
  if (!kanalId) return;
  const kanal = oldMessage.guild.channels.cache.get(kanalId);
  if (!kanal || !kanal.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor("Orange")
    .setTitle("✏️ Mesaj Düzenlendi")
    .addFields(
      { name: "Kullanıcı", value: `${oldMessage.author} (${oldMessage.author.tag})`, inline: true },
      { name: "Kanal", value: `<#${oldMessage.channel.id}>`, inline: true }
    )
    .addFields(
      { name: "Eski Mesaj", value: oldMessage.content ? oldMessage.content : "*Yok*", inline: false },
      { name: "Yeni Mesaj", value: newMessage.content ? newMessage.content : "*Yok*", inline: false }
    )
    .setTimestamp();
  kanal.send({ embeds: [embed] });
});