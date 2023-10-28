import type { RuneClient } from "rune-games-sdk/multiplayer"
import type { GameState } from "./game/types/game";
import { PlayerClass } from "./game/types/class";
import { GameStage } from "./game/types/game";
import { Card } from "./game/types/card";
import { buildDeck, drawHand, getCardValueFromRank, getTwoRandomCardsFromDeck } from "./game/utils";
import { Player } from "./game/types/player";

type GameActions = {
  setStage: (params: { stage: GameStage }) => void
  dealCards: () => void,
  selectClass: (playerClass: PlayerClass) => void,
  drawCards: () => void,
  selectCard: (params: { playerId: "one" | "two", card: Card, cardIndex: number }) => void,
  revealCards: () => void,
  scoreCards: () => void
  useClericAbility: () => void
  stealCard: (params: { playerId: "one" | "two", index: number }) => void 
  doNotUseClericAbility: () => void
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
        selectedClass: null,
        usingAbility: false,
        rogueStealCardOptions: [],
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
        selectedClass: null,
        usingAbility: false,
        rogueStealCardOptions: [],
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
      drawHand(game.players.one);
      drawHand(game.players.two);
      game.stage = GameStage.Select;
    },

    selectCard: (
      {playerId, card, cardIndex},
      {game}
    ) => {
      const player = game.players[playerId];
      if (game.stage !== GameStage.Select && game.stage !== GameStage.WarSelect) {
        console.log("skipping SelectCard for now because stage was not Select or WarSelect")
        console.log("game stage: ", game.stage)
      }

      if (game.stage === GameStage.Select) {
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
  
          //TODO: Fix bug that does only does cleric ability during war
          // TODO: There is a bug in here that doesn't move from WarSelect to WarScore
          if (
            game.players.one.selectedCard &&
            (game.players.one.selectedClass === "knight" && 
            game.players.one.selectedCard.suit === "spades") ||
            game.players.two.selectedCard &&
            (game.players.two.selectedClass === "knight" && 
            game.players.two.selectedCard.suit === "spades")
          ) {
            game.stage = GameStage.WarSelect;
            console.log("KNIGHT ABILITY ACTIVE: WARRRR!!")
          } else if (game.players.one.selectedCard && game.players.two.selectedCard) {
            // If at least one player is a cleric and selected hearts, change to cleric ability stage
            if (
              (game.players.one.selectedClass === "cleric" && game.players.one.selectedCard.suit === "hearts") || 
              game.players.two.selectedClass === "cleric" && game.players.two.selectedCard.suit === "hearts") {
              game.stage = GameStage.ClericAbility;
            } else {
              // Otherwise go to score stage
              game.stage = GameStage.Score;
            } 
          }
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
          if (game.players.one.selectedClass === "cleric" || game.players.two.selectedClass === "cleric") {
            game.stage = GameStage.ClericAbility;
          } 
        }
      }
    },

    // TODO: change to work only when selecting card of certain suit
    useClericAbility: (_, {playerId, game}) => {
      if (game.stage !== GameStage.ClericAbility) {
        console.log("Cannot use cleric ability if not in ClericAbility game stage")
        throw Rune.invalidAction()
      }

      const playerOne = game.players.one;
      const playerTwo = game.players.two;

        if (playerOne.playerId === playerId && playerOne.selectedClass === "cleric") {
          playerOne.usingAbility = true;
        }

        if (playerTwo.playerId === playerId && playerTwo.selectedClass === "cleric") {
          playerTwo.usingAbility = true;
        }

        if (playerOne.war.hero && playerTwo.war.hero) {
          game.stage = GameStage.WarScore
        } else {
          game.stage = GameStage.Score
        }
    },

    doNotUseClericAbility: (_, {game}) => {
      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      if (playerOne.war.hero && playerTwo.war.hero) {
        game.stage = GameStage.WarScore
      } else {
        game.stage = GameStage.Score
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
        // if winner is cleric using ability
        if (
          playerOne.selectedClass === "cleric" && 
          playerOne.usingAbility &&
          playerOneCard.suit === "hearts"
        ) {
          // player 1 heals hp
          playerOne.hp += playerOneValue - playerTwoValue;
        } else {
          // ...player 2 loses HP
          playerTwo.hp -= playerOneValue - playerTwoValue;
        }

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
        // player 2 wins... 
        winner = 'two';
        playerTwo.wins++;

        // if winner is cleric using ability
        if (
          playerTwo.selectedClass === "cleric" && 
          playerTwo.usingAbility &&
          playerTwoCard.suit === "hearts"
        ) {
          // player 2 heals hp
          playerTwo.hp += playerTwoValue - playerOneValue;
        } else {
          // ...player 1 loses HP
          playerOne.hp -= playerTwoValue - playerOneValue;
        }

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
  
      } else {
        // begin war
        // TODO: handle logic for this
        game.stage = GameStage.WarSelect;
      }

      if (game.stage === GameStage.Discard && winner) {
        game.players[winner].deck.push(
          {...playerOneCard, isHidden: true},
          {...playerTwoCard, isHidden: true}
        );

        if (playerOne.war.hero && playerTwo.war.hero) {
          // if War winner was a rogue who played a club
          // TODO: fix this null-suppressing operator for TS
          if (
            game.players[winner].selectedClass === "rogue" &&
            game.players[winner].war.hero?.suit === "clubs"
          ) {
            game.stage = GameStage.Steal;
          } else {
            game.stage = GameStage.Draw;
          }
          // in a tie, all the cards go to the winner
          game.players[winner].deck.push(
            {...playerOne.war.hero, isHidden: true},
            {...playerTwo.war.hero, isHidden: true},
            ...playerOne.war.sacrifices.map(card => ({...card, isHidden: true})),
            ...playerTwo.war.sacrifices.map(card => ({...card, isHidden: true}))
          );
          playerOne.war = {
            hero: null,
            sacrifices: [],
          };
          playerTwo.war = {
            hero: null,
            sacrifices: [],
          }
        } else {
          // if winner was a rogue who played a club
          // TODO: fix this null-suppressing operator for TS
          if (
            game.players[winner].selectedClass === "rogue" &&
            game.players[winner].selectedCard?.suit === "clubs"
          ) {
            game.stage = GameStage.Steal;
          } else {
            game.stage = GameStage.Draw;
          }
        }

        // reset selected cards to null
        playerOne.selectedCard = null;
        playerTwo.selectedCard = null;

        // Stop using cleric or knight ability
        if (playerOne.selectedClass === "cleric") {
          playerOne.usingAbility = false;
        }

        if (playerTwo.selectedClass === "cleric") {
          playerTwo.usingAbility = false;
        }
      }

      // select two random cards from opponent's deck in reserve for a rogue steal ability
      playerOne.rogueStealCardOptions = getTwoRandomCardsFromDeck(playerTwo.deck);
      playerTwo.rogueStealCardOptions = getTwoRandomCardsFromDeck(playerOne.deck);
    },

    stealCard: ({playerId, index}, {game}) => {
      if (game.stage !== GameStage.Steal) {
        console.log("skipping steal for now, the stage isn't Steal")
        console.log("STAGE: ", game.stage);
        return;
      }

      const player = game.players[playerId];
      const opposingPlayer = playerId === "one" ? game.players.two : game.players.one;

      //steal card
      player.deck.push(player.rogueStealCardOptions[index]);

      // give opponent new deck without stolen card
      const newOpponentDeck = opposingPlayer.deck.filter(card => {
        const cardValues = Object.values(card);
        console.log(cardValues)
        const stolenCardValues = Object.values(player.rogueStealCardOptions[index])
        console.log(stolenCardValues)

        console.log(!cardValues.includes(stolenCardValues[0]), !cardValues.includes(stolenCardValues[1]))
        if (!cardValues.includes(stolenCardValues[0]) && !cardValues.includes(stolenCardValues[1])) {
          return true;
        }
      });

      
      opposingPlayer.deck = newOpponentDeck;

      game.stage = GameStage.Draw
    }
  },
})
