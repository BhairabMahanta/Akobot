// location.js
class Location {
  constructor(name, description, quests, bosses, mobs, difficulty, layout, requiredLevel) {
    this.name = name;
    this.description = description;
    this.quests = quests;
    this.bosses = bosses;
    this.mobs = mobs;
    this.difficulty = difficulty;
    this.layout = layout; // The layout of the location
    this.requiredLevel = requiredLevel;
  }
}
// floor.js
class Floor {
  constructor(name, locations) {
    this.name = name;
    this.locations = locations;
  }
}
const locationLayout = {
  grid: [
    ['W', 'W', 'W', 'W', 'W'],
    ['W', ' ', ' ', ' ', 'W'],
    ['W', 'E', 'P', ' ', 'W'],
    ['W', ' ', ' ', ' ', 'W'],
    ['W', 'W', 'W', 'W', 'W']
  ],
  navigationPoints: {
    'E': { x: 1, y: 2 }, // Entrance
    'P': { x: 2, y: 2 }  // Point of interest
    // Add more navigation points as needed
  }
};

const locationsFloor1 = [
  new Location('Forest Clearing', 'A peaceful clearing in the forest.', ['Gather Ingredients'], ['Dragon Lord', 'Giant Spider'], ['Slimes'], 'Easy', locationLayout, 1),
  new Location('Cave Entrance', 'A mysterious cave entrance beckons you.', ['Defeat the Spiders'], ['Giant Spider'], ['y'], 'Moderate', locationLayout, 1),
  // ... Add more locations for the first floor
];

// Create the first floor
const floor1 = new Floor('Floor 1', locationsFloor1);


// Create locations for the second floor
const locationsFloor2 = [
  new Location('Desert Oasis', 'A refreshing oasis in the midst of a desert.', [], [], [], 'Moderate', locationLayout, 1),
  new Location('Ruined Temple', 'The remains of an ancient temple.', ['Conquer the tenple'], ['Dragon Lord', 'Giant Spider'], ['Slimes'], 'Difficult', locationLayout, 1),
  // ... Add more locations for the second floor
];
// Create the second floor
const floor2 = new Floor('Floor 2', locationsFloor2);

// Create an array of all the floors
const allFloors = [floor1, floor2];


module.exports = {Location, Floor, floor1, floor2, allFloors};
