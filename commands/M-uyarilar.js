import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, time } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class UyarilarCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("uyarılar")
    .setDescription("Bir kullanıcının uyarı geçmişini gösterir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName("kullanıcı")
        .setDescription("Uyarılarını görmek istediğin kullanıcı")
        .setRequired(true)
    );

  async execute(client, interaction) {
    const user = interaction.options.getUser("kullanıcı");
    const guildId = interaction.guild.id;
    const key = `uyarılar.${guildId}.${user.id}`;
    const warns = db.get(key) || [];

    if (!warns.length) {
      return interaction.reply({ content: `❌ ${user} kullanıcısının hiç uyarısı yok.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ ${user.tag} kullanıcısının uyarıları`)
      .setColor("Orange")
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `Toplam uyarı: ${warns.length}` });

    for (let i = 0; i < warns.length; i++) {
      const w = warns[i];
      embed.addFields({
        name: `#${i + 1} • ${new Date(w.tarih).toLocaleString("tr-TR")}`,
        value: `**Sebep:** ${w.sebep}\n**Yetkili:** <@${w.moderator}>`,
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
}