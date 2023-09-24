const { EmbedBuilder } = require('discord.js')
const players = require('../../data/players.json')

module.exports = {
  name: "ag",
  description: "stuff",
    aliases: ['adventurersguild', 'adventurerguild', 'guild'],
  async execute (client, message, args) {

    if (!message.author.bot) {
      const guild = new EmbedBuilder()
      .setColor('#0099ff')
        .setAuthor({
                name: `${players[message.author.id].name}`,
                iconURL: 'https://i.imgur.com/AfFp7pu.png',
                url: 'https://discord.js.org'
            })
    .setTitle(`The Adventurers Guild`)
    .setDescription('Please decide what would you like to browse:')
    .addFields(
       { name: '🇦', value: "Kriz the bald 34 year old Truck Driver", inline: true },
      { name: '🇧', value: "Sirol the AppleCat", inline: true },
      { name: '🇨', value: "Some hot spicy pics", inline: true },
      { name: '🇩', value: "Nothing, take me back", inline: true }
    );
      message.channel.send({ embeds: [guild]})
    }
     
  }
}