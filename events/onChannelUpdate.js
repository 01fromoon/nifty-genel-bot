import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default event("channelUpdate", async (oldChannel, newChannel) => {
  if (!oldChannel.guild) return;
  const kanalId = db.get(`kanalLog_${oldChannel.guild.id}`);
  if (!kanalId) return;
  const logKanal = oldChannel.guild.channels.cache.get(kanalId);
  if (!logKanal || !logKanal.isTextBased()) return;

  let executor;
  try {
    const fetched = await oldChannel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelUpdate
    });
    const entry = fetched.entries.find(e =>
      e.target.id === oldChannel.id &&
      Date.now() - e.createdTimestamp < 10000
    );
    executor = entry ? entry.executor : null;
  } catch {}

  let degisiklik = "";
  if (oldChannel.name !== newChannel.name) {
    degisiklik += `**İsim:** \`${oldChannel.name}\` → \`${newChannel.name}\`\n`;
  }
  if (oldChannel.topic !== newChannel.topic) {
    degisiklik += `**Konu:** \`${oldChannel.topic || "Yok"}\` → \`${newChannel.topic || "Yok"}\`\n`;
  }
  if (oldChannel.parentId !== newChannel.parentId) {
    degisiklik += `**Kategori:** \`${oldChannel.parent?.name || "Yok"}\` → \`${newChannel.parent?.name || "Yok"}\`\n`;
  }
  if (oldChannel.nsfw !== newChannel.nsfw) {
    degisiklik += `**NSFW:** \`${oldChannel.nsfw ? "Açık" : "Kapalı"}\` → \`${newChannel.nsfw ? "Açık" : "Kapalı"}\`\n`;
  }

  if (!degisiklik) return; 

  const embed = new EmbedBuilder()
    .setColor("Orange")
    .setTitle("✏️ Kanal Düzenlendi")
    .addFields(
      { name: "Kanal", value: `<#${newChannel.id}> (${newChannel.name})`, inline: true },
      { name: "Düzenleyen", value: executor ? `<@${executor.id}> (${executor.tag})` : "Bilinmiyor", inline: false }
    )
    .setDescription(degisiklik)
    .setTimestamp();
  logKanal.send({ embeds: [embed] });
});