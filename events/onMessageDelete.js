import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default event("messageDelete", async (message) => {
  if (!message.guild || message.author?.bot) return;
  const kanalId = db.get(`mesajLog_${message.guild.id}`);
  if (!kanalId) return;
  const kanal = message.guild.channels.cache.get(kanalId);
  if (!kanal || !kanal.isTextBased()) return;

  let executor;
  try {
    const fetched = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete
    });
    const entry = fetched.entries.find(e =>
      e.target.id === message.author.id &&
      Date.now() - e.createdTimestamp < 10000
    );
    executor = entry ? entry.executor : null;
  } catch {}

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("🗑️ Mesaj Silindi")
    .addFields(
      { name: "Kullanıcı", value: `${message.author} (${message.author.tag})`, inline: true },
      { name: "Kanal", value: `<#${message.channel.id}>`, inline: true },
      { name: "İşlemi Yapan", value: executor ? `<@${executor.id}> (${executor.tag})` : "Bilinmiyor", inline: false }
    )
    .setDescription(message.content ? `**Silinen Mesaj:**\n${message.content}` : "*Mesaj içeriği yok*")
    .setTimestamp();
  kanal.send({ embeds: [embed] });
});