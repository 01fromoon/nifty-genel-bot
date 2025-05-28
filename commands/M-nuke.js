import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ChannelType
} from "discord.js";
import { SlashCommand } from "../app.js";

export default class NukeCommand extends SlashCommand {
    build = new SlashCommandBuilder()
        .setName("nuke")
        .setDescription("Seçilen metin kanalını silip tekrar oluşturur.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ content: "❌ Bu komutu kullanmak için kanal yönetme yetkin olmalı.", ephemeral: true });
            return;
        }

        const textChannels = interaction.guild.channels.cache
            .filter(ch => ch.type === ChannelType.GuildText)
            .sort((a, b) => a.position - b.position)
            .map(ch => ({
                label: `#${ch.name}`,
                description: ch.parent ? `Kategori: ${ch.parent.name}` : "Kategorisiz",
                value: ch.id
            }))
            .slice(0, 25); 

        if (!textChannels.length) {
            await interaction.reply({ content: "Bu sunucuda metin kanalı yok.", ephemeral: true });
            return;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("nuke_channel_select")
            .setPlaceholder("Nuke atılacak kanalı seçin")
            .addOptions(textChannels);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: "💣 Nuke atmak istediğin kanalı seç:",
            components: [row],
            ephemeral: true
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.customId === "nuke_channel_select" && i.user.id === interaction.user.id,
            time: 60_000, 
            max: 1
        });

        collector.on("collect", async selectInt => {
            const channelId = selectInt.values[0];
            const channel = interaction.guild.channels.cache.get(channelId);

            const channelData = {
                name: channel.name,
                type: channel.type,
                topic: channel.topic,
                nsfw: channel.nsfw,
                parent: channel.parentId,
                position: channel.position,
                rateLimitPerUser: channel.rateLimitPerUser,
                permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
                    id: po.id,
                    allow: po.allow.bitfield,
                    deny: po.deny.bitfield,
                    type: po.type
                }))
            };

            await selectInt.update({ content: `💥 ${channel} kanalı nuke'lanıyor...`, components: [] });

            await channel.delete(`Nuke komutu ile silindi: ${interaction.user.tag}`);
            const newChannel = await interaction.guild.channels.create({
                name: channelData.name,
                type: channelData.type,
                topic: channelData.topic,
                nsfw: channelData.nsfw,
                parent: channelData.parent,
                position: channelData.position,
                rateLimitPerUser: channelData.rateLimitPerUser,
                permissionOverwrites: channelData.permissionOverwrites,
                reason: `Nuke komutu ile yeniden oluşturuldu: ${interaction.user.tag}`
            });

            const embed = new EmbedBuilder()
                .setTitle("💥 Kanal Nuke'lendi!")
                .setDescription(`Kanal başarıyla temizlendi ve tekrar oluşturuldu.`)
                .setColor("Red")
                .setImage("https://media.tenor.com/i8uC3D1L4hMAAAAC/nuke-bomb.gif");

            await newChannel.send({ embeds: [embed] });
        });

        collector.on("end", async collected => {
            if (collected.size === 0) {
                await interaction.editReply({ content: "⏳ Zaman aşımı! Hiçbir kanal seçilmedi.", components: [] });
            }
        });
    }
};