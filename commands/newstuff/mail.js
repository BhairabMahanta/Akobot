const { mongoClient } = require("../../data/mongo/mongo.js");
const db = mongoClient.db("Akaimnky");
const collection = db.collection("akaillection");
const { playerModel } = require("../../data/mongo/playerschema.js"); // Adjust the path to match your schema file location
class mail {
  // this is used to send mail info to the database
  constructor(sendWho) {
    this.userInfo = sendWho;
    this.name = "mail";
    this.aliases = ["email"];
    this.usage = "mail";
  }
  async mailTo(client) {
    const { db } = client;
    let akaillection = "maildoc";
    const Player = await playerModel(db, akaillection);
    if (this.userInfo == "everyone") {
      //get info from database and send to every id
    } else if (this.userInfo == "activeAll") {
      //get info from database and send to every active id in the past x days
    } else if (this.userInfo.isArray) {
      //get info from database and send to every id in the array
    }
    //get info from database and send to the id
  }

  async run(client, message, args) {
    message.channel.send("This is the mail command!");
  }
}
