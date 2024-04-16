const { Mail } = require("./mail.js"); // Adjust the path as needed

module.exports = {
  name: "sendmail",
  aliases: ["sml", "sm"],
  description: "Send mail to the maildoc collection",
  async execute(client, message, args) {
    // Extract necessary information from the message and arguments
    const playerId = message.author.id;
    const mailName = args[0]; // Assuming the mail name is provided as the first argument
    const mailText = args.slice(1).join(" "); // Join the remaining arguments as mail text

    // Capture the start time
    const startTime = Date.now();

    // Instantiate the Mail class
    const mailInstance = new Mail(playerId, mailName, mailText);

    // Capture the time after instantiating the Mail class
    const instanceTime = Date.now();

    // Call the mailTo method to send the mail
    try {
      await mailInstance.mailTo(client, "everyone", false, 0, false, {
        coins: 0,
        gems: 0,
        xp: 0,
      });
      message.channel.send("Mail sent successfully!");

      // Capture the time after sending the mail
      const endTime = Date.now();

      // Calculate the durations
      const instantiationDuration = instanceTime - startTime;
      const executionDuration = endTime - instanceTime;

      console.log(
        "Mail class instantiation duration:",
        instantiationDuration,
        "ms"
      );
      console.log("Mail execution duration:", executionDuration, "ms");
    } catch (error) {
      console.error("Error sending mail:", error);
      message.channel.send("An error occurred while sending mail.");
    }
  },
};
