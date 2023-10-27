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
  useClassAbility: () => void
  // TODO: stealCard: () => void 
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
        usingAbility: false,
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
        usingAbility: false,
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

        //TODO: make mage always have property usingAbility set to true (passive ability)

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

      // Reset in order to use ability again this round or next round
      player.usingAbility = false;
      
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
          // If at least one player is a cleric, change to prescore ability stage
          if (game.players.one.selectedClass === "cleric" || game.players.two.selectedClass === "cleric") {
            game.stage = GameStage.PreScoreAbility;
          } else {
            // Otherwise go to score stage
            game.stage = GameStage.Score;
          } 

          if (
            game.players.one.selectedCard &&
            (game.players.one.selectedClass === "knight" && 
            game.players.one.selectedCard.suit === "spades") ||
            game.players.two.selectedCard &&
            (game.players.two.selectedClass === "knight" && 
            game.players.two.selectedCard.suit === "spades")
          ) {
            console.log("KNIGHT ABILITY ACTIVE: WARRRR!!")
            game.stage = GameStage.WarSelect;
          } else {
            game.stage = GameStage.Score;
          }

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
          if (game.players.one.selectedClass === "cleric" || game.players.two.selectedClass === "cleric") {
            game.stage = GameStage.PreScoreAbility;
          } 
        }
      }
    },

    // TODO: change to work only when selecting card of certain suit
    useClassAbility: (_, {playerId, game}) => {
      if (
        game.stage !== `${GameStage.PreScoreAbility}` && 
        game.stage !== `${GameStage.PostScoreAbility}`
      ) {
        throw Rune.invalidAction()
      }

      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      // Use class ability at this pre-score stage if you are cleric or knight
      if (game.stage === `${GameStage.PreScoreAbility}`) {
        if (playerOne.playerId === playerId &&
          (playerOne.selectedClass === "cleric" || playerOne.selectedClass === "knight") 
        ) {
          playerOne.usingAbility = true;
        }

        if (playerTwo.playerId === playerId &&
          (playerTwo.selectedClass === "cleric" || playerTwo.selectedClass === "knight")
        ) {
          playerTwo.usingAbility = true;

        }

        if (playerOne.selectedClass === "rogue") {
          if (playerTwo.usingAbility) {
            if(!playerOne.war.hero && !playerOne.war.hero) {
              game.stage = GameStage.Score;
            } else {
              game.stage = GameStage.WarScore;
            }
          } 
        }

        if (playerTwo.selectedClass === "rogue") {
          if (playerOne.usingAbility) {
            if(!playerOne.war.hero && !playerOne.war.hero) {
              game.stage = GameStage.Score;
            } else {
              game.stage = GameStage.WarScore;
            }
          } 
        }
        

        
    }
      // Use class ability at this post-score stage if you are rogue
      if (game.stage === `${GameStage.PostScoreAbility}`) {
        if (
          playerOne.playerId === playerId &&
          playerOne.selectedClass === "rogue"
        ) {
          playerOne.usingAbility = true;

        }

        if (
          playerTwo.playerId === playerId &&
          playerTwo.selectedClass === "rogue"
        ) {
          playerTwo.usingAbility = true;

        }

        if (playerOne.usingAbility && playerTwo.usingAbility) {
          game.stage = GameStage.Draw;
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
     
      let playerOneValue = getCardValueFromRank(playerOneCard.rank);
      let playerTwoValue = getCardValueFromRank(playerTwoCard.rank);

      // if player 1 is a mage and card is diamond, add 2 to value
      if (
        playerOne.selectedClass === "mage" && 
        playerOneCard.suit === 'diamonds' 
      ) {
        playerOneValue = playerOneValue + 2;
      }

        // if player 2 is a mage and card is diamond, add 2 to value
        if (
          playerTwo.selectedClass === "mage" && 
          playerTwoCard.suit === 'diamonds' 
        ) {
          playerTwoValue = playerTwoValue + 2;
        }

      let winner: 'one' | 'two' | null = null;
      if (playerOneValue > playerTwoValue) {
        // player 1 wins...
        winner = 'one';
        playerOne.wins++;
        // ...and they are a rogue
        if (playerOne.selectedClass === "rogue") {
          game.stage = GameStage.PostScoreAbility;
        }
        // player 2 loses HP
        playerTwo.hp -= playerOneValue - playerTwoValue;
        game.stage = GameStage.Discard;
      } else if (playerOneValue < playerTwoValue) {
        // player 2 wins... 
        winner = 'two';
        playerTwo.wins++;
        // ...and they are a rogue
        if (playerTwo.selectedClass === "rogue") {
          game.stage = GameStage.PostScoreAbility;
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

    // stealCard: () => {

    // }
  },
})
