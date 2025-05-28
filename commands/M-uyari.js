import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class UyariCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("uyarı")
    .setDescription("Bir kullanıcıya uyarı ekler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName("kullanıcı")
        .setDescription("Uyarı verilecek kullanıcı")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("sebep")
        .setDescription("Uyarı sebebi")
        .setRequired(true)
    );

  async execute(client, interaction) {
    const user = interaction.options.getUser("kullanıcı");
    const sebep = interaction.options.getString("sebep");
    const moderator = interaction.user;
    const guildId = interaction.guild.id;

    const key = `uyarılar.${guildId}.${user.id}`;
    const old = db.get(key) || [];
    const warn = {
      sebep,
      moderator: moderator.id,
      tarih: Date.now()
    };
    db.push(key, warn);

    const embed = new EmbedBuilder()
      .setTitle("⚠️ Kullanıcı Uyarıldı")
      .setColor("Yellow")
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Kullanıcı", value: `${user} (\`${user.tag}\`)`, inline: true },
        { name: "Yetkili", value: `${moderator}`, inline: true },
        { name: "Sebep", value: sebep }
      )
      .setFooter({ text: `Toplam uyarı: ${old.length + 1}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}