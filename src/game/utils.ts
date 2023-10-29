import { cardRanks, type Card, type CardRank, cardSuits, CardSuit } from "./types/card";

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
      if (suit === 'joker' || rank === 'red' || rank === 'black') {
        return;
      }
      deck.push({ rank, suit, isHidden: false });
    });
  });
  
  deck.push(
    {suit: 'joker', rank: 'red', isHidden: false},
    {suit: 'joker', rank: 'black', isHidden: false}
  );

  shuffle(deck);
  
  return deck;
}