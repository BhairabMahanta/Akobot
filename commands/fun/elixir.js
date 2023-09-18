  const { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  name: 'elixir2',
  description:'something',
  async execute  (client, message, args) {
    let inputData = `'${args}'`
    let array = [];
function calculateTotal(data) {
  try {
  const lines = data.split('\n').filter(line => line.trim() !== '');
  console.log('lines:', lines)
  let totalEasy = 0;
  let totalMedium = 0;
  let totalHard = 0;

   for (const line of lines) {
     console.log('lines:', line)
  const regex = /(\d+\/\d+)/g;
    const matches = line.match(regex);
          const mentions = line.match(/@[^@]*$/);
      if (mentions) {
        console.log('mentions:', mentions)
        var lastMention = mentions[0];
        console.log('Last Mention:', lastMention);
      }
    if (matches) {
      console.log('match?', matches)
       const [total, easy, medium, hard] = matches.map(match => match.split('/').map(Number));
        console.log('totalValues', total);
      console.log('easyValues', easy);
         console.log('mediumValues', medium);
         console.log('hardValues', hard);
      const individualTotal =
        easy[0] * 80 +
        (easy[1] - easy[0]) * 20 +
        medium[0] * 110 +
        (medium[1] - medium[0]) * 20 +
        hard[0] * 170 +
        (hard[1] - hard[0]) * 20;
      console.log('indivTotal:', individualTotal)
    
array.push(`${lastMention}, Elixir earnt: ${individualTotal}`);
      
      console.log(`${lastMention}, ${individualTotal  }`)
    }
  }
    
 const initialEmbed = new EmbedBuilder()
      .setTitle('Elixir Distribution fr')
      .setDescription(`${array.join('\n')}`)
      .setFooter({text: `Cmd Ran by ${message.author.id}`});
    // message.channel.send({embeds: [initialEmbed]});
  return message.channel.send({embeds: [initialEmbed]});
   } catch (error) {
    console.log('error:', error)
     }
}
const totals = calculateTotal(inputData);

// // Output the totals
// console.log('Total Easy:', totals.totalEasy);
// console.log('Total Medium:', totals.totalMedium);
// console.log('Total Hard:', totals.totalHard);

  }
}