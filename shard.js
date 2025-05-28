import { ShardingManager } from "discord.js";
import fs from 'fs';
import readline from 'readline';
import "dotenv/config";
import { DisTube } from "distube";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { SpotifyPlugin } from "@distube/spotify";
import { YtDlpPlugin } from "@distube/yt-dlp";
import { Player } from "discord-player";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function promptForToken() {
    return new Promise((resolve) => {
        rl.question('Please enter your bot token: ', (token) => {
            resolve(token);
        });
    });
}

async function updateEnvFile(newToken) {
    return new Promise((resolve, reject) => {
        fs.appendFile('.env', `\nTOKEN=${newToken}`, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

async function startShards() {
    if (!process.env.TOKEN) {
        console.log('Bot token is not found in .env file.');
        const newToken = await promptForToken();
        rl.close();
        await updateEnvFile(newToken);
        process.env.TOKEN = newToken;
    }

    const manager = new ShardingManager('./start.js', {
        totalShards: "auto",
        execArgv: ["--max-old-space-size=2048", "--trace-warnings"],
        token: process.env.TOKEN,
    });

    manager.on('shardCreate', shard => {
        shard.on('death', () => console.warn(`Shard ${shard.id + 1} sent a death event!`));
        shard.on('ready', () => console.log(`Shard ${shard.id + 1} is now running and active!`));
        shard.on('error', err => console.error(`Error occurred in Shard ${shard.id + 1}: \n` + (err.message ? err.message : err)));
    });

    manager.on('ready', async () => {

        let i = 0;
        const activities = [
            {
                name: "✨ 01fromoon tarafından yapıldı!",
                type: 0
            },
            {
                name: "💡 /yardım   ⚙️ /ayarlar",
                type: 0
            },
            {
                name: async (client) => {
                    const guilds = await client.guilds.fetch();
                    const users = client.users.cache.size;
                    const channels = client.channels.cache.size;
                    return `🌐 ${guilds.size} sunucu, 👤 ${users} kullanıcı, #️⃣ ${channels} kanal`;
                },
                type: 0
            }
        ];

        setInterval(async () => {
            const activity = activities[i];
            await manager.broadcastEval(async (c, { activity }) => {
                let name = typeof activity.name === "function" ? await activity.name(c) : activity.name;
                c.user.setActivity(name, { type: activity.type }).catch(() => {});
            }, { context: { activity } });
            i = (i + 1) % activities.length;
        }, 8000);
    });

    manager.spawn({ timeout: 180000 }).catch(console.error);
}

startShards();