

const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, } = require('discord.js');
    const questions = require('./questions');

module.exports = {
  name: 'trivia',
  description: 'Starts a trivia game with pre-made questions',
  aliases: ['scramble', 'quiz'],
  async execute(client, message, args) {



    // Filter questions based on difficulty
    const difficultyFilter = args.find(arg => arg.startsWith('d:'));
    let filteredQuestions = questions;
    if (difficultyFilter) {
      const difficulty = difficultyFilter.substring(2);
      filteredQuestions = questions.filter(question => question.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Shuffle the array of questions
    const shuffledQuestions = shuffle(filteredQuestions);
    let sendResults = false;

    let roundCount = 1;
     let totalPoints = 0;
    let triviaIndex = 0;

    const rounds = args.find(arg => arg.startsWith('n:'));
    const numRounds = rounds ? parseInt(rounds.substring(2)) : 1;

    let collectorMessage = ''; // Declare collectorMessage variable
    let answeredUsers = [];
    let losers = [];
    let clickData = [];

    try {
      let sentMessage = await sendTriviaEmbed(message, shuffledQuestions[triviaIndex], roundCount);
      collectorMessage = sentMessage; // Update collectorMessage with the sentMessage

      console.log('Sent message ID:', sentMessage.id);

      const collector = collectorMessage.createMessageComponentCollector({ idle: 30000 });

      collector.on('collect', async (i) => {
        console.log('Collector event - Button clicked:', i.customId);
       // console.log('Collector message ID:', collectorMessage.id);

        if (!answeredUsers.includes(i.user.id)) {
          console.log(`${i.user.username} answered ${i.customId}.`);
          const questionObj = shuffledQuestions[triviaIndex];
          const answerIndex = ['one', 'two', 'three', 'four'].indexOf(i.customId);
          const selectedAnswer = questionObj.answers[answerIndex];
          if (selectedAnswer === questionObj.correctAnswer) {
            i.reply({ content: `You answered ${selectedAnswer}, and it is correct!`, ephemeral: true });
            answeredUsers.push(i.user.id);
            clickData.push({ user: i.user.username, answer: selectedAnswer, timestamp: i.createdTimestamp });
          } else {
            answeredUsers.push(i.user.id);
            losers.push({ loser: i.user.username, answer: selectedAnswer, timestamp: i.createdTimestamp});
            i.reply({ content: `You are wrong noob, get good.`, ephemeral: true });
          }

          clickData.sort((a, b) => a.timestamp - b.timestamp);
           losers.sort((a, b) => a.timestamp - b.timestamp);
        } else {
          console.log(`This user has already answered.`);
          i.reply({ content: `You have already answered this question.`, ephemeral: true });
        }
      });

      let interval;
      if (numRounds > 1) {
        interval = setInterval(async () => {
          triviaIndex++;
          if (triviaIndex >= shuffledQuestions.length) {
            triviaIndex = 0;
          }
            
          answeredUsers = [];
console.log('Collector message ID (before):', collector.messageId)
         
         sentMessage = await sendTriviaEmbed(message, shuffledQuestions[triviaIndex], roundCount, numRounds);
        // if(!sentMessage) collector.stop()

 if (sentMessage === null) {
  clearInterval(interval);
  sendResults = true;
   collector.stop();
  return;
}
collector.messageId = sentMessage.id;
await collectorMessage.delete();

console.log('Sent message ID:', sentMessage.id);
          
collectorMessage = sentMessage;
        //  roundCount++;
          
console.log('Collector message ID (after):', collector.messageId);


          sendClickDataMessage(message, clickData, roundCount-1, losers);
          losers =  [];
          clickData = [];
          roundCount++;
        }, 14900);

      roundCount++;
        
      } 
        collector.on('end', () => {
          if (sendResults) {
    sendClickDataMessage(message, clickData, roundCount-1, losers);
          }
        });
      
    } catch (error) {
      console.error('An error occurred:', error);
      message.channel.send('An error occurred while running the trivia game.')
        .catch(error => console.error('Failed to send message:', error));
    }
  },
};



async function sendClickDataMessage(message, clickData, roundCount, losers) {
  const embedFields = clickData.map((click, index) => {
    const points = calculatePoints(click.timestamp);
 //  console.log('points:', points, 'total:', totalPoints)
    //  totalPoints = totalPoints + points
    const timeTaken = calculateTimeTaken(click.timestamp);
    return {
      name: `${index + 1}. ${click.user}`,
      value: `Answered in ${timeTaken.toFixed(2)} seconds. Points: ${points}`,
      inline: false,
    }
      
  });
  const embedFailFields = losers.map((click, index) => {
        const timeTaken = calculateTimeTaken(click.timestamp);
    return {
      name: `Failures: ${click.loser}`,
      value: `Answered in ${timeTaken.toFixed(2)} seconds, but was stupid.`,
        inline: false
    }
  });


  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Trivia Game - Round No: ${roundCount} - Results`)
    .setDescription('Data for the previous round:')
    .addFields(...embedFields, ...embedFailFields);

  try {
    await message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send click data message:', error);
  }
}



async function sendTriviaEmbed(message, questionObj, roundCount, numRounds) {

   if (roundCount > numRounds) {
    return null; // Return null if roundCount exceeds the desired number of rounds
  }
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Trivia Game - Round No: ${roundCount}`)
    .setDescription(questionObj.question)
    .setImage(questionObj.imageUrl, { format: "png", dynamic: true, size: 1024 })
 // Add the image URL to the embed
    .addFields(
      { name: '🇦', value: questionObj.answers[0], inline: false },
      { name: '🇧', value: questionObj.answers[1], inline: false },
      { name: '🇨', value: questionObj.answers[2], inline: false },
      { name: '🇩', value: questionObj.answers[3], inline: false     }
    );

  const one = new ButtonBuilder()
    .setStyle('Danger')
    .setCustomId('one')
    .setLabel('🇦');
  const two = new ButtonBuilder()
    .setStyle('Danger')
    .setCustomId('two')
    .setLabel('🇧');
  const three = new ButtonBuilder()
    .setStyle('Danger')
    .setCustomId('three')
    .setLabel('🇨');
  const four = new ButtonBuilder()
    .setStyle('Danger')
    .setCustomId('four')
    .setLabel('🇩');

  const row = new ActionRowBuilder()
    .addComponents(one, two, three, four);

  const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

  return sentMessage;

}



/*
function sendClickDataMessage(message, clickData, round) {
  let clickDataMessage = '';

  if (clickData.length === 0) {
    clickDataMessage = "Oops! It seems everyone here is quite slow. Skill issues.";
  } else {
    clickDataMessage = clickData
      .map((click, index) => {
        const points = calculatePoints(click.timestamp);
        const timeTaken = calculateTimeTaken(click.timestamp);
        return `${index + 1}. ${click.user} answered in ${timeTaken.toFixed(2)} seconds. Points: ${points}`;
      })
      .join('\n');
  }

  message.channel.send(`Round No: ${round}, Fastest Players:\n${clickDataMessage}`);
}

*/



function calculatePoints(timestamp) {
  const timeTaken = calculateTimeTaken(timestamp);
  const maxPoints = 50;

  if (isNaN(timeTaken) || timeTaken <= 0) {
    return 0;
  }

  const points = maxPoints * (1 / (timeTaken / 2));
  return Math.round(points);
}

function calculateTimeTaken(timestamp) {
  if (isNaN(timestamp) || timestamp <= 0) {
    return 0.001;
  }

  const currentTime = new Date().getTime();
  const timeTaken = 15 - (currentTime - timestamp) / 1000;
  return Math.max(.87, timeTaken);
}


function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}
