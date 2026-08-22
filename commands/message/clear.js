const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'clear',
    aliases: ['empty', 'clean', 'clearqueue'],
    description: 'Clear all songs from queue',

    async execute(message, args, client) {

        const ConditionChecker = require('../../utils/checks');
        const checker = new ConditionChecker(client);

        try {
            const conditions = await checker.checkMusicConditions(
                message.guild.id,
                message.author.id,
                message.member.voice?.channelId
            );

            if (!conditions.hasActivePlayer || conditions.queueLength === 0) {
                const embed = new EmbedBuilder()
                    .setDescription('❌ Queue is empty!')
                    .setColor('#FF0000');

                return message.reply({ embeds: [embed] })
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
            }

            if (!conditions.sameVoiceChannel) {
                const embed = new EmbedBuilder()
                    .setDescription('❌ You need to be in the same voice channel as the bot!')
                    .setColor('#FF0000');

                return message.reply({ embeds: [embed] })
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
            }

            const player = conditions.player;
            const clearedCount = player.queue.size;

            player.queue.clear();

            const embed = new EmbedBuilder()
                .setDescription(`🗑️ Cleared **${clearedCount}** songs from queue!`)
                .setColor('#00FF00');

            return message.reply({ embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));

        } catch (error) {
            console.error('Clear command error:', error);

            const embed = new EmbedBuilder()
                .setDescription('❌ Error clearing queue!')
                .setColor('#FF0000');

            return message.reply({ embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }
    }
};
