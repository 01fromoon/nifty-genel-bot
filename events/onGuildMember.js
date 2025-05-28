import db from "croxydb";
import { EmbedBuilder } from "discord.js";
import { event } from "../app.js";


export default [
  "guildMemberAdd",
  /** 
   * @param {import("discord.js").GuildMember} member 
   */
  async (member) => {
    const data = db.get(`otorol.${member.guild.id}`);
    if (!data) return;

    const rolId = member.user.bot ? data.botRolId : data.uyeRolId;
    const logKanal = member.guild.channels.cache.get(data.logKanalId);

    if (!rolId) return;

    try {
      await member.roles.add(rolId, "Otorol sistemi");
      if (logKanal && logKanal.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle("🎉 Otorol Verildi!")
          .setColor("Green")
          .setDescription(`${member} kullanıcısına <@&${rolId}> rolü atandı!`)
          .setTimestamp();
        await logKanal.send({ embeds: [embed] });
      }
    } catch (err) {
      if (logKanal && logKanal.isTextBased()) {
        await logKanal.send(`❌ ${member} kullanıcısına rol atanamadı: \`${err.message}\``);
      }
    }
  }
];