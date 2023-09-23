const { EmbedBuilder } = require('discord.js')
const players = require('../../data/players.json')

module.exports = {
	name: 'statuswindow',
	description: 'shows status window of the player',
  aliases: ['sw', 'me', 'status'],
	async execute(client, message, args) {
		let player = players[message.author.id]
    const charEmbed = new EmbedBuilder()
    .setColor(0x992e22)
    .setAuthor({
                name: `${players[message.author.id].name}'s status window`,
                iconURL: 'https://i.imgur.com/AfFp7pu.png',
                url: 'https://discord.js.org'
              })
   .setDescription(
`General Status:\n \`\`Level \`\` **${player.exp.level}**\n \`\`Exp   \`\`   **${player.exp.xp}**\n **__Physical Stats__**\n \`\`Attack      \`\` ➝ ⚔️ \u200b \u200b **${player.stats.attack}**\n \`\`Defense     \`\`  ➝  🛡️ \u200b \u200b **${player.stats.defense}**\n \`\`Speed       \`\`  ➝  💨 \u200b \u200b **${player.stats.speed}**\n \`\`HitPoints   \`\`  ➝  ❤️  \u200b \u200b**${player.stats.hitpoints}**\n \`\`Tactics     \`\` ➝  🧠  \u200b \u200b  **${player.stats.tactics}**\n  \`\`Potential   \`\`  ➝  📶 \u200b \u200b **${player.stats.potential}**\n \`\`Training    \`\`  ➝  🧬 \u200b \u200b **${player.stats.training}**\n **__Magical Powers__**\n \`\`Magic       \`\`  ➝  🪄 \u200b \u200b **${player.stats.magic}**\n \`\`Intelligence\`\`  ➝  📚 \u200b \u200b **${player.stats.intelligence}**\n \`\`Wise        \`\`  ➝  👴 \u200b \u200b **${player.stats.wise}**\n \`\`Luck        \`\`  ➝  📶 \u200b \u200b **${player.stats.luck}**\n \`\`Devotion    \`\`  ➝  🙏 \u200b \u200b **${player.stats.devotion}**\n **__Currencies__**\n:coin:  **${player.balance.coins}** \u200b \u200b \u200b \u200b :gem:  **${player.balance.gems}**\nFamiliar:\n **${player.cards.name}** \nYour Location\n:round_pushpin: **${player.location}**`
    );
message.channel.send({ embeds: [charEmbed] });
	},
}