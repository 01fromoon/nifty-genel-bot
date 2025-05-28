import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import { SlashCommand } from "../app.js";

const PAGE_SIZE = 5;      // Her sayfa 5 oyun
const TOTAL_GAMES = 20;   // Toplam 20 oyun

async function getDiscountedGames() {
    const url = "https://store.steampowered.com/api/featuredcategories?cc=us";
    const res = await fetch(url);
    const data = await res.json();
    return data.specials.items
        .filter(g => g.discount_percent > 0)
        .slice(0, TOTAL_GAMES)
        .map(g => ({
            name: g.name,
            discount: g.discount_percent,
            price: (g.final_price / 100).toLocaleString("en-US", { style: "currency", currency: "USD" }),
            oldPrice: (g.original_price / 100).toLocaleString("en-US", { style: "currency", currency: "USD" }),
            url: `https://store.steampowered.com/app/${g.id}`
        }));
}

function createEmbed(games, page) {
    const maxPage = Math.ceil(games.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, games.length);
    const slice = games.slice(start, end);

    return new EmbedBuilder()
        .setTitle("Steam Discounted Games")
        .setColor("Blurple")
        .setDescription(
            slice.map((g, i) =>
                `**${start + i + 1}. [${g.name}](${g.url})**\nDiscount: **%${g.discount}**\nPrice: ~~${g.oldPrice}~~ ➔ **${g.price}**`
            ).join("\n\n")
        )
        .setFooter({ text: `Page ${page} / ${maxPage}` });
}

function createButtons(page, maxPage) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("steam_prev")
            .setLabel("⬅️ Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId("steam_next")
            .setLabel("Next ➡️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === maxPage)
    );
}

export default class SteamIndirimCommand extends SlashCommand {
    build = new SlashCommandBuilder()
        .setName("steamindirim")
        .setDescription("Shows the most popular discounted Steam games (4 pages, 5 games per page, USD prices).");

    async execute(client, interaction) {
        await interaction.deferReply();

        const games = await getDiscountedGames();
        if (!games.length) {
            await interaction.editReply("No discounted games found at the moment.");
            return;
        }

        const maxPage = Math.ceil(games.length / PAGE_SIZE);
        let page = 1;

        let embed = createEmbed(games, page);
        let buttons = createButtons(page, maxPage);

        const msg = await interaction.editReply({ embeds: [embed], components: [buttons] });

        const collector = msg.createMessageComponentCollector({ time: 2 * 60 * 1000 });

        collector.on("collect", async btnInt => {
            if (btnInt.user.id !== interaction.user.id) {
                await btnInt.reply({ content: "Only the user who used the command can use these buttons.", ephemeral: true });
                return;
            }
            if (btnInt.customId === "steam_prev" && page > 1) {
                page--;
            } else if (btnInt.customId === "steam_next" && page < maxPage) {
                page++;
            }
            embed = createEmbed(games, page);
            buttons = createButtons(page, maxPage);
            await btnInt.update({
                embeds: [embed],
                components: [buttons]
            });
        });

        collector.on("end", async () => {
            if (msg.editable) {
                const disabledButtons = new ActionRowBuilder().addComponents(
                    ...createButtons(page, maxPage).components.map(b => b.setDisabled(true))
                );
                await msg.edit({
                    components: [disabledButtons]
                });
            }
        });
    }
};
