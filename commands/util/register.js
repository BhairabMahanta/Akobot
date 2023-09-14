const story = require('./story.json'); // Load the story from the JSON file
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const players = require('../../data/players.json');
const locations = require('../../data/locations');
const cards = require('../fun/cards.js');
let startedTutorial = [537619455409127442];
let deniedTutorial = [];

module.exports = {
  name: 'register',
  description: 'Lets begin',

  async execute(client, message, args) {
     if (!startedTutorial.includes(message.author.id)) {
    if (!args[0] || args[0].length > 16 || args[0].length < 3) {
      // Check character name validity
      const registerErrorEmbed = new EmbedBuilder()
        .setColor(0x992e22)
        .setDescription('Provide a valid character name (3 < name < 16)');
      return message.channel.send({ embeds: [registerErrorEmbed] });
    }
     }
    const characterName = args[0];
    // Check if the character name already exists
    const existingCharacter = Object.values(players).find(
      (player) => player.name.toLowerCase() === characterName.toLowerCase()
    );
    console.log('startd:', startedTutorial);
    if (existingCharacter && !startedTutorial.includes(message.author.id)) {
      const existingNameErrorEmbed = new EmbedBuilder()
        .setColor(0x992e22)
        .setDescription('A character with the same name already exists. Inform them?')
        .setFields(
          { name: '🇦', value: "You'll regret taking my name.", inline: false },
          { name: '🇧', value: "you're kinda fucked", inline: false },
          { name: '🇨', value: "It's fine I guess", inline: false },
          { name: '🇩', value: "Oh the name is all yours", inline: false }
        );
      return message.channel.send({ embeds: [existingNameErrorEmbed] });
    }
/*function getRandomCard() {
  const randomIndex = Math.floor(Math.random() * cards.length);
  return { ...cards[randomIndex] }; // Create a copy of the selected card to avoid modifying the original array
}*/
    function getRandomCard() {
  const cardNames = Object.keys(cards);
  const randomCardName = cardNames[Math.floor(Math.random() * cardNames.length)];
  const randomCard = cards[randomCardName];
  return { name: randomCardName, card: randomCard };
}
const randomCardData = getRandomCard();
    // Initialize the player's data with the character name
    const playerId = message.author.id;
     // Send the initial question to the user
    const firstQuestion = story.questions.find((q) => q.id === 1);
    const playerData = {
      name: characterName,
      location: locations[0],
      inventory: { active: [], backpack: [] },
      stats: { attack: 1, tactics: 0, magic: 1, training: 0, defense: 1, speed: 1, hitpoints: 10, intelligence: 1, wise: 1, luck: 1, devotion: 0, potential: 1, },
      balance: { coins: 0, gems: 0 },
      exp:{xp:0, level:0},
       cards: { name: [randomCardData.name] },
      class: null,
      race: null,
      stuff: { generatedRandomElements: false, generatedRandomElements2: false},
      playerpos: { x: 100, y: 50 },
    };
    players[playerId] = playerData;

    fs.writeFile('./data/players.json', JSON.stringify(players, null, 3), (err) => {
      if (err) console.log(err);
    });
//send the embed to ask if they want to start tutorial and if they dont want, dont send that shit.
    
    const wantTutorial = new EmbedBuilder()
        .setColor(0x992e22)
        .setDescription('Do you wish to proceed with a small tutorial? It is honestly quite unique af, just trust me.')
        .setFields(
          { name: '🇦', value: "Sus, but Sure!.", inline: false },
          { name: '🇧', value: "Eh? Okay.", inline: false },
          { name: '🇨', value: "You seem.... Stinky, I refuse to.", inline: false },
          { name: '🇩', value: "No, I'm a veteran and like to explore things myself.", inline: false }
        );
     
    const tutSelectA = new ButtonBuilder() // Add a new button for selecting
    .setCustomId('select_buttonA')
    .setLabel('🇦')
    .setStyle('Success');
    const tutSelectB = new ButtonBuilder() // Add a new button for selecting
    .setCustomId('select_buttonB')
    .setLabel('🇧')
    .setStyle('Success');
    const tutSelectC = new ButtonBuilder() // Add a new button for selecting
    .setCustomId('select_buttonC')
    .setLabel('🇨')
    .setStyle('Danger');
    const tutSelectD = new ButtonBuilder() // Add a new button for selecting
    .setCustomId('select_buttonD')
    .setLabel('🇩')
    .setStyle('Danger');
    const tutRow = new ActionRowBuilder().addComponents(tutSelectA, tutSelectB, tutSelectC, tutSelectD // Add the new "Select" button
);
    sentMessage = await message.channel.send({ embeds: [wantTutorial], components: [tutRow] });
     const filter = i => (i.customId.startsWith('select_button') || i.customId === 'select_button') && i.user.id === message.author.id;
                const collector = sentMessage.createMessageComponentCollector({ filter, time: 300000 });

                collector.on('collect', async (i) => {
                        try {
                       i.deferUpdate();    
                           if (i.customId === 'select_buttonB')  {
                             console.log('heclicked:', i.user.id);
                              console.log('id:', i.customId);
                             startedTutorial.push(i.user.id);
                                // console.log('First question:', firstQuestion);
     askQuestion(message.channel, firstQuestion);
                           } else if (i.customId === 'select_buttonA')  {
                             console.log('heclicked:', i.user.id);
                              console.log('id:', i.customId);
                             startedTutorial.push(i.user.id);
                                // console.log('First question:', firstQuestion);
     askQuestion(message.channel, firstQuestion);
                           }
                          else {
                            deniedTutorial.push(i.user.id);
                            const noTutorial = new EmbedBuilder()
        .setColor(0x992e22)
        .setDescription('Damn, thats kinda sad but ok.')
        .setFields(
          { name: '🇦', value: "Thanks!.", inline: false },
          { name: '🇧', value: "Yeah whatever.", inline: false },
          { name: '🇨', value: "Don't respond with anything.", inline: false },
          { name: '🇩', value: "Now get out im losing patience.", inline: false }
        );
   sentMessage.edit({ embeds: [noTutorial] });
                          } 
                        }catch (error) {
        console.error('An error occurred:', error);
        message.channel.send('noob ass, caused an error.');
                     }
                });
  },
};

