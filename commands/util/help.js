const { EmbedBuilder } = require('discord.js')

module.exports = {
	name: 'help',
	description: 'Gay',

	async execute(client, message, args) {
		const helpEmbed = new EmbedBuilder().setColor(0x0099ff).setDescription(
			`:green_circle: **kriz** - Bully kriz
			 :green_circle: **ping** - Check Latency
       :green_circle: **Register** - Start The Bot
       :green_circle: **scam** - Scam cards
       :green_circle: **ping** - Check Latency
       :green_circle: **trivia** - Starts A Trivia Game
       :green_circle: **elixir** - Help calculate elixir distribution
   `
		)
		message.channel.send({ embeds: [helpEmbed] })
	},
}