import { SlashCommandBuilder, EmbedBuilder, User } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("davetlerim")
    .setDescription("🎟️ Bir kullanıcının davet istatistiklerini gösterir.")
    .addUserOption(opt =>
      opt.setName("kullanıcı")
        .setDescription("Davetlerini görmek istediğin kullanıcı (boş bırakılırsa kendi istatistiklerin.)")
        .setRequired(false)
    );

  async execute(client, interaction) {
    const user = interaction.options.getUser("kullanıcı") || interaction.user;
    const invites = db.get(`davetStats_${interaction.guild.id}_${user.id}`) || {
      total: 0,
      real: 0,
      fake: 0
    };

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setAuthor({
        name: `${user.username} • Davet İstatistikleri`,
        iconURL: user.displayAvatarURL({ size: 4096 })
      })
      .setThumbnail(user.displayAvatarURL({ size: 4096 }))
      .setDescription(
        `> **${user} kullanıcısının davet istatistikleri:**\n\n` +
        `🔗 **Toplam Davet:** \`${invites.total}\`\n` +
        `🟢 **Toplam Gerçek Davet:** \`${invites.real}\`\n` +
        `🔴 **Toplam Fake Davet:** \`${invites.fake}\``
      )
      .setFooter({
        text: `${interaction.guild.name} • ${new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}`,
        iconURL: interaction.guild.iconURL()
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: false });
  }
}