async function askQuestion(channel, question, index) {
  const { text, answers, imageUrl } = question;
  const selectionMap = {}; // Map button selection (A, B, C, D) to next question ID

  // Create the answer buttons
  const answerButtons = answers.map((answer, index) => {
    const label = String.fromCharCode(65 + index); // Convert index to A, B, C, D labels
    const selection = label.toLowerCase();
    selectionMap[selection] = answer.outcome.nextQuestionId;
    return new ButtonBuilder()
      .setStyle('Danger')
      .setCustomId(`answer_${index + 1}`)
      .setLabel(label);
   
  });


  // Create the row with answer buttons
  const row = new ActionRowBuilder().addComponents(...answerButtons);



  // Create the answer fields for the embed
  const answerFields = answers.map((answer, index) => {
    return {
      name: `Answer ${index + 1}`,
      value: answer.text,
      inline: false,
    };
  });

  // Create the question embed
  const questionEmbed = new EmbedBuilder()
    .setColor(0x992e22)
    .setDescription(text)
    .setImage(imageUrl, { format: "png", dynamic: true, size: 1024 })
    .addFields(...answerFields);

  // Send the question embed
  const sentMessage = await channel.send({ embeds: [questionEmbed], components: [row] });

  const collector = sentMessage.createMessageComponentCollector({ idle: 60000 });

  collector.on('collect', async (interaction) => {
    await interaction.deferUpdate();
    const selectedAnswerId = parseInt(interaction.customId.split('_')[1]);
    const selectedAnswer = answers.find((answer) => answer.id === selectedAnswerId);

    if (selectedAnswer) {
      const outcome = selectedAnswer.outcome;
  
      if (outcome.nextQuestionId) {
        // If the outcome is another question, ask the next question
        const nextQuestion = story.questions.find((q) => q.id === outcome.nextQuestionId);
        askQuestion(channel, nextQuestion, index + 1);
      } else if (outcome.text) {
        // If the outcome is a result, show the final result to the user
        console.log('Outcome:', outcome);
        showResult(channel, outcome);
      }
    }
  });
}

function showResult(channel, outcome) {
  const { text } = outcome;

  const resultEmbed = new EmbedBuilder().setColor(0x992e22).setDescription(text);

  channel.send({ embeds: [resultEmbed] });
}
