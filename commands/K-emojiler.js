import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { SlashCommand } from "../app.js";

export default class extends SlashCommand {
  build = new SlashCommandBuilder()
    .setName("emojiler")
    .setDescription("🎉 Sunucudaki tüm emojileri ultra modern embed ile gösterir.");

  async execute(client, interaction) {
    const emojis = interaction.guild.emojis.cache;
    if (!emojis.size) {
      return interaction.reply({ content: "Bu sunucuda hiç emoji yok!", ephemeral: true });
    }

    const normal = emojis.filter(e => !e.animated).map(e => `<:${e.name}:${e.id}>`);
    const animated = emojis.filter(e => e.animated).map(e => `<a:${e.name}:${e.id}>`);

    function chunk(arr) {
      let out = [], temp = "";
      for (const x of arr) {
        if ((temp + x).length > 1000) {
          out.push(temp);
          temp = "";
        }
        temp += x + " ";
      }
      if (temp) out.push(temp);
      return out;
    }

    const normalChunks = chunk(normal);
    const animatedChunks = chunk(animated);

    const pages = [];
    for (const c of normalChunks) pages.push({ title: "Statik Emojiler", content: c, color: "#43B581" });
    for (const c of animatedChunks) pages.push({ title: "Animasyonlu Emojiler", content: c, color: "#FAA81A" });

    let page = 0;
    const getEmbed = (i) => new EmbedBuilder()
      .setAuthor({ name: `${interaction.guild.name} • Emoji Listesi`, iconURL: interaction.guild.iconURL() })
      .setTitle(`${pages[i].title} (${i + 1}/${pages.length})`)
      .setDescription(pages[i].content)
      .setColor(pages[i].color)
      .setFooter({ text: `Toplam Emoji: ${emojis.size}` })
      .setTimestamp();

    const getRow = (i) => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️")
        .setDisabled(i === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("➡️")
        .setDisabled(i === pages.length - 1),
    );

    const msg = await interaction.reply({
      embeds: [getEmbed(page)],
      components: [getRow(page)],
      fetchReply: true
    });

    if (pages.length === 1) return; 

    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 60000
    });

    collector.on("collect", async (i) => {
      if (i.customId === "prev") page--;
      else if (i.customId === "next") page++;
      await i.update({ embeds: [getEmbed(page)], components: [getRow(page)] });
    });
    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
}