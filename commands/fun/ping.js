module.exports = {
  name: 'ping',
  description: 'Check the bot\'s latency',
  execute(client, message, args) {

    function coinThingy (coins, amount) {
  const dp = new Array(amount + 1).fill(0);
      dp[0]= 1;

  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin];
    }
  }
  return dp[amount];
}
    const coins = [1, 2, 3, 4, 5];
const amount = 10;
var change = coinThingy(coins, amount);
console.log(`no. of stuff: ${change}`);
    message.channel.send(`Pong! thechange: ${change}`);
  
    
    const latency = Date.now() - message.createdTimestamp;
    message.channel.send(`Pong! Latency: ${latency}ms`);
  }
};
