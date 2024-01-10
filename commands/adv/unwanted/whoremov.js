  
  const sharp = require('sharp');
  // adventureCommand.js
  const { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, StringSelectMenuBuilder, AuditLogEvent, Intents, MessageReactionAddEvent, MessageReactionRemoveEvent } = require('discord.js');
// console.log(AuditLogEvent)
 const fs = require('fs');

  module.exports = {    
    name: 'whoe',
    description: 'what!',
     aliases: ['woo'],
    async execute(client, message, args, interaction) {
      const channel = message.guild.channels.cache.get(message.channel.id);
const messageID = '1159552304115105853';

const messageA = await channel.messages.fetch(messageID);




const collector = messageA.createMessageComponentCollector({
  filter: interaction => interaction.customId === 'talk_npc'
});
 bothButton = new ActionRowBuilder().addComponents(
           new ButtonBuilder()
          .setCustomId('talk_npc')
          .setLabel(' 🗣️ Talk')
          .setStyle('Primary'),
   new ButtonBuilder()
          .setCustomId('attack_monster')
          .setLabel('⚔️ Attack')
          .setStyle('Primary')
               );
messageA.edit({ components: [bothButton]});

collector.on('collect', interaction => {
  if (interaction.customId === 'talk_npc') {
    message.channel.send("You're Gay!")
  }
  // Do something when the button is clicked
});

//       dont try {
        
      
//    console.log('who lmao')
//     // Get the message ID from the command.
//     console.log('messagecontent:', message.content)
//     const messageID = '1159546181349802095'

//     // Get the channel where the message is located.
//     const channel = message.guild.channels.cache.get(message.channel.id);
 

//     // Get the message object.
//     const messageObject = await channel.messages.fetch(messageID);
//     console.log('messageOBKECT:', messageObject)
// //     const fetchedLogs = await message.guild.fetchAuditLogs();
// // const firstEntry = fetchedLogs.entries.first();
    



//     // Get the audit logs for the message.
//     const auditLogs = await message.guild.fetchAuditLogs({
//       type: AuditLogEvent.MessageDelete
//     });
//     console.log('auditlosgs:', auditLogs)
      

//     // Get the audit log entry for the reaction removal.
//     const auditLogEntry = auditLogs.entries.find(auditLogEntry => auditLogEntry.actionType === AuditLogEvent.MessageDelete && auditLogEntry.messageID === messageID);
//     console.log('enTry:', auditLogEntry)

//     // If the audit log entry is not found, send a message to the channel.
//     if (!auditLogEntry) {
//       message.channel.send('Could not find an audit log entry for the reaction removal.');
//       return;
//     }

//     // Get the user who removed the reaction.
//     const user = await client.users.fetch(auditLogEntry.executorID);

//     // Send a message to the channel with the user who removed the reaction.
//     message.channel.send(`User ${user} removed a reaction from message ${messageID}.`);
//         } catch (error) {
//         console.log('errorrr:', error)
//       }
    }
  };