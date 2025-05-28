import { Client, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";

export default class MyCommand extends SlashCommand {
    build = new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Seçilen kullanıcının profil resmini gösterir")
        .addUserOption(option =>
            option
                .setName("kullanıcı")
                .setDescription("profili gösterilecek kullanıcıyı seçin.")
                .setRequired(false)
        );

    async execute(client, interaction) {
        const user = interaction.options.getUser("kullanıcı") || interaction.user;
        const embed = new EmbedBuilder()
            .setColor("Yellow")
            .setAuthor({ name: `${user.username} Adlı kullanıcının profil resmi:` })
            .setImage(
                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
            );
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
