import { event } from "../app.js";
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } from "discord.js";
import os from "os";
import process from "process";
import db from "croxydb";

export default event("interactionCreate", async interaction => {
    const adminOnly = [
        "yasakliKelimeEkle",
        "yasakliKelimeSil",
        "yasakliKelimeListe",
        "yasakliKelimeEkleModal",
        "yasakliKelimeSilMenu"
    ];
    if (
        (interaction.isButton() && adminOnly.includes(interaction.customId)) ||
        (interaction.isModalSubmit() && adminOnly.includes(interaction.customId)) ||
        (interaction.isStringSelectMenu() && adminOnly.includes(interaction.customId))
    ) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Bu işlemi yapmak için **Yönetici** yetkisine sahip olmalısın.",
                ephemeral: true
            });
        }
    }

    // --- Yardım menüsü butonları ---
    if (interaction.isButton()) {
        // Premium
        if (interaction.customId === "yardim_premium") {
            const embed = new EmbedBuilder()
                .setTitle("💎 Premium Komutlar")
                .setDescription([
                    "`/premium`"
                ].join("\n"))
                .setColor(0xF7C873)
                .setFooter({ text: "Bot geliştiricisi: 01fromoon 💎" });

            await interaction.update({ embeds: [embed] });
            return;
        }
        // Moderasyon
        if (interaction.customId === "yardim_moderasyon") {
            const embed = new EmbedBuilder()
                .setTitle("🛡️ Moderasyon Komutları")
                .setDescription([
                    "`/ban`",
                    "`/davet-sistemi`",
                    "`/davet-sıfırla`",
                    "`/hoşgeldin-sistemi`",
                    "`/hoşgeldin-sıfırla`",
                    "`/kanal-log`",
                    "`/kick`",
                    "`/lock`",
                    "`/unlock`",
                    "`/küfürengel`",
                    "`/reklamengel`",
                    "`/mesaj-log`",
                    "`/nuke`",
                    "`/otorol-aç`",
                    "`/otorol-kapat`",
                    "`/oylama`",
                    "`/reklam-engel`",
                    "`/rol-log`",
                    "`/sil`",
                    "`/timeout`",
                    "`/untimeout`",
                    "`/uyarı`",
                    "`/uyarılar`",
                    "`/yasaklı-kelime`",
                ].join("\n"))
                .setColor(0x5865F2)
                .setFooter({ text: "Bot geliştiricisi: 01fromoon 🛡️" });

            await interaction.update({ embeds: [embed] });
            return;
        }
        // Kullanıcı
        if (interaction.customId === "yardim_kullanici") {
            const embed = new EmbedBuilder()
                .setTitle("👤 Kullanıcı Komutları")
                .setDescription([
                    "`/avatar`",
                    "`/ping`",
                    "`/davetlerim`",
                    "`/emojiler`",
                    "`/istatistik`",
                    "`/minecraft`",
                    "`/steamindirim`",
                    "`/sunucu`",
                    "`/uptime`",
                    "`/yardım`"
                ].join("\n"))
                .setColor(0x43B581)
                .setFooter({ text: "Bot geliştiricisi: 01fromoon 👤" });

            await interaction.update({ embeds: [embed] });
            return;
        }
    }
    // --- Yardım menüsü butonları son ---

    if (interaction.isButton() && interaction.customId === "sunucu_yenile") {
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

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Sunucu Bilgileri`)
            .setColor("Blurple")
            .addFields(
                { name: `${emojis.owner} Sunucu Sahibi`, value: `<@${owner.id}> (${owner.user?.tag || "Bilinmiyor"})`, inline: false },
                { name: `${emojis.date} Sunucu Kuruluş`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: false },
                { name: `${emojis.boost} Takviye Sayısı`, value: `${boostCount}`, inline: false },
                { name: `${emojis.voice} Ses Kanalları`, value: `${sesKanallari}`, inline: true },
                { name: `${emojis.text} Metin Kanalları`, value: `${metinKanallari}`, inline: true },
                { name: `${emojis.role} Rol Sayısı`, value: `${rolSayisi}`, inline: true },
                { name: `${emojis.user} Gerçek Üyeler`, value: `${realCount}\u200b`, inline: true },
                { name: `${emojis.bot} Botlar`, value: `${botCount}\u200b`, inline: true },
                { name: `${emojis.total} Toplam Kullanıcı`, value: `${totalCount}\u200b`, inline: true }
            )
            .setFooter({ text: "Açık kaynak koduna sahip gelişmiş discord botu, Nifty!" });

        const yenileBtn = new ButtonBuilder()
            .setCustomId("sunucu_yenile")
            .setLabel("Yenile")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔄");

        const silBtn = new ButtonBuilder()
            .setCustomId("sunucu_sil")
            .setLabel("Sil")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🗑️");

        const row = new ActionRowBuilder().addComponents(yenileBtn, silBtn);

        await interaction.update({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton() && interaction.customId === "sunucu_sil") {
        await interaction.deferUpdate();
        await interaction.message.delete().catch(() => {});
    }

    if (interaction.isButton() && interaction.customId === "istatistik_refresh") {
        const client = interaction.client;
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

        const embed = new EmbedBuilder()
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

        await interaction.update({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton() && interaction.customId === "istatistik_delete") {
        await interaction.deferUpdate();
        await interaction.message.delete().catch(() => {});
    }

    if (interaction.isButton()) {
        // EKLE
        if (interaction.customId === "yasakliKelimeEkle") {
            const modal = new ModalBuilder()
                .setCustomId("yasakliKelimeEkleModal")
                .setTitle("Yasaklı Kelime Ekle");

            const kelimeInput = new TextInputBuilder()
                .setCustomId("kelime")
                .setLabel("Yasaklanacak kelimeyi yazınız")
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(32)
                .setPlaceholder("ör: küfür, reklam vs.")
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(kelimeInput));
            return interaction.showModal(modal);
        }

        // SİL
        if (interaction.customId === "yasakliKelimeSil") {
            const kelimeler = db.get(`yasakliKelimeler_${interaction.guild.id}`) || [];
            if (kelimeler.length === 0) {
                return interaction.reply({ content: "❌ Hiç yasaklı kelime eklenmemiş.", ephemeral: true });
            }
            const select = new StringSelectMenuBuilder()
                .setCustomId("yasakliKelimeSilMenu")
                .setPlaceholder("Silinecek kelimeyi seçin")
                .addOptions(
                    kelimeler.map(kelime => ({
                        label: kelime,
                        value: kelime
                    }))
                );
            const row = new ActionRowBuilder().addComponents(select);

            return interaction.reply({
                content: "Silmek istediğiniz kelimeyi seçin:",
                components: [row],
                ephemeral: true
            });
        }

        // LİSTE
        if (interaction.customId === "yasakliKelimeListe") {
            const kelimeler = db.get(`yasakliKelimeler_${interaction.guild.id}`) || [];
            if (kelimeler.length === 0) {
                return interaction.reply({ content: "⚠️ Henüz hiç yasaklı kelime eklenmemiş.", ephemeral: true });
            }
            const embed = new EmbedBuilder()
                .setTitle("🚫 Yasaklı Kelimeler")
                .setColor("DarkRed")
                .setDescription(kelimeler.map((kelime, i) => `\`${i + 1}.\` ${kelime}`).join("\n"))
                .setFooter({ text: `Toplam: ${kelimeler.length} kelime` });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === "yasakliKelimeEkleModal") {
        const kelime = interaction.fields.getTextInputValue("kelime").trim().toLowerCase();
        if (kelime.length < 1) return interaction.reply({ content: "Geçersiz kelime!", ephemeral: true });

        let kelimeler = db.get(`yasakliKelimeler_${interaction.guild.id}`) || [];
        if (kelimeler.includes(kelime)) {
            return interaction.reply({ content: "❌ Bu kelime zaten yasaklılar listesinde!", ephemeral: true });
        }
        kelimeler.push(kelime);
        db.set(`yasakliKelimeler_${interaction.guild.id}`, kelimeler);

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`✅ \`${kelime}\` kelimesi yasaklı kelime listesine eklendi!`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "yasakliKelimeSilMenu") {
        const kelime = interaction.values[0];
        let kelimeler = db.get(`yasakliKelimeler_${interaction.guild.id}`) || [];
        if (!kelimeler.includes(kelime)) {
            return interaction.reply({ content: "❌ Böyle bir kelime yok!", ephemeral: true });
        }
        kelimeler = kelimeler.filter(k => k !== kelime);
        db.set(`yasakliKelimeler_${interaction.guild.id}`, kelimeler);

        const embed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(`🗑️ \`${kelime}\` kelimesi yasaklılar listesinden silindi!`);
        return interaction.update({ content: null, embeds: [embed], components: [] });
    }
});

// Yardım menüsü için herhangi bir şey ekleme gerekmez, komut dosyasında butonlar gönderilecek.

function msToReadable(ms) {
    let s = Math.floor((ms / 1000) % 60),
        m = Math.floor((ms / 1000 / 60) % 60),
        h = Math.floor((ms / 1000 / 60 / 60) % 24),
        d = Math.floor(ms / 1000 / 60 / 60 / 24);
    return `${d ? d + "g " : ""}${h ? h + "s " : ""}${m ? m + "d " : ""}${s ? s + "sn" : ""}`.trim();
}