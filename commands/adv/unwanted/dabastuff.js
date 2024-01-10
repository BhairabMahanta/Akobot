const {mongoClient} = require('../../../data/mongo/mongo.js')

module.exports = {
  name: 'db',
  description: 'do dbstuff',
  aliases: ['database'],
  async execute(client, message, args) {
    const playerData = {
  _id: '537619455409127442', // Replace with the player's unique identifier
  name: 'akai',
  location: 'Krizzland',
  inventory: {
    active: [],
    backpack: [],
  },
  stats: {
            attack: 101,
            tactics: 0,
            magic: 1,
            training: 0,
            defense: 150,
            speed: 100,
            hitpoints: 1000,
            intelligence: 1,
            wise: 1,
            luck: 1,
            devotion: 0,
            potential: 1,
            hp: null,
  },
  balance: {
    coins: 0,
    gems: 0,
  },
  exp: {
    xp: 0,
    level: 0,
  },
  selectedFamiliars: {
    name: [
      'Fire Dragon',
      'Water Nymph',
      'cumpokemon',
    ],
  },
  cards: {
    name: [
      'Fire Dragon',
    ],
  },
  class: 'Knight',
  race: null,
  stuff: {
    generatedRandomElements: false,
    generatedRandomElements2: false,
  },
  playerpos: {
    x: 100,
    y: 300,
  },
  quests: [
    'monster_subjugation',
    'gather_ingredients',
    'defeat_spiders',
    'conquer_temple',
  ],
  activeQuests: {
    monster_subjugation: {
      objectives: [
        {
          id: 'goblin_defeat',
          target: 'Goblin',
          current: 0,
          required: 1,
        },
        {
          id: 'wolf_defeat',
          target: 'Wolf',
          current: 0,
          required: 2,
        },
      ],
      timeLimit: {
        totalDays: 7,
        daysLeft: 7,
      },
      questChannel: 'channelId',
    },
  },
};
    const newGatherIngredientsQuest = {
      objectives: [
        {
          id: 'new_objective_id',
          target: 'New Objective',
          current: 0,
          required: 1,
        },
      ],
      timeLimit: {
        totalDays: 7,
        daysLeft: 7,
      },
      questChannel: 'newChannelId',
    };
    
      const db = mongoClient.db('Akaimnky');
      const collection = db.collection('akaillection');
// Define the filter based on the _id
  const filter = { _id: playerData._id };

  // Use the upsert option to insert if not found or update if found
  const options = { upsert: true };
      // Log the parameters before calling updateOne()

  try {
      // Perform the updateOne operation
      const result = await collection.updateOne(filter, { $set: playerData }, options);

      if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        console.log('Player data updated/inserted:', result);
      } else {
        console.log('No changes to player data.');
      }

     
    } catch (updateErr) {
      console.error('Error updating/inserting player data:', updateErr);
    }
     try {
      // Retrieve the player's document
      const playerData2 = await collection.findOne(filter);

      // if (playerData2) {
      //   // Check if the player has the "gather_ingredients" quest
      //   if (!playerData2.activeQuests.gather_ingredients) {
      //     // Add the "gather_ingredients" quest
      //     playerData2.activeQuests.gather_ingredients = newGatherIngredientsQuest;
      //     console.log('NEWGATHER:', newGatherIngredientsQuest)
      //     console.log('Added gather_ingredients quest.');
      //   } else {
      //      playerData2.activeQuests.gather_ingredients = newGatherIngredientsQuest;
      //     // You can add your logic to update the quest here
      //     console.log('Updated gather_ingredients quest.');
      //   }

      //   // Update the player's document
      //   await collection.updateOne(filter, { $set: playerData2 });

      //   console.log('Player data updated:', playerData2);
      // } else {
      //   console.log('Player not found.');
      // }

    } catch (err) {
      console.error('Error updating/adding gather_ingredients quest:', err);
    }
       

    
  },
};
