const { mongoClient } = require("../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const { playerModel } = require("../../data/mongo/mailschema.js");

class Mail {
  constructor(sendWho, mailName, mailText) {
    this.userInfo = sendWho;
    this.mailName = mailName;
    this.mailText = mailText;
  }

  async mailTo(client, mailTo, achievement, deleteAfter, autoClaim, rewards) {
    const { db } = client;
    const akaillection = "maildoc";
    const Player = await playerModel(db, akaillection);
    const mailData = new Player({
      _id: "mail" + Math.floor(Math.random() * 1000000),
      name: this.mailName,
      mailText: this.mailText, // Include mail text
      mailTrigger: "will do later",
      mailTo: mailTo,
      mailClaimed: false,
      numberClaimed: 0, // Assuming you want to start with 0
      achievement: achievement,
      deleteAfter: deleteAfter,
      autoClaim: autoClaim,
      rewards: rewards,
    });

    await mailData.save();
    console.log("Saved mail data");
  }
}

module.exports = { Mail };
