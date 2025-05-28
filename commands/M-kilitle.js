import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { command } from "../app.js";

export default command(
  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Kanalı kilitler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) &&
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetersiz Yetki")
        .setDescription("Bu komutu kullanmak için **Kanalları Yönet** veya **Yönetici** yetkisine sahip olmalısın!");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    const everyoneRole = interaction.guild.roles.everyone;
    const channel = interaction.channel;

    const currentPerms = channel.permissionOverwrites.cache.get(everyoneRole.id);
    if (currentPerms && currentPerms.deny.has(PermissionFlagsBits.SendMessages)) {
      const alreadyLockedEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("🔒 Kanal Zaten Kilitli")
        .setDescription("Bu kanal zaten kilitli durumda.");
      await interaction.reply({ embeds: [alreadyLockedEmbed], ephemeral: true });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false,
      });

      const lockEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("🔒 Kanal Kilitlendi!")
        .setDescription(`Bu kanal, **${interaction.user.tag}** adlı yetkili tarafından kilitlendi.`);

      await interaction.reply({ embeds: [lockEmbed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Hata")
        .setDescription(`Kanal kilitlenirken bir hata oluştu.\n\`\`\`${err.message}\`\`\``);
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
);