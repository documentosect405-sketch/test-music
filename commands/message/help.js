const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'List all available commands',

    async execute(message, args, client) {
        try {
            const msgCommandsPath = path.join(__dirname, '..', 'message');
            const msgFiles = fs.readdirSync(msgCommandsPath).filter(file => file.endsWith('.js'));

            const messageCommands = msgFiles.map(file => {
                const cmd = require(path.join(msgCommandsPath, file));
                return {
                    name: cmd.name || 'Unknown',
                    description: cmd.description || 'No description'
                };
            });

            const slashCommandsPath = path.join(__dirname, '..', 'slash');
            const slashFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

            const slashCommands = slashFiles.map(file => {
                const cmd = require(path.join(slashCommandsPath, file));
                return {
                    name: cmd.data?.name || 'Unknown',
                    description: cmd.data?.description || 'No description'
                };
            });

            let description = `**🌐 Bot Stats:** Serving in **${client.guilds.cache.size}** servers.\n\n`;

            description += `**💬 Message Commands [${messageCommands.length}]:**\n`;
            messageCommands.forEach(cmd => {
                description += `- \`!${cmd.name}\` - ${cmd.description}\n`;
            });

            description += `\n**⚡ Slash Commands [${slashCommands.length}]:**\n`;
            slashCommands.forEach(cmd => {
                description += `- \`/${cmd.name}\` - ${cmd.description}\n`;
            });

            if (description.length > 4096) {
                description = description.slice(0, 4093) + '...';
            }

            const embed = new EmbedBuilder()
                .setTitle('📖 Ultimate Music Bot - Command List')
                .setColor(0x1DB954)
                .setDescription(description)
                .setFooter({ text: 'Developed by GlaceYT' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Help command error:', error);
            await message.reply('❌ Error al mostrar comandos');
        }
    }
};
