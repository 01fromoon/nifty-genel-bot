import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default event("channelDelete", async (channel) => {
  if (!channel.guild) return;
  const kanalId = db.get(`kanalLog_${channel.guild.id}`);
  if (!kanalId) return;
  const logKanal = channel.guild.channels.cache.get(kanalId);
  if (!logKanal || !logKanal.isTextBased()) return;

  let executor;
  try {
    const fetched = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete
    });
    const entry = fetched.entries.find(e =>
      e.target.id === channel.id &&
      Date.now() - e.createdTimestamp < 10000
    );
    executor = entry ? entry.executor : null;
  } catch {}

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("🗑️ Kanal Silindi")
    .addFields(
      { name: "Kanal Adı", value: channel.name, inline: true },
      { name: "Tür", value: `${channel.type}`, inline: true },
      { name: "Silen", value: executor ? `<@${executor.id}> (${executor.tag})` : "Bilinmiyor", inline: false }
    )
    .setTimestamp();
  logKanal.send({ embeds: [embed] });
});