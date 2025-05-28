import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default event("roleDelete", async (role) => {
  const kanalId = db.get(`rolLog_${role.guild.id}`);
  if (!kanalId) return;
  const kanal = role.guild.channels.cache.get(kanalId);
  if (!kanal || !kanal.isTextBased()) return;

  let executor;
  const fetched = await role.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.RoleDelete
  });
  const entry = fetched.entries.find(e =>
    e.target.id === role.id &&
    Date.now() - e.createdTimestamp < 10_000
  );
  executor = entry ? entry.executor : null;

  const embed = new EmbedBuilder()
    .setColor("Grey")
    .setTitle("🗑️ Rol Silindi")
    .setDescription(`\`${role.name}\` adlı rol silindi.`)
    .addFields({
      name: "İşlemi Yapan",
      value: executor ? `<@${executor.id}> (${executor.tag})` : "Bilinmiyor",
      inline: false
    })
    .setTimestamp();
  kanal.send({ embeds: [embed] });
});