const fs = require('fs');
const path = require('path');
const file = require('./questions.json')
module.exports = {
  name: 'aq',
  description:'something',
  async execute  (client, message, args) {
    
    if (args.length < 5) {
      console.log('gae');
      return message.channel.send('Invalid command format. Please provide the question, answers, correct answer, and difficulty, URL separated by "|".');
    }
    if (args.length > 4) {
        args = args.join(' ').trim().match(/[^|]+\|?/g).map(item => item.trim().replace('|', ''));

    }
  
    message.channel.send("this actually works, you dumb");
    try {
      const question = args[0].trim();
      const answers = args[1].trim().split(',');
      const correctAnswer = args[2].trim();
      const difficulty = args[3].trim();
       const imageUrl = args[4].trim();
//try{
      const file = fs.readFileSync('./commands/fun/questions.json');
      
   //   } catch (error) {
    //console.error(error);
     // }
      const data = JSON.parse(file);

      const newQuestion = {
        difficulty: difficulty,
        
        question: question,
        
        answers: answers,
        
        correctAnswer: correctAnswer,
        
        imageUrl: imageUrl
      };
      console.log(question, answers, correctAnswer, difficulty);

      data.push(newQuestion);

   fs.writeFileSync('./commands/fun/questions.json', JSON.stringify(data), 2);

      message.channel.send('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      message.channel.send('An error occurred while adding the question. Please try again later.');
    }
  }
}

