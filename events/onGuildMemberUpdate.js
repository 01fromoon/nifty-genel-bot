import db from "croxydb";
import { event } from "../app.js";
import { EmbedBuilder, AuditLogEvent } from "discord.js";

export default event("guildMemberUpdate", async (oldMember, newMember) => {
  if (!oldMember.guild || oldMember.user.bot) return;
  const kanalId = db.get(`rolLog_${oldMember.guild.id}`);
  if (!kanalId) return;
  const kanal = oldMember.guild.channels.cache.get(kanalId);
  if (!kanal || !kanal.isTextBased()) return;

  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;
  const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
  const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

  let executor;
  if (addedRoles.size > 0 || removedRoles.size > 0) {
    const fetched = await oldMember.guild.fetchAuditLogs({
      limit: 6,
      type: AuditLogEvent.MemberRoleUpdate
    });
    const entry = fetched.entries.find(e => 
      e.target.id === oldMember.id &&
      Date.now() - e.createdTimestamp < 10_000
    );
    executor = entry ? entry.executor : null;
  }

  for (const role of addedRoles.values()) {
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Rol Verildi")
      .setDescription(`**${newMember.user.tag}** kullanıcısına <@&${role.id}> rolü verildi.`)
      .addFields({
        name: "İşlemi Yapan",
        value: executor ? `<@${executor.id}> (${executor.tag})` : "Bilinmiyor",
        inline: false
      })
      .setTimestamp();
    kanal.send({ embeds: [embed] });
  }
  for (const role of removedRoles.values()) {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("❌ Rol Alındı")
      .setDescription(`**${newMember.user.tag}** kullanıcısından <@&${role.id}> rolü alındı.`)
      .addFields({
        name: "İşlemi Yapan",
        value: executor ? `<@${executor.id}> (${executor.tag})` : "Bilinmiyor",
        inline: false
      })
      .setTimestamp();
    kanal.send({ embeds: [embed] });
  }
});