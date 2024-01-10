module.exports = {
  name: 'slayslay',
  description: 'Split and send messages based on !!<>!!',
  async execute(client, message, args) {
    const id = message.author.id;
    console.log(id)
    if (message.author.id === '537619455409127442') {
      console.log('why are you gae')
    } else {
      console.log('no im gae')
    }
    // Join the arguments into a single string
    const input = args.join(' ');

    // Split the input using !!<>!! as a delimiter
    const messages = input.split('!!<>!!');

    // Send each message separately
   for (const msg of messages) {
      if (msg.trim() !== '') {
        // Send each non-empty message as a new message with a 1-second delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        message.channel.send(msg.trim());
      }
    }
  },
};
