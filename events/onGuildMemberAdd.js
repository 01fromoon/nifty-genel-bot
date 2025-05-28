import db from "croxydb";
import { EmbedBuilder } from "discord.js";
import { event } from "../app.js";


export default event("guildMemberAdd", async (member) => {
  const data = db.get(`otorol.${member.guild.id}`);
  if (data) {
    const rolId = member.user.bot ? data.botRolId : data.uyeRolId;
    const logKanal = member.guild.channels.cache.get(data.logKanalId);

    if (rolId) {
      try {
        await member.roles.add(rolId, "Otorol sistemi");
        if (logKanal && logKanal.isTextBased()) {
          const embed = new EmbedBuilder()
            .setTitle("🥳 Otorol Verildi!")
            .setColor("Green")
            .setDescription(`> 👤 ${member} kullanıcısına <@&${rolId}> rolü atandı!`)
            .setTimestamp();
          await logKanal.send({ embeds: [embed] });
        }
      } catch (err) {
        if (logKanal && logKanal.isTextBased()) {
          await logKanal.send(`❌ ${member} kullanıcısına rol atanamadı: \`${err.message}\``);
        }
      }
    }
  }

  const h = db.get(`hosgeldin_${member.guild.id}`);
  if (h) {
    const kanal = member.guild.channels.cache.get(h.kanal);
    if (kanal) {
      const msg = `🎉 | <@${member.id}> sunucuya katıldı! Sunucumuz artık **${member.guild.memberCount}** kişi!`;
      if (h.tip === "embed") {
        const embed = new EmbedBuilder()
          .setColor("Aqua")
          .setAuthor({ name: "✨ Hoşgeldin!", iconURL: member.user.displayAvatarURL() })
          .setDescription(
            `> 👋 Selam <@${member.id}>,\n> Sunucumuza hoşgeldin!`
          )
          .addFields(
            { name: "🧑‍🤝‍🧑 Toplam Üye", value: `\`${member.guild.memberCount}\` kişi`, inline: true },
            { name: "⏰ Katılım Zamanı", value: `<t:${Math.floor(Date.now()/1000)}:f>`, inline: true }
          )
          .setFooter({ text: `${member.guild.name} X Nifty Bot`, iconURL: member.guild.iconURL() })
          .setThumbnail(member.user.displayAvatarURL({ size: 4096 }));
        kanal.send({ embeds: [embed] });
      } else {
        kanal.send({ content: msg });
      }
    }
  }

  // ========== DAVET SİSTEMİ ==========

  const davetData = db.get(`davetSistemi_${member.guild.id}`);
  if (!davetData) return;

  const logKanal = member.guild.channels.cache.get(davetData.kanal);
  if (!logKanal || !logKanal.isTextBased()) return;

  if (!global.guildInvites) global.guildInvites = {};
  let guildInvites = global.guildInvites;


  let newInvites = await member.guild.invites.fetch().catch(() => new Map());
  let oldInvites = guildInvites[member.guild.id] || new Map();
  guildInvites[member.guild.id] = newInvites;


  let inviteUsed = null;
  let inviter = null;
  if (newInvites && oldInvites) {
    inviteUsed = newInvites.find(i => {
      const oldUses = oldInvites.get(i.code)?.uses || 0;
      return i.uses > oldUses;
    });
    if (inviteUsed) inviter = inviteUsed.inviter;
  }


  if (inviter && inviteUsed) {
    db.set(`davetEdici_${member.guild.id}_${member.id}`, {
      inviter: inviter.id,
      inviterTag: inviter.tag,
      invite: inviteUsed.url || "discord.gg/" + inviteUsed.code
    });
  } else {
    db.delete(`davetEdici_${member.guild.id}_${member.id}`);
  }

  const tarih = `<t:${Math.floor(Date.now()/1000)}:f>`;
  let mesaj = "";
  let embed;
  if (inviter && inviteUsed) {
    mesaj =
      `${member.user.username} giriş yaptı\n` +
      `Hoşgeldin <@${member.id}>! ${inviter.username} sayesinde buradasın! :tada:\n\n` +
      `${inviteUsed.url || "discord.gg/" + inviteUsed.code} linkiyle giriş yaptı.\n\n` +
      `${inviter.username} tarafından davet edildi•${tarih}`;
    embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("🎟️ Davet ile Katılım!")
      .setDescription(
        `**${member.user.username}** giriş yaptı\n` +
        `Hoşgeldin <@${member.id}>! ${inviter.username} sayesinde buradasın! :tada:\n\n` +
        `${inviteUsed.url || "discord.gg/" + inviteUsed.code} linkiyle giriş yaptı.\n\n` +
        `${inviter.username} tarafından davet edildi • ${tarih}`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
  } else {
    mesaj =
      `${member.user.username} giriş yaptı\n` +
      `Hoşgeldin ${member.user.username}! Nasıl geldiğini bulamadım.. :tada:\n` +
      `Nasıl geldi anlamadım, kimsede söylemiyor•${tarih}`;
    embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("🎟️ Katılım!")
      .setDescription(
        `${member.user.username} giriş yaptı\n` +
        `Hoşgeldin ${member.user.username}! Nasıl geldiğini bulamadım.. :tada:\n` +
        `Nasıl geldi anlamadım, kimsede söylemiyor•${tarih}`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
  }
  if (davetData.tip === "embed") {
    logKanal.send({ embeds: [embed] });
  } else {
    logKanal.send({ content: mesaj });
  }
});