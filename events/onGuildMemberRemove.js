import db from "croxydb";
import { EmbedBuilder } from "discord.js";
import { event } from "../app.js";

export default event("guildMemberRemove", async (member) => {
  const h = db.get(`hosgeldin_${member.guild.id}`);
  if (h) {
    const kanal = member.guild.channels.cache.get(h.kanal);
    if (kanal) {
      const isim = member.user.username;
      const tip = member.user.bot ? "bot" : "kullanıcı";
      const mesaj = `💔 | **${isim}** adlı ${tip} sunucudan ayrıldı! Sunucumuz şimdi **${member.guild.memberCount}** kişi...`;

      if (h.tip === "embed") {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setAuthor({ name: tip === "bot" ? "🤖 Bir Bot Ayrıldı!" : "👤 Bir Üye Ayrıldı!", iconURL: member.user.displayAvatarURL() })
          .setDescription(mesaj)
          .addFields(
            { name: "🧑‍🤝‍🧑 Kalan Üye", value: `\`${member.guild.memberCount}\` kişi`, inline: true },
            { name: "⏰ Ayrılma Zamanı", value: `<t:${Math.floor(Date.now()/1000)}:f>`, inline: true }
          )
          .setFooter({ text: `${member.guild.name} X Nifty Bot`, iconURL: member.guild.iconURL() })
          .setThumbnail(member.user.displayAvatarURL({ size: 4096 }));
        kanal.send({ embeds: [embed] });
      } else {
        kanal.send({ content: mesaj });
      }
    }
  }

  // ========== DAVET SİSTEMİ ==========

  const davetData = db.get(`davetSistemi_${member.guild.id}`);
  if (!davetData) return;

  const logKanal = member.guild.channels.cache.get(davetData.kanal);
  if (!logKanal || !logKanal.isTextBased()) return;

  let inviterData = db.get(`davetEdici_${member.guild.id}_${member.id}`);
  let tarih = `<t:${Math.floor(Date.now()/1000)}:f>`;
  let mesaj = "";
  let embed;

  if (inviterData && inviterData.inviter && inviterData.invite) {
    mesaj =
      `${member.user.username} çıkış yaptı\n` +
      `Görüşürüz <@${member.id}>! ${inviterData.inviterTag} tarafından davet edilmişti! \n\n` +
      `${inviterData.invite} linkiyle giriş yapmıştı.\nadam gitti valla, ${member.guild.memberCount} kişi kaldık•${tarih}`;
    embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🎟️ Davet ile Ayrılış!")
      .setDescription(
        `${member.user.username} çıkış yaptı\n` +
        `Görüşürüz <@${member.id}>! ${inviterData.inviterTag} tarafından davet edilmişti!\n\n` +
        `${inviterData.invite} linkiyle giriş yapmıştı.\nadam gitti valla, ${member.guild.memberCount} kişi kaldık•${tarih}`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
  } else {
    mesaj =
      `Görüşürüz ${member.user.username}! Kim davet etti ne oldu bilmiyorum valla. :neutral_face:\n` +
      `adam gitti valla, ${member.guild.memberCount} kişi kaldık•${tarih}`;
    embed = new EmbedBuilder()
      .setColor("Grey")
      .setTitle("🎟️ Ayrılış!")
      .setDescription(
        `Görüşürüz ${member.user.username}! Kim davet etti ne oldu bilmiyorum valla. :neutral_face:\n` +
        `adam gitti valla, ${member.guild.memberCount} kişi kaldık•${tarih}`
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