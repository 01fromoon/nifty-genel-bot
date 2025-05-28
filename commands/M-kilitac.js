import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { command } from "../app.js";

export default command(
  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Kanalın kilidini açar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async (client, interaction) => {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) &&
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) { 
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetersiz Yetki")
        .setDescription("Bu komutu kullanmak için **Kanalları Yönet** veya **Yönetici** yetkisine sahip olmalısın!");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    const channel = interaction.channel;
    const everyoneRole = interaction.guild.roles.everyone;

    const currentPerms = channel.permissionOverwrites.cache.get(everyoneRole.id);
    if (!currentPerms || !currentPerms.deny.has(PermissionFlagsBits.SendMessages)) {
      const alreadyUnlockedEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🔓 Kanal Zaten Açık")
        .setDescription("Bu kanal zaten kilitli değil.");
      await interaction.reply({ embeds: [alreadyUnlockedEmbed], ephemeral: true });
      return;
    }
 
    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null,
      });

      const unlockEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🔓 Kanal Kilidi Açıldı!")
        .setDescription(`Bu kanalın kilidi, **${interaction.user.tag}** adlı yetkili tarafından açıldı.`);
      await interaction.reply({ embeds: [unlockEmbed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Hata")
        .setDescription(`Kanal açılırken bir hata oluştu.\n\`\`\`${err.message}\`\`\``);
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
);