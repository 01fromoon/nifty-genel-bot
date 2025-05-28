import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

function buildSunucuEmbed(guild, owner, boostCount, sesKanallari, metinKanallari, rolSayisi, realCount, botCount, totalCount) {
    const emojis = {
        owner: "👑",
        date: "📆",
        boost: "🚀",
        voice: "🔊",
        text: "💬",
        role: "📛",
        user: "🧑",
        bot: "🤖",
        total: "👥"
    };

    return new EmbedBuilder()
        .setTitle(`${guild.name} Sunucu Bilgileri`)
        .setColor("Blurple")
        .addFields(
            { name: `${emojis.owner} Sunucu Sahibi`, value: `<@${owner.id}> (${owner.user?.tag || "Bilinmiyor"})`, inline: false },
            { name: `${emojis.date} Sunucu Kuruluş`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: false },
            { name: `${emojis.boost} Takviye Sayısı`, value: `${boostCount}`, inline: false },
            { name: `${emojis.voice} Ses Kanalları`, value: `${sesKanallari}`, inline: true },
            { name: `${emojis.text} Metin Kanalları`, value: `${metinKanallari}`, inline: true },
            { name: `${emojis.role} Rol Sayısı`, value: `${rolSayisi}`, inline: true },
            { name: `${emojis.user} Gerçek Üyeler`, value: `${realCount}`, inline: true },
            { name: `${emojis.bot} Botlar`, value: `${botCount}`, inline: true },
            { name: `${emojis.total} Toplam Kullanıcı`, value: `${totalCount}`, inline: true },
        )
        .setFooter({ text: "Açık kaynak koduna sahip gelişmiş discord botu, Nifty!" });
}

function buildButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("sunucu_yenile")
            .setLabel("Yenile")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔄"),
        new ButtonBuilder()
            .setCustomId("sunucu_sil")
            .setLabel("Sil")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️")
    );
}

import { SlashCommand } from "../app.js";

export default class SunucuCommand extends SlashCommand {
    build = new SlashCommandBuilder()
        .setName("sunucu")
        .setDescription("Sunucu hakkında ayrıntılı bilgi gösterir.");

    async execute(client, interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        const boostCount = guild.premiumSubscriptionCount || 0;
        const sesKanallari = guild.channels.cache.filter(c => c.type === 2).size;
        const metinKanallari = guild.channels.cache.filter(c => c.type === 0).size;
        const rolSayisi = guild.roles.cache.size;
        const members = await guild.members.fetch();
        const botCount = members.filter(m => m.user.bot).size;
        const realCount = members.filter(m => !m.user.bot).size;
        const totalCount = members.size;

        const embed = buildSunucuEmbed(guild, owner, boostCount, sesKanallari, metinKanallari, rolSayisi, realCount, botCount, totalCount);
        const row = buildButtons();

        await interaction.reply({ embeds: [embed], components: [row] });
    }
}