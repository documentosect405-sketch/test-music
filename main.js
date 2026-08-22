/**
 * Ultimate Music Bot 
 * Core application (LIMPIO)
 */

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Riffy } = require('riffy');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const connectDB = require('./database/connection');
const PlayerHandler = require('./utils/player');
const StatusManager = require('./utils/statusManager');
const GarbageCollector = require('./utils/garbageCollector');
require('dotenv').config();

class Bot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent
            ]
        });

        this.client.commands = new Collection();
        this.client.slashCommands = new Collection();

        this.client.statusManager = new StatusManager(this.client);
        this.client.playerHandler = new PlayerHandler(this.client);

        this.initRiffy();
    }

    initRiffy() {
        this.client.riffy = new Riffy(this.client, [
            {
                host: config.lavalink.host,
                password: config.lavalink.password,
                port: config.lavalink.port,
                secure: config.lavalink.secure
            }
        ], {
            send: (payload) => {
                const guild = this.client.guilds.cache.get(payload.d.guild_id);
                if (guild) guild.shard.send(payload);
            }
        });

        this.client.on('raw', (d) => {
            if (['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(d.t)) {
                this.client.riffy.updateVoiceState(d);
            }
        });
    }

    async start() {
        try {
            await connectDB();
            console.log('✅ MongoDB conectado');

            this.loadCommands();
            this.loadEvents();

            GarbageCollector.init();

            this.client.playerHandler.initializeEvents();

            await this.client.login(process.env.TOKEN);
        } catch (err) {
            console.error('❌ Error al iniciar:', err);
            process.exit(1);
        }
    }

    loadCommands() {
        const msgPath = path.join(__dirname, 'commands', 'message');
        const slashPath = path.join(__dirname, 'commands', 'slash');

        if (fs.existsSync(msgPath)) {
            fs.readdirSync(msgPath).forEach(file => {
                const cmd = require(path.join(msgPath, file));
                this.client.commands.set(cmd.name, cmd);
            });
        }

        if (fs.existsSync(slashPath)) {
            fs.readdirSync(slashPath).forEach(file => {
                const cmd = require(path.join(slashPath, file));
                this.client.slashCommands.set(cmd.data.name, cmd);
            });
        }

        console.log(`✅ Comandos cargados: ${this.client.commands.size + this.client.slashCommands.size}`);
    }

    loadEvents() {
        const eventsPath = path.join(__dirname, 'events');

        fs.readdirSync(eventsPath).forEach(file => {
            const event = require(path.join(eventsPath, file));

            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args, this.client));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this.client));
            }
        });

        console.log('✅ Eventos cargados');
    }
}

const bot = new Bot();
bot.start();

module.exports = bot.client;
