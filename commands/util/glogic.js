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
async function calculateDamage(authorAttack, opponentDefense) {
  return Math.floor(
    Math.pow(
      Math.sqrt(authorAttack),
      Math.pow(Math.sqrt(3), Math.sqrt(authorAttack / opponentDefense))
    )
  );
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

module.exports = {
  getMax,
  checkResults,
  updateMovesOnCd,
  calculateAbilityDamage,
  calculateDamage,
  getCardStats,
  getCardMoves,
  getPlayerMoves,
};
