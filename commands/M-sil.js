import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";

export default class SilCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("sil")
    .setDescription("Belirtilen sayıda mesajı topluca siler.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName("adet")
        .setDescription("Silinecek mesaj adedi (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption(opt =>
      opt.setName("kullanıcı")
        .setDescription("Sadece bu kullanıcının mesajlarını sil (isteğe bağlı)")
        .setRequired(false)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: "❌ Bu komutu kullanmak için **Mesajları Yönet** yetkisine sahip olmalısın.",
        ephemeral: true
      });
    }

    const adet = interaction.options.getInteger("adet");
    const user = interaction.options.getUser("kullanıcı");
    const channel = interaction.channel;

    if (!channel.isTextBased() || !channel.bulkDelete) {
      return interaction.reply({ content: "❌ Bu kanalda mesaj silme desteklenmiyor.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    let deleted;
    if (user) {
      const messages = await channel.messages.fetch({ limit: 100 });
      const userMessages = messages
        .filter(m => m.author.id === user.id)
        .first(adet);
      if (!userMessages.length) {
        return interaction.editReply({
          content: "❌ Son 100 mesajda bu kullanıcıya ait mesaj yok.",
          ephemeral: true
        });
      }
      deleted = await channel.bulkDelete(userMessages, true);
    } else {
      deleted = await channel.bulkDelete(adet, true);
    }

    if (deleted.size < adet) {
      await interaction.followUp({
        content: `⚠️ **Not:** Sadece son 14 gün içindeki mesajlar silinebilir. Daha eski mesajlar silinmedi.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("🧹 Mesajlar Silindi")
      .setDescription(`Başarıyla **${deleted.size}** mesaj silindi.`)
      .addFields(
        { name: "Kanal", value: `${channel}`, inline: true },
        { name: "Yetkili", value: `${interaction.user}`, inline: true }
      )
      .setTimestamp();

    if (user) {
      embed.addFields({ name: "Kullanıcı", value: `${user}`, inline: true });
    }

    await interaction.editReply({ embeds: [embed] });
  }
}