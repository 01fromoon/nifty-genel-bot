import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import db from "croxydb";
import { SlashCommand } from "../app.js";

export default class OtorolKapatCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("otorol-kapat")
    .setDescription("Otorol sistemini kapatır.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

  async execute(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({ content: "❌ Bu komutu kullanmak için yönetici olmalısın.", ephemeral: true });
      return;
    }
    db.delete(`otorol.${interaction.guild.id}`);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🛑 Otorol Sistemi Kapatıldı!")
          .setColor("Red")
          .setDescription("Artık yeni üyelere veya botlara otomatik rol verilmeyecek.")
      ]
    });
  }
}