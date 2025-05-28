import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class OylamaCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("oylama")
    .setDescription("Modern, etkileşimli ve şık bir oylama başlatır.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt =>
      opt.setName("soru")
        .setDescription("Oylamanın sorusu")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("seçenekler")
        .setDescription("Seçenekleri virgül ile ayır (En az 2, en fazla 5)")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("süre")
        .setDescription("Oylama süresi (dakika, 1-1440 arası, varsayılan 10)")
        .setMinValue(1)
        .setMaxValue(1440)
        .setRequired(false)
    );

  async execute(client, interaction) {
    const soru = interaction.options.getString("soru");
    const seceneklerHam = interaction.options.getString("seçenekler").split(",").map(s => s.trim()).filter(Boolean);
    const süre = interaction.options.getInteger("süre") ?? 10; // dakika
    if (seceneklerHam.length < 2 || seceneklerHam.length > 5) {
      return interaction.reply({ content: "❌ En az 2, en fazla 5 seçenek girebilirsin. (Virgül ile ayır!)", ephemeral: true });
    }

    const emojiler = ["🇦", "🇧", "🇨", "🇩", "🇪"];
    const secenekler = seceneklerHam.slice(0, 5);
    const oylamaId = `${interaction.guild.id}-${interaction.channel.id}-${Date.now()}`;

    db.set(`oylama.${oylamaId}`, {
      soru,
      secenekler,
      oylar: {}, 
      bitis: Date.now() + süre * 60 * 1000,
      mesajId: null,
      kanalId: interaction.channel.id,
      guildId: interaction.guild.id,
      olusturan: interaction.user.id,
    });

    const embed = new EmbedBuilder()
      .setTitle("🗳️ Yeni Oylama Başladı!")
      .setDescription(`**${soru}**\n\n${secenekler.map((s, i) => `${emojiler[i]} ${s}`).join("\n")}\n\n🕒 Süre: **${süre} dakika**`)
      .setColor("Aqua")
      .setFooter({ text: `Başlatan: ${interaction.user.tag}` })
      .setTimestamp();

    const row = new ActionRowBuilder();
    for (let i = 0; i < secenekler.length; i++) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`oylama:${oylamaId}:${i}`)
          .setLabel(secenekler[i].slice(0, 40))
          .setEmoji(emojiler[i])
          .setStyle(ButtonStyle.Secondary)
      );
    }

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    db.set(`oylama.${oylamaId}.mesajId`, msg.id);

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: süre * 60 * 1000,
    });

    collector.on("collect", async i => {
      const [_, __, index] = i.customId.split(":");
      const data = db.get(`oylama.${oylamaId}`);
      if (!data) return i.reply({ content: "Oylama verisi bulunamadı.", ephemeral: true });

      if (Date.now() > data.bitis) {
        return i.reply({ content: "Oylama bitmiş!", ephemeral: true });
      }

      data.oylar[i.user.id] = Number(index);
      db.set(`oylama.${oylamaId}`, data);

      await i.reply({
        content: `✅ Oyun kaydedildi: **${secenekler[index]}**`,
        ephemeral: true,
      });

      const votes = Object.values(data.oylar);
      const sayilar = secenekler.map((_, idx) => votes.filter(v => v === idx).length);
      const total = votes.length || 1;
      embed.setFields(
        secenekler.map((s, idx) => ({
          name: `${emojiler[idx]} ${s}`,
          value: `\`${sayilar[idx]} oy\`  —  %${Math.round((sayilar[idx] / total) * 100)}`,
          inline: false,
        }))
      );
      await msg.edit({ embeds: [embed] });
    });

    collector.on("end", async () => {
      const data = db.get(`oylama.${oylamaId}`);
      if (!data) return;
      const votes = Object.values(data.oylar);
      const sayilar = secenekler.map((_, idx) => votes.filter(v => v === idx).length);
      const toplam = votes.length;

      const bitisEmbed = new EmbedBuilder()
        .setTitle("🗳️ Oylama Sona Erdi!")
        .setDescription(`**${soru}**\n\n${secenekler.map((s, i) => `${emojiler[i]} ${s}`).join("\n")}`)
        .setColor("Green")
        .setFooter({ text: `Toplam Oy: ${toplam}` })
        .setTimestamp();

      bitisEmbed.setFields(
        secenekler.map((s, idx) => ({
          name: `${emojiler[idx]} ${s}`,
          value: `\`${sayilar[idx]} oy\`  —  %${toplam ? Math.round((sayilar[idx] / toplam) * 100) : 0}`,
          inline: false,
        }))
      );

      await msg.edit({ embeds: [bitisEmbed], components: [] });
      db.delete(`oylama.${oylamaId}`);
    });
  }
}