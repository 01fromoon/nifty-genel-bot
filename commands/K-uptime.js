import {SlashCommandBuilder, EmbedBuilder} from "discord.js";
import {SlashCommand} from "../app.js";
import moment from "moment";

export default class MyCommand extends SlashCommand {
    build = new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Botun uptime süresini gösterir.");

    async execute(client, interaction) {
 
        const uptime = moment
            .duration(client.uptime)
            .humanize('D [gün], H [saat], m [dakika], s [saniye]');
        const embed = new EmbedBuilder()
            .setTitle("Nifty")
            .setDescription(`🚀 Uptime süresi: ${uptime}`)
            .setColor("Yellow")
        interaction.reply({embeds: [embed]})
    } 
};