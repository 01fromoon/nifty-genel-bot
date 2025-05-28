import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("hoşgeldin-sistemi")
    .setDescription("✨ Sunucuya katılanlar için modern hoşgeldin sistemi ayarla!")
    .addChannelOption(opt =>
      opt.setName("kanal")
        .setDescription("📢 Hoşgeldin mesajının gideceği kanal")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("mesajtipi")
        .setDescription("💬 Mesaj tipi")
        .addChoices(
          { name: "📦 Embedli Mesaj", value: "embed" },
          { name: "📝 Embedsiz Mesaj", value: "normal" }
        )
        .setRequired(true)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    const kanal = interaction.options.getChannel("kanal");
    const mesajTipi = interaction.options.getString("mesajtipi");
    db.set(`hosgeldin_${interaction.guild.id}`, { kanal: kanal.id, tip: mesajTipi });

    const modernEmbed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("🎉 Hoşgeldin Sistemi Aktif!")
      .setThumbnail("https://cdn.discordapp.com/emojis/1176125834382631082.png?size=96")
      .setDescription(
        `> 🎈 **Hoşgeldin sistemi başarıyla kuruldu!**\n\n` +
        `> 📢 **Kanal:** ${kanal}\n` +
        `> 💬 **Mesaj Tipi:** ${mesajTipi === "embed" ? "Embedli" : "Embedsiz"}\n\n` +
        `✨ Artık sunucuya katılan/ayrılan üyeler için süper modern mesajlar gönderilecek!`
      )
      .setFooter({ text: "Nifty - Modern Hoşgeldin Sistemi", iconURL: "https://cdn.discordapp.com/attachments/1106795876392368198/1176124713989337139/nifty.png?size=96" })
      .setTimestamp();

    return interaction.reply({
      embeds: [modernEmbed],
      ephemeral: true
    });
  }
}