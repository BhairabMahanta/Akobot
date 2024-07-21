// gameLogic.js
const {
  CommandInteraction,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const { cards } = require("../adv/information/cards.js"); // Import the cards data from 'cards.js'
const abilities = require("../../data/abilities.js");

const { BuffDebuffLogic } = require("../adv/action/buffdebufflogic.js");
const buffDebuffLogic = new BuffDebuffLogic(this);
// Function to get the index of the maximum value among three
function getMax(a, b, c) {
  if (a >= b && a >= c) {
    return 1;
  } else if (b >= a && b >= c) {
    return 2;
  } else {
    return 3;
  }
}
// Define base stats
const baseAttack = 50;
const baseDefense = 50;

// Function to calculate damage
function calculateDamage(authorAttack, opponentDefense) {
  return Math.floor(
    Math.pow(
      Math.sqrt(authorAttack),
      Math.pow(
        Math.sqrt(3),
        Math.sqrt((850 + authorAttack) / (450 + 1.26 * opponentDefense))
      )
    )
  );
}
// runCalcDamageTest();
// Loop for incrementing attack
function runCalcDamageTest() {
  console.log("Incrementing Attack by 50:");
  for (let i = 1; i <= 90; i++) {
    const newAttack = baseAttack + i * 50;
    const newBaseDefense = 150;
    const damage = calculateDamage(newAttack, newBaseDefense);
    console.log(`New Attack: ${newAttack}, Damage: ${damage}`);
  }
  console.log("\nIncrementing Attack by 50 and Defense by 20:");
  for (let i = 1; i <= 90; i++) {
    const newAttack = baseAttack + i * 50;
    const newDefense = baseDefense + i * 23;
    const damage = calculateDamage(newAttack, newDefense);
    console.log(
      `New Attack: ${newAttack}, New Defense: ${newDefense}, Damage: ${damage}`
    );
  }
}
function calculateAbilityDamage(abilityPower) {
  return Math.floor(abilityPower);
}

// Function to check the results of the duel
function checkResults(myhp, ohp) {
  // Check if all body parts of the user have HP <= 0
  const userLost = [myhp].every((hp) => hp <= 0);

  // Check if all body parts of the opponent have HP <= 0
  const opponentLost = [ohp].every((hp) => hp <= 0);

  if (userLost && opponentLost) {
    // Both user and opponent lose (draw)
    return 3;
  } else if (userLost) {
    // User loses
    return 2;
  } else if (opponentLost) {
    // Opponent loses
    return 1;
  } else {
    // Duel continues
    return 0;
  }
}
function getCardStats(cardName) {
  const card = cards[cardName];
  // console.log('cardname:', cardName);

  if (card && card.stats) {
    return card.stats;
  }
  return null; // Return null if the card is not found in the 'cards' data
}
// Function to get the moves of a specific card
function getCardMoves(cardName) {
  const card = cards[cardName];
  if (card && card.moves) {
    // Check for cooldown status and handle it accordingly
    card.moves.forEach((move) => {
      if (!move.onCd || move.onCd <= 0) {
        move.onCd = 0; // Set cooldown to 0 if it's not already set or expired
      } else {
        move.onCd -= 10000; // Decrease the cooldown by 10000 milliseconds (10 seconds) during each iteration
      }
    });
    return card.moves;
  }
  return null; // Return null if the card is not found in the 'cards' data
}
function getPlayerMoves(cardName) {
  const card = abilities[cardName];
  if (card && card.description) {
    // Check for cooldown status and handle it accordingly
    return card;
  } else {
    return null; // Return null if the card is not found in the 'cards' data
  }
}

// Function to update the cooldown of moves
function updateMovesOnCd(moves) {
  moves.forEach((move) => {
    if (move.onCd !== 0) {
      move.onCd--;
    }
  });
  return moves;
}
async function handleTurnEffects(turnEnder) {
  // Handle debuffs
  for (let i = turnEnder.statuses.debuffs.length - 1; i >= 0; i--) {
    turnEnder.statuses.debuffs[i].remainingTurns--;
    if (turnEnder.statuses.debuffs[i].remainingTurns <= 0) {
      buffDebuffLogic.overLogic(
        turnEnder,
        turnEnder.statuses.buffs[i],
        i,
        true
      );

      console.log(`Debuff removed from ${turnEnder.name}`);
    }
  }

  // Handle buffs
  for (let i = turnEnder.statuses.buffs.length - 1; i >= 0; i--) {
    turnEnder.statuses.buffs[i].remainingTurns--;
    console.log(`turn buff stuff ${turnEnder.statuses.buffs}`);
    if (turnEnder.statuses.buffs[i].remainingTurns <= 0) {
      buffDebuffLogic.overLogic(
        turnEnder,
        turnEnder.statuses.buffs[i],
        i,
        false
      );

      console.log(`Buff removed from ${turnEnder.name}`);
    }
  }
}

async function toCamelCase(str) {
  const words = str.split(" ");
  if (words.length === 1) {
    return words[0].toLowerCase();
  }
  if (words.length === 2) {
    return words[0].toLowerCase() + words[1];
  }
  return str
    .replace(/\s(.)/g, function (match, group1) {
      console.log("group1:", group1);
      console.log("match:", match);
      return group1.toUpperCase();
    })
    .replace(/\s/g, ""); // Remove any remaining spaces
} // move

async function generateAttackBarEmoji(atkBar) {
  try {
    const emoji = "■";
    let emptyBars = 0;
    if (atkBar >= 100) {
      atkBar = 100;
    }
    const filledBars = Math.floor(atkBar / 10);
    emptyBars = Math.floor(10 - filledBars);

    const attackBarString = `${emoji.repeat(filledBars)}${" ".repeat(
      emptyBars
    )}`;
    return `[${attackBarString}]`;
  } catch (error) {
    console.log("errorHere:", error);
  }
}

async function generateHPBarEmoji(currentHP, maxHP) {
  const emoji = "■";
  let filledBars;
  filledBars = Math.floor((currentHP / maxHP) * 17);
  if (currentHP < 0) {
    filledBars = 0;
  }
  const emptyBars = Math.floor(17 - filledBars);

  let hpBarString = emoji.repeat(filledBars);
  if (emptyBars > 0) {
    hpBarString += " ".repeat(emptyBars);
  }

  return `[${hpBarString}]`;
}

module.exports = {
  getMax,
  checkResults,
  updateMovesOnCd,
  calculateAbilityDamage,
  calculateDamage,
  getCardStats,
  getCardMoves,
  getPlayerMoves,
  handleTurnEffects,
  toCamelCase,
  generateHPBarEmoji,
  generateAttackBarEmoji,
};
