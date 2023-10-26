import type { RuneClient } from "rune-games-sdk/multiplayer"
import type { GameState } from "./game/types/game";
import { GameStage } from "./game/types/game";
import { Card, CardRank, CardSuit, cardRanks, cardSuits } from "./game/types/card";
import { buildDeck, getCardValueFromRank, shuffle } from "./game/utils";
import { Player } from "./game/types/player";
import { PlayerClass } from "./game/types/class";

type GameActions = {
  setStage: (params: { stage: GameStage }) => void
  dealCards: () => void,
  selectClass: (playerClass: PlayerClass) => void,
  drawCards: () => void,
  selectCard: (params: { playerId: "one" | "two", card: Card, cardIndex: number }) => void,
  scoreCards: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const getInitialState = (allPlayerIds: string[]): GameState => {
  return {
    stage: GameStage.ClassSelect,
    players: {
      one: {
        playerId: allPlayerIds[0],
        playerNum: 1,
        selectedClass: null,
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
        playerId: allPlayerIds[1],
        playerNum: 2,
        selectedClass: null,
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
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds): GameState => {
    return getInitialState(allPlayerIds);
  },
  actions: {
    setStage: ({ stage }, { game }) => {
      game.stage = stage;
    },

    selectClass: (playerClass, {playerId, game}) => {
      if (game.stage !== GameStage.ClassSelect) {
        throw Rune.invalidAction();
      }

      if (game.players.one.playerId === playerId) {
          game.players.one.selectedClass = playerClass;
        } else if (game.players.two.playerId === playerId) {
          game.players.two.selectedClass = playerClass
        } else {
          throw Rune.invalidAction()
        }

      if (game.players.one.selectedClass && game.players.two.selectedClass){
        game.stage = GameStage.Start;
      }
        
    },

    dealCards: (_, {game}) => {
      if (game.stage !== GameStage.Deal) {
        throw Rune.invalidAction();
      }

      const deck = buildDeck();
      
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

      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      const playerOneCard = game.stage === GameStage.WarScore
        ? playerOne.war.hero
        : playerOne.selectedCard;
      
      const playerTwoCard = game.stage === GameStage.WarScore
        ? playerTwo.war.hero
        : playerTwo.selectedCard;

      if (!playerOneCard || !playerTwoCard) {
        throw new Error("Both players must have a selected card");
      }
      const playerOneValue = getCardValueFromRank(playerOneCard.rank);
      const playerTwoValue = getCardValueFromRank(playerTwoCard.rank);

      let winner: 'one' | 'two' | null = null;
      if (playerOneValue > playerTwoValue) {
        // player 1 wins...
        winner = 'one';
        playerOne.wins++;
        // ...and they are a cleric
        if (playerOne.selectedClass === "cleric") {
          game.stage = GameStage.ClericDecide;
        }
        // player 2 loses HP
        playerTwo.hp -= playerOneValue - playerTwoValue;
        game.stage = GameStage.Discard;
      } else if (playerOneValue < playerTwoValue) {
        // player 2 wins... 
        winner = 'two';
        playerTwo.wins++;
        // ...and they are a cleric
        if (playerTwo.selectedClass === "cleric") {
          game.stage = GameStage.ClericDecide;
        }
       // player 1 loses HP
        playerOne.hp -= playerTwoValue - playerOneValue;
        game.stage = GameStage.Discard;
      } else {
        // begin war
        // TODO: handle logic for this
        game.stage = GameStage.WarSelect;
      }

      if (game.stage === GameStage.Discard && winner) {
        game.players[winner].deck.push(playerOneCard, playerTwoCard);

        if (playerOne.war.hero && playerTwo.war.hero) {
          // in a tie, all the cards go to the winner
          game.players[winner].deck.push(
            playerOne.war.hero,
            playerTwo.war.hero,
            ...playerOne.war.sacrifices,
            ...playerTwo.war.sacrifices
          );
          playerOne.war = {
            hero: null,
            sacrifices: [],
          };
          playerTwo.war = {
            hero: null,
            sacrifices: [],
          }
        }
        // reset selected cards to null
        playerOne.selectedCard = null;
        playerTwo.selectedCard = null;
        game.stage = GameStage.Draw;
      }
    },
  },
})
