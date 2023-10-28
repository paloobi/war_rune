import { cardRanks, type Card, type CardRank, cardSuits, CardSuit } from "./types/card";
import { Player } from "./types/player";

export const ACTION_DELAY = 1000;

export const getCardValueFromRank = (rank: CardRank): number => {
  switch (rank) {
      case 'J':
          return 11;
      case 'Q':
          return 12;
      case 'K':
          return 13;
      case 'A':
          return 14;
      default:
          return Number(rank);
  }
}

// This uses the Fisher–Yates Shuffle algorithm to shuffle in place
// More info: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle

// Helpful visualization: https://bost.ocks.org/mike/shuffle/
export function shuffle(array: Card[]) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function buildDeck() {
  // build the deck
  const deck: Card[] = [];
  cardRanks.forEach((rank: CardRank): void => {
    cardSuits.forEach((suit: CardSuit): void => {
      deck.push({ rank, suit, isHidden: true });
    });
  });

  shuffle(deck);
  
  return deck;
}

export function drawHand(player: Player) {
  const {hand} = player;
  for (let i = 0; i < hand.length; i++) {
      if (!hand[i]) {
      const cardToDraw = player.deck.shift();
      if (cardToDraw) {
        hand[i] = cardToDraw;
        cardToDraw.isHidden = false;
      }
    }
  }

  // Return boolean that is true if player's deck is empty
    return player.deck.length === 0;
}