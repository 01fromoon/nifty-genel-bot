import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { command } from "../app.js";

export default command(
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Bir kullanıcıyı sunucudan atar.")
    .addUserOption(option =>
      option
        .setName("kullanıcı")
        .setDescription("Atılacak kullanıcı")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("sebep")
        .setDescription("Atma sebebi")
        .setRequired(false)
    ),
  async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetersiz Yetki")
        .setDescription("Bu komutu kullanmak için **Üyeleri At** yetkisine sahip olmalısın!");
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
    if (!member.kickable) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Atma Başarısız")
        .setDescription("Bu kullanıcıyı atamıyorum. Yetkim veya rolüm yetersiz olabilir.");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    if (user.id === interaction.user.id) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Kendi Kendini Atamazsın!")
        .setDescription("Kendi kendini atamazsın.");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }
    if (user.id === client.user.id) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Botu Atamazsın!")
        .setDescription("Beni atamazsın :)");
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    try {
      await member.kick(`${reason} (Yetkili: ${interaction.user.tag})`);
      const successEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("✅ Kullanıcı Atıldı!")
        .setDescription(`:green_circle: ${user} başarıyla atıldı.\n**Sebep:** ${reason}`);
      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Atma Sırasında Hata!")
        .setDescription(`:red_circle: Kullanıcı atılırken bir hata oluştu.\n\`\`\`${err.message}\`\`\``);
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
);