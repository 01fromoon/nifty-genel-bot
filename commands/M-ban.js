import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { command } from "../app.js";

export default command(
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bir kullanıcıyı sunucudan yasaklar.")
    .addUserOption(option =>
      option
        .setName("kullanıcı")
        .setDescription("Yasaklanacak kullanıcı")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("sebep")
        .setDescription("Yasaklama sebebi")
        .setRequired(false)
    ),
  async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetersiz Yetki")
        .setDescription("Bu komutu kullanmak için **Üyeleri Yasakla** yetkisine sahip olmalısın!");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser("kullanıcı");
    const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Kullanıcı Bulunamadı")
        .setDescription("Belirtilen kullanıcı sunucuda bulunamadı.");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    if (!member.bannable) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yasaklama Başarısız")
        .setDescription("Bu kullanıcıyı yasaklayamıyorum. Yetkim veya rolüm yetersiz olabilir.");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    if (user.id === interaction.user.id) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Kendi Kendini Yasaklayamazsın!")
        .setDescription("Kendi kendini yasaklayamazsın.");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }
    if (user.id === client.user.id) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Botu Yasaklayamazsın!")
        .setDescription("Beni yasaklayamazsın :)");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    try {
      await member.ban({ reason: `${reason} (Yetkili: ${interaction.user.tag})` });
      const successEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("✅ Kullanıcı Yasaklandı!")
        .setDescription(`:green_circle: ${user} başarıyla yasaklandı.\n**Sebep:** ${reason}`);
      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yasaklama Sırasında Hata!")
        .setDescription(`:red_circle: Kullanıcı yasaklanırken bir hata oluştu.\n\`\`\`${err.message}\`\`\``);
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
);