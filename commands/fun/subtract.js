module.exports = {
  name: 'elixir',
  description: 'Subtracts consecutive pairs of numbers, calculates the total, and provides the elixir result',
  execute(client, message, args) {
    // Combine the arguments into a single string
    const input = args.join(' ');

    // Extract the name-number pairs using regular expressions
    const subtractRegex = /(\w+)\s*-\s*(\d+)\s*-\s*(\d+)/g;
    const elixirRegex = /elixir\s*=\s*(\d+)/i;

    let match;
    const subtractResults = [];
    let subtractTotal = 0;
    let amount = null;

    // Iterate over each matched name-number pair
    while ((match = subtractRegex.exec(input)) !== null) {
      const name = match[1];
      const num1 = parseInt(match[2]);
      const num2 = parseInt(match[3]);

      // Check if both numbers are valid
      if (!isNaN(num1) && !isNaN(num2)) {
        const difference = num2 - num1;
        subtractResults.push(`${name}: ${difference}`);
        subtractTotal += difference;
      }
    }

    // Extract the amount for elixir calculation
    const elixirMatch = input.match(elixirRegex);
    if (elixirMatch) {
      amount = parseInt(elixirMatch[1]);
    }

    // Send the subtract results and total as a formatted message
    if (subtractResults.length > 0) {
      const formattedSubtractResults = subtractResults.join(', ');
      const subtractContent = `Original:\nResults: ${formattedSubtractResults}\nTotal: ${subtractTotal}`;

      let elixirContent = '';
      let totalElixir = 0;
      
      // Calculate and send the elixir result if amount is provided
      if (amount !== null && !isNaN(amount)) {
        // Calculate the factor
        let factor = 0;
        if (subtractTotal !== 0) {
          factor = amount / subtractTotal;
        }

        // Calculate the elixir result
        const elixirResult = subtractResults.map(result => {
          const [name, difference] = result.split(':');
          const multipliedValue = Math.round(parseFloat(difference) * factor);
          totalElixir += multipliedValue; // Accumulate the total elixir count
          return `${name}: ${multipliedValue}`;
        });

        // Send the elixir result as a formatted message
        elixirContent = `Elixir Result:\n${elixirResult.join('\n')}`;
      } else {
        elixirContent = 'No amount provided for elixir calculation.';
      }

      // Add the total elixir count to the elixir result message
      elixirContent += `\nTotal Elixir: ${totalElixir}`;

      // Send the combined message
      message.channel.send(`Subtraction Results:\n${subtractContent}\n\n${elixirContent}`);
    } else {
      message.channel.send('No valid name-number pairs found for subtraction.');
    }
  },
};
