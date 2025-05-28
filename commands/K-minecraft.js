import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../app.js";

function safe(str) {
    if (!str) return "Bilinmiyor";
    if (Array.isArray(str)) return str.join(" ");
    return str.toString();
}

export default class McServerCommand extends SlashCommand {
    build = new SlashCommandBuilder()
        .setName("minecraft")
        .setDescription("Minecraft sunucusu hakkında bilgi alırsın.")
        .addStringOption(opt =>
            opt.setName("ip")
               .setDescription("Sunucunun IP adresi veya domaini (örn: play.craftrise.tc)")
               .setRequired(true)
        );

    async execute(client, interaction) {
        const ip = interaction.options.getString("ip");

        await interaction.deferReply();

        try {
            const res = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
            const data = await res.json();

            if (!data.online) {
                await interaction.editReply("❌ Sunucuya ulaşılamadı veya çevrimdışı!");
                return;
            }

            const playersOnline = data.players?.online ?? 0;
            const playersMax = data.players?.max ?? "?";
            const version = safe(data.version);
            const software = safe(data.software);
            const protocol = data.protocol ?? "?";
            const motd = (data.motd?.clean && data.motd.clean.length)
                ? data.motd.clean.join("\n")
                : "Yok";
            const hostname = safe(data.hostname ?? ip);
            const port = data.port ?? 25565;
            const favicon = data.icon ? `attachment://favicon.png` : null;

            const embed = new EmbedBuilder()
                .setTitle(`🟢 Minecraft Sunucu Bilgisi`)
                .setColor("Green")
                .setDescription(`**Sunucu:** \`${hostname}\`\n**Port:** \`${port}\``)
                .addFields(
                    { name: "🌐 Sürüm", value: version, inline: true },
                    { name: "🖥️ Yazılım", value: software, inline: true },
                    { name: "📶 Protokol", value: protocol.toString(), inline: true },
                    { name: "👥 Oyuncular", value: `**${playersOnline}** / ${playersMax}`, inline: true },
                    { name: "📝 MOTD", value: `\`\`\`\n${motd}\n\`\`\`` }
                );

            if (favicon && data.icon) {
                const base64 = data.icon.split(",")[1];
                const buffer = Buffer.from(base64, "base64");
                await interaction.editReply({
                    embeds: [embed.setThumbnail(favicon)],
                    files: [{ attachment: buffer, name: "favicon.png" }]
                });
            } else {
                await interaction.editReply({ embeds: [embed] });
            }
        } catch (err) {
            await interaction.editReply("❌ Bir hata oluştu, sunucuya ulaşamadım.");
        }
    }
};