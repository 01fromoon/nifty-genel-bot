import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { command } from "../app.js";

export default command(
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Botun gecikme süresini gösterir"),

    async (client, interaction) => {
        const ping = client.ws.ping;
        const embed = new EmbedBuilder()
            .setTitle("Pong!")
            .setDescription(`📍 Botun gecikmesi ${ping}ms.`)
            .setColor("Yellow");

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
        const messagePing = reply.createdTimestamp - interaction.createdTimestamp;

        embed.addFields(
            { name: '🌐 API Gecikmesi', value: `${ping}ms`, inline: true },
            { name: '📨 Mesaj Gecikmesi', value: `${messagePing}ms`, inline: true }
        );

        await interaction.editReply({ embeds: [embed] });
    }
);
