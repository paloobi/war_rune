import { cardRanks, type Card, type CardRank, cardSuits, CardSuit } from "./types/card";
import { GameStage, GameState } from "./types/game";
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

export const getTwoRandomCardsFromDeck = (deck: Card[]) => {
  const cardOne = deck[Math.floor(Math.random() * deck.length)];
  const deckWithoutCardOne = deck.filter(card => card !== cardOne)
  const cardTwo = deckWithoutCardOne[Math.floor(Math.random() * deckWithoutCardOne.length)];

  return [cardOne, cardTwo];
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

export function isCurrentWinner(player: Player, game: GameState) {
  if (game.stage === GameStage.Score && game.players.one.selectedCard && game.players.two.selectedCard) {
    const playerOneScore = getCardValueFromRank(game.players.one.selectedCard.rank);
    const playerTwoScore = getCardValueFromRank(game.players.two.selectedCard.rank);
    if (playerOneScore === playerTwoScore) {
      return false;
    }
    const winner = playerOneScore > playerTwoScore ? game.players.one : game.players.two;
    return player === winner;
  }

  if (game.stage === GameStage.WarScore && game.players.one.war.hero && game.players.two.war.hero) {
    const playerOneScore = getCardValueFromRank(game.players.one.war.hero.rank);
    const playerTwoScore = getCardValueFromRank(game.players.two.war.hero.rank);
    if (playerOneScore === playerTwoScore) {
      return false;
    }
    const winner = playerOneScore > playerTwoScore ? game.players.one : game.players.two;
    return player === winner;
  }

  return false;
}