import type { RuneClient } from "rune-games-sdk/multiplayer"
import type { GameState } from "./game/types/game";
import { GameStage } from "./game/types/game";
import { Card, CardRank, CardSuit, cardRanks, cardSuits } from "./game/types/card";
import { getCardValueFromRank, shuffle } from "./game/utils";
import { Player } from "./game/types/player";

type GameActions = {
  setStage: (params: { stage: GameStage }) => void
  dealCards: () => void,
  drawCards: () => void,
  selectCard: (params: { playerId: "one" | "two", card: Card, cardIndex: number }) => void,
  scoreCards: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const getInitialState = (): GameState => {
  return {
    stage: GameStage.Start,
    players: {
      one: {
        playerNum: 1,
        deck: [],
        hand: [null, null, null, null],
        war: {
          sacrifices: [],
          hero: null
        },
        selectedCard: null,
        hp: 10,
        wins: 0,
      },
      two: {
        playerNum: 2,
        deck: [],
        hand: [null, null, null, null],
        selectedCard: null,
        war: {
          sacrifices: [],
          hero: null
        },
        hp: 10,
        wins: 0,
      },
    },
  }
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  setup: (): GameState => {
    return getInitialState();
  },
  actions: {
    setStage: ({ stage }, { game }) => {
      game.stage = stage;
    },

    dealCards: (_, {game}) => {
      if (game.stage !== GameStage.Deal) {
        throw Rune.invalidAction();
      }

      // build the deck
      const deck: Card[] = [];
      cardRanks.forEach((rank: CardRank): void => {
        cardSuits.forEach((suit: CardSuit): void => {
          deck.push({ rank, suit });
        });
      });

      shuffle(deck);
      // deal the deck between the two player decks
      deck.forEach((card, index) => {
        if (index % 2 === 0) {
          game.players.one.deck.push(card);
        } else {
          game.players.two.deck.push(card);
        }
      });

      game.stage = GameStage.Draw;
    },

    drawCards: (_, {game}) => {
      if (game.stage !== GameStage.Draw) {
        console.log(`Skipping draw for now, it's ${game.stage} stage`);
        return;
      }
      const playerOne = game.players.one;
      const playerOneHand = playerOne.hand;
      for (let i = 0; i < playerOneHand.length; i++) {
        if (!playerOneHand[i]) {
          const cardToDraw = playerOne.deck.shift();
          if (cardToDraw) {
            // TODO: draw a card randomly
            playerOneHand[i] = cardToDraw;
          } else {
            // TODO: figure out if this is a game over condition?
            throw new Error("No cards left in deck");
          }
        }
      }

      const playerTwo = game.players.two;
      const playerTwoHand = playerTwo.hand;
      for (let i = 0; i < playerTwoHand.length; i++) {
        if (!playerTwoHand[i]) {
          const cardToDraw = playerTwo.deck.shift();
          if (cardToDraw) {
            // TODO: draw a card randomly
            playerTwoHand[i] = cardToDraw;
          } else {
            // TODO: figure out if this is a game over condition?
            throw new Error("No cards left in deck");
          }
        }
      }
      game.stage = GameStage.Select;
    },

    selectCard: (
      {playerId, card, cardIndex},
      {game}
    ) => {
      const player = game.players[playerId];
      
      if (game.stage !== GameStage.WarSelect) {
        if (!player.selectedCard) {
          player.selectedCard = card;
          console.log(player.hand, cardIndex);
          player.hand[cardIndex] = null;
        }
        // if both players have selected cards
        if (
          Object.values(game.players).every(
            (player: Player) => !!player.selectedCard
          )
        ) {
          game.stage = GameStage.Score;
        }
      } else {
        if (player.war.sacrifices.length < 2) {
          player.war.sacrifices.push(card);
        } else if (!player.war.hero) {
          player.war.hero = card;
        } else {
          throw new Error('The tie-breaker already ended');
        }
        // remove card from hand
        player.hand[cardIndex] = null;
        
        if (game.players.one.war.hero && game.players.two.war.hero) {
          game.stage = GameStage.WarScore;
        }
      }
    },

    scoreCards: (_, {game}) => {
      if (game.stage !== GameStage.Score && game.stage !== GameStage.WarScore) {
        console.log("skipping scoring for now, the stage isn't Score or WarScore yet")
        console.log("STAGE: ", game.stage);
        return;
      }
      const playerOneCard = game.stage === GameStage.WarScore
        ? game.players.one.war.hero
        : game.players.one.selectedCard;
      
      const playerTwoCard = game.stage === GameStage.WarScore
        ? game.players.two.war.hero
        : game.players.two.selectedCard;

      if (!playerOneCard || !playerTwoCard) {
        throw new Error("Both players must have a selected card");
      }
      const playerOneValue = getCardValueFromRank(playerOneCard.rank);
      const playerTwoValue = getCardValueFromRank(playerTwoCard.rank);

      let winner: 'one' | 'two' | null = null;
      if (playerOneValue > playerTwoValue) {
        // player 1 wins, player 2 loses HP
        winner = 'one';
        game.players.one.wins++;
        game.players.two.hp -= playerOneValue - playerTwoValue;
        game.stage = GameStage.Discard;
      } else if (playerOneValue < playerTwoValue) {
        // player 2 wins, player 1 loses HP
        winner = 'two';
        game.players.two.wins++;
        game.players.one.hp -= playerTwoValue - playerOneValue;
        game.stage = GameStage.Discard;
      } else {
        // begin war
        // TODO: handle logic for this
        game.stage = GameStage.WarSelect;
      }

      if (game.stage === GameStage.Discard && winner) {
        game.players[winner].deck.push(playerOneCard, playerTwoCard);

        if (game.players.one.war.hero && game.players.two.war.hero) {
          // in a tie, all the cards go to the winner
          game.players[winner].deck.push(
            game.players.one.war.hero,
            game.players.two.war.hero,
            ...game.players.one.war.sacrifices,
            ...game.players.two.war.sacrifices
          );
          game.players.one.war = {
            hero: null,
            sacrifices: [],
          };
          game.players.two.war = {
            hero: null,
            sacrifices: [],
          }
        }
        // reset selected cards to null
        game.players.one.selectedCard = null;
        game.players.two.selectedCard = null;
        game.stage = GameStage.Draw;
      }
    },
  },
})
