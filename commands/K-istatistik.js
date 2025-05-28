import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import { SlashCommand } from "../app.js";
import os from "os";
import process from "process";

export default class IstatistikCommand extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("istatistik")
    .setDescription("Botun istatistiklerini gösterir.");

  async execute(client, interaction) {
    const embed = buildIstatistikEmbed(client, interaction);

    const yenileBtn = new ButtonBuilder()
      .setCustomId("istatistik_refresh")
      .setLabel("Yenile")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🔄");

    const silBtn = new ButtonBuilder()
      .setCustomId("istatistik_delete")
      .setLabel("Sil")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("🗑️");

    const row = new ActionRowBuilder().addComponents(yenileBtn, silBtn);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false, 
    });
  }
}

function buildIstatistikEmbed(client, interaction) {
  const userCount = client.users.cache.size;
  const guildCount = client.guilds.cache.size;
  const commandCount = client.getSlashCommands().length;
  const shard = interaction.guild?.shardId ?? 0;
  const totalShards = client.options.shardCount ?? 1;
  const createdAt = `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`;
  const memTotal = (os.totalmem() / 1024 / 1024).toFixed(0);
  const memUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  const cpu = os.cpus()[0].model;
  const cpuUsage = (process.cpuUsage().user / 1000000).toFixed(2);
  const botUptime = msToReadable(process.uptime() * 1000);
  const sysUptime = msToReadable(os.uptime() * 1000);
  const ping = Math.round(client.ws.ping);

  const eventCount =
    typeof client.eventHandlerCount === "function"
      ? client.eventHandlerCount()
      : (client.eventHandlerCount ?? 0);

  const hedef = 500;
  const progressBar = `[${"█".repeat(Math.floor((guildCount / hedef) * 20)).padEnd(20, "░")}]`;

  return new EmbedBuilder()
    .setTitle("Nifty | İstatistik")
    .setColor("Random")
    .addFields(
      { name: "👥 Kullanıcılar", value: `\`${userCount}\``, inline: true },
      { name: "🧩 Sunucular", value: `\`${guildCount}\``, inline: true },
      { name: "🕹️ Komutlar", value: `\`${commandCount}\``, inline: true },
      { name: "📋 Sunucu Hedef Barı", value: `${progressBar} \`${guildCount}/${hedef}\``, inline: false }
    )
    .addFields(
      { name: "⏺️ Ping", value: `\`${ping} ms\``, inline: true },
      { name: "📼 Bellek", value: `\`${memUsed}MB / ${memTotal}MB\``, inline: true },
      { name: "🖥️ İşlemci", value: `\`${cpu}\nKullanım: ${cpuUsage}ms\``, inline: false }
    )
    .addFields(
      { name: "⏳ Bot Açık Kalma Süresi", value: `\`${botUptime}\``, inline: true },
      { name: "⏳ Sistem Açık Kalma Süresi", value: `\`${sysUptime}\``, inline: true },
      { name: "📥 Oluşturulma Tarihi", value: `${createdAt}`, inline: true }
    )
    .addFields(
      { name: "📦 Etkinlik Sayısı", value: `\`${eventCount}\``, inline: true },
      { name: "🪬 Shard ID", value: `\`${shard + 1}\` / ${totalShards}`, inline: true }
    )
    .setFooter({ text: "Nifty istatistikleri" });
}

function msToReadable(ms) {
  let s = Math.floor((ms / 1000) % 60),
    m = Math.floor((ms / 1000 / 60) % 60),
    h = Math.floor((ms / 1000 / 60 / 60) % 24),
    d = Math.floor(ms / 1000 / 60 / 60 / 24);
  return `${d ? d + "g " : ""}${h ? h + "s " : ""}${m ? m + "d " : ""}${s ? s + "sn" : ""}`.trim();
}