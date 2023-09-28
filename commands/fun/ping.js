module.exports = {
  name: 'ping',
  description: 'Check the bot\'s latency',
  execute(client, message, args) {
  const latency = Date.now() - message.createdTimestamp;
    message.channel.send(`Pong! Latency: ${latency}ms`);
  }
};
