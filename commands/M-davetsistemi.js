import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";
import db from "croxydb";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("davet-sistemi")
    .setDescription("🎟️ Davet sistemi kanalını ve mesaj tipini ayarla!")
    .addChannelOption(opt =>
      opt.setName("kanal")
        .setDescription("Davet mesajlarının gideceği kanal")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("mesajtipi")
        .setDescription("Mesaj tipi")
        .addChoices(
          { name: "Embedli Mesaj", value: "embed" },
          { name: "Normal Mesaj", value: "normal" }
        )
        .setRequired(true)
    );

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ content: "🚫 | Bu komutu kullanmak için **Yönetici** olmalısın.", ephemeral: true });

    const kanal = interaction.options.getChannel("kanal");
    const mesajTipi = interaction.options.getString("mesajtipi");
    db.set(`davetSistemi_${interaction.guild.id}`, { kanal: kanal.id, tip: mesajTipi });

    return interaction.reply({
      content: `🎟️ Davet sistemi ayarlandı!\nKanal: ${kanal}\nMesaj tipi: ${mesajTipi === "embed" ? "Embedli" : "Normal"}`,
      ephemeral: true
    });
  }
}