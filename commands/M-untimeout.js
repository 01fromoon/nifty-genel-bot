import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";

export default class UntimeoutCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Bir kullanıcının timeout (sessiz) durumunu kaldırır.")
    .addUserOption(opt =>
      opt.setName("kullanıcı")
        .setDescription("Timeout'u kaldırılacak üye")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("sebep")
        .setDescription("Sebep (isteğe bağlı)")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

  async execute(client, interaction) {
    const target = interaction.options.getUser("kullanıcı");
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi";

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({content: "❌ Timeout kaldırmak için `Üyeleri Zaman Aşımına Uğrat` yetkin olmalı.", ephemeral: true});
    }
    if (!member || !member.moderatable) {
      return interaction.reply({content: "❌ Bu kullanıcıya işlem yapılamıyor.", ephemeral: true});
    }
    if (!member.communicationDisabledUntilTimestamp) {
      return interaction.reply({ content: "❌ Bu kullanıcı timeoutta değil.", ephemeral: true });
    }

    await member.timeout(null, `${sebep} (untimeout by ${interaction.user.tag})`);

    const embed = new EmbedBuilder()
      .setTitle("✅ Timeout Kaldırıldı!")
      .setColor("Green")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "Kullanıcı", value: `${member} (\`${member.user.tag}\`)`, inline: true },
        { name: "Yetkili", value: `${interaction.user}`, inline: true },
        { name: "Sebep", value: sebep }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}