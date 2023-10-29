import type { RuneClient } from "rune-games-sdk/multiplayer"
import type { GameState } from "./game/types/game";
import { GameStage } from "./game/types/game";
import { Card } from "./game/types/card";
import { buildDeck, getCardValueFromRank, shuffle } from "./game/utils";
import { Player } from "./game/types/player";

type GameActions = {
  setStage: (params: { stage: GameStage }) => void
  dealCards: () => void,
  joker: () => void,
  drawCards: () => void,
  selectCard: (params: { playerId: "one" | "two", card: Card, cardIndex: number }) => void,
  revealCards: () => void,
  scoreCards: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

const getInitialState = (allPlayerIds: string[]): GameState => {
  return {
    stage: GameStage.Start,
    players: {
      one: {
        playerId: allPlayerIds[0],
        playerNum: 1,
        deck: [],
        hand: [null, null, null, null],
        war: {
          sacrifices: [],
          hero: null
        },
        selectedCard: null,
        hp: 50,
        wins: 0,
      },
      two: {
        playerId: allPlayerIds[1],
        playerNum: 2,
        deck: [],
        hand: [null, null, null, null],
        selectedCard: null,
        war: {
          sacrifices: [],
          hero: null
        },
        hp: 50,
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
      console.log("Hello I am the Draw stage");
      const playerOne = game.players.one;
      const playerOneHand = playerOne.hand;
      for (let i = 0; i < playerOneHand.length; i++) {
          if (!playerOneHand[i]) {
            const cardToDraw = playerOne.deck.shift();
            if (cardToDraw) {
              playerOneHand[i] = cardToDraw;
              cardToDraw.isHidden = false;
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
            playerTwoHand[i] = cardToDraw;
            cardToDraw.isHidden = false;
          } else {
            // TODO: figure out if this is a game over condition?
            throw new Error("No cards left in deck");
          }
        }
      }

      game.stage = GameStage.Select;
    },

    joker: (_, {game}) => {
      if (game.stage !== GameStage.Joker) {
        console.log("Not the joker stage, skipping joker action");
        return;
      }
      console.log("performing joker action");

      // put each players hand and selected card into their deck
      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      for (let i = 0; i < playerOne.hand.length; i++) {
        const card = playerOne.hand[i];
        if (card) {
          // push card into other players deck
          playerTwo.deck.push(card)
        
          // remove card from players hand
          playerOne.hand[i] = null;
        }
      }
      const playerOneCard = playerOne.selectedCard ? playerOne.selectedCard : null;
      if (playerOneCard) playerTwo.deck.push(playerOneCard)
      playerOne.selectedCard = null;

      for (let i = 0; i < playerTwo.hand.length; i++) {
        const card = playerTwo.hand[i];
        if (card) {
          // push card into other players deck
          playerOne.deck.push(card)
          // remove card from players hand
          playerTwo.hand[i] = null;
        }
      }
      const playerTwoCard = playerTwo.selectedCard ? playerTwo.selectedCard : null;
      if (playerTwoCard) playerOne.deck.push(playerTwoCard)
      playerTwo.selectedCard = null;

      // shuffle each players deck
      console.log("shuffling the deck");
      shuffle(playerOne.deck)
      shuffle(playerTwo.deck)
      // move to draw phase
      game.stage = GameStage.Draw;
      // call draw action
    },

    selectCard: (
      {playerId, card, cardIndex},
      {game}
    ) => {
      const player = game.players[playerId];
      
      if (game.stage !== GameStage.WarSelect) {
        if (!player.selectedCard) {
          player.selectedCard = {...card, isHidden: true};
          player.hand[cardIndex] = null;
        }
        // if both players have selected cards
        if (
          Object.values(game.players).every(
            (player: Player) => !!player.selectedCard
          )
        ) {
          game.stage = GameStage.Reveal;
        }
      } else {
        if (player.war.sacrifices.length < 2) {
          player.war.sacrifices.push({...card, isHidden: true});
        } else if (!player.war.hero) {
          player.war.hero = {...card, isHidden: true};
        } else {
          throw new Error('The tie-breaker already ended');
        }
        // remove card from hand
        player.hand[cardIndex] = null;
        
        if (game.players.one.war.hero && game.players.two.war.hero) {
          game.stage = GameStage.WarReveal;
        }
      }
    },

    revealCards: (_, {game}) => {
      if (game.stage !== GameStage.WarReveal && game.stage !== GameStage.Reveal) {
        console.log("skipping scoring for now, the stage isn't Score or WarScore yet")
        console.log("STAGE: ", game.stage);
        return;
      }
      const playerOne = game.players.one;
      const playerTwo = game.players.two;
      if (!playerOne.selectedCard || !playerTwo.selectedCard) {
        throw Rune.invalidAction();
      }
      // reveal all selected cards
      playerOne.selectedCard = {...playerOne.selectedCard, isHidden: false};
      playerTwo.selectedCard = {...playerTwo.selectedCard, isHidden: false};

      if (game.stage === GameStage.WarReveal && playerOne.war.hero && playerTwo.war.hero) {
        // reveal player one's war cards
        playerOne.war.hero = {...playerOne.war.hero, isHidden: false};
        playerOne.war.sacrifices = playerOne.war.sacrifices.map(card => ({...card, isHidden: false}))

        // reveal player two's war cards
        playerTwo.war.hero = {...playerTwo.war.hero, isHidden: false};
        playerTwo.war.sacrifices = playerTwo.war.sacrifices.map(card => ({...card, isHidden: false}))
      }

      if (game.stage === GameStage.Reveal) {
        game.stage = GameStage.Score;
      }
      if (game.stage === GameStage.WarReveal) {
        game.stage = GameStage.WarScore;
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

      // If player 2 is reduced to 0 HP
      if (game.players.two.hp < 1) {
        Rune.gameOver({
          players: {
            [game.players.one.playerId]: "WON",
            [game.players.two.playerId]: "LOST"
          },
          delayPopUp: false
        })
      }
        game.stage = GameStage.Discard;
      } else if (playerOneValue < playerTwoValue) {
        // player 2 wins, player 1 loses HP
        winner = 'two';
        game.players.two.wins++;
        game.players.one.hp -= playerTwoValue - playerOneValue;

        // If player 1 is reduced to 0 HP
        if (game.players.one.hp < 1) {
          Rune.gameOver({
            players: {
              [game.players.two.playerId]: "WON",
              [game.players.one.playerId]: "LOST"
            },
            delayPopUp: false
          })
        }
        game.stage = GameStage.Discard;
      } else if (playerOneValue === playerTwoValue) {
        // begin war
        // TODO: handle logic for this
        game.stage = GameStage.WarSelect;
      } else if (playerOneCard.suit === 'joker' || playerTwoCard.suit === 'joker') {  // if either player plays a joker, initiate joker phase
        game.stage = GameStage.Joker
      }

      if (game.stage === GameStage.Discard && winner) {
        game.players[winner].deck.push(
          playerOneCard,
          playerTwoCard
        );

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
