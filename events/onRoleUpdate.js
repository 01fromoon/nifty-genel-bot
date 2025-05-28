import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default event("roleUpdate", async (oldRole, newRole) => {
  const kanalId = db.get(`rolLog_${newRole.guild.id}`);
  if (!kanalId) return;
  const kanal = newRole.guild.channels.cache.get(kanalId);
  if (!kanal || !kanal.isTextBased()) return;

  if (oldRole.name !== newRole.name) {
    let executor;
    const fetched = await newRole.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleUpdate
    });
    const entry = fetched.entries.find(e =>
      e.target.id === newRole.id &&
      Date.now() - e.createdTimestamp < 10_000
    );
    executor = entry ? entry.executor : null;

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("✏️ Rol İsmi Değişti")
      .setDescription(`<@&${newRole.id}> rolünün adı değişti: \`${oldRole.name}\` → \`${newRole.name}\``)
      .addFields({
        name: "İşlemi Yapan",
        value: executor ? `<@${executor.id}> (${executor.tag})` : "Bilinmiyor",
        inline: false
      })
      .setTimestamp();
    kanal.send({ embeds: [embed] });
  }
});