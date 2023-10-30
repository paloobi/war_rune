import type { RuneClient } from "rune-games-sdk/multiplayer"
import type { GameState } from "./game/types/game";
import { PlayerClass } from "./game/types/class";
import { GameStage } from "./game/types/game";
import { Card } from "./game/types/card";
import { Player } from "./game/types/player";
import { dealCards, drawCards, joker, revealCards, scoreCards } from "./game/gameEvents";

export const ACTION_DELAY = 1000;
export const MAX_HP = 50;

type GameActions = {
  setStage: (params: { stage: GameStage }) => void,
  selectClass: (playerClass: PlayerClass) => void,
  selectCard: (params: { playerId: "one" | "two", card: Card, cardIndex: number }) => void,
  useClericAbility: () => void,
  stealCard: (params: { playerId: "one" | "two", index: number }) => void,
  doNotUseClericAbility: () => void
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
        rogueStealCardOptions: [],
        deck: [],
        hand: [null, null, null, null],
        war: {
          sacrifices: [],
          hero: null
        },
        selectedCard: null,
        hp: MAX_HP,
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
        hp: MAX_HP,
        wins: 0,
      },
    },
  }
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  updatesPerSecond: 1,
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

      const playerOne = game.players.one;
      const playerTwo = game .players.two;

      if (playerOne.playerId === playerId) {
          playerOne.selectedClass = playerClass;
        } else if (playerTwo.playerId === playerId) {
          playerTwo.selectedClass = playerClass
        } else {
          throw Rune.invalidAction()
        }

        //TODO: make mage always have property usingAbility set to true (passive ability)

      if (playerOne.selectedClass && playerTwo.selectedClass){
        game.stage = GameStage.Start;
      }
    },

    selectCard: (
      {playerId, card, cardIndex},
      {game}
    ) => {
      const player = game.players[playerId];
      const opposingPlayer = playerId === "one" ? game.players.two : game.players.one;

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
            (player.selectedClass === "knight" && player.selectedCard.suit === "spades") ||
            (
              opposingPlayer.selectedClass === "knight" && 
              opposingPlayer.selectedCard &&
              opposingPlayer.selectedCard.suit === "spades")
          ) {
            player.usingAbility = player.selectedClass === "knight";
            opposingPlayer.usingAbility = opposingPlayer.selectedClass === "knight";
            game.stage = GameStage.WarSelect;
            console.log("stage changed to: ", game.stage )
            console.log("KNIGHT ABILITY ACTIVE: WARRRR!!")
          } 
            // If  player is a cleric and selected hearts, change to cleric ability stage
            if (
              (player.selectedClass === "cleric" && player.selectedCard.suit === "hearts") ||
              (
                opposingPlayer.selectedCard && 
                opposingPlayer.selectedClass === "cleric" && 
                opposingPlayer.selectedCard.suit === "hearts"
              )
            ) {
              game.stage = GameStage.ClericAbility;
              console.log("stage changed to: ", game.stage )
              console.log("you are a cleric who selected hearts")
            } else if (
              (opposingPlayer.selectedClass === "knight" && opposingPlayer.usingAbility) ||
              (player.selectedClass === "knight" && player.usingAbility)
            ) {
              game.stage = GameStage.WarSelect;
              console.log("stage changed to: ", game.stage )
            } else {
              // Otherwise go to reveal stage
              game.stage = GameStage.Reveal;
              console.log("stage changed to: ", game.stage )
            } 
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
        }
          if (game.players.one.war.hero && game.players.two.war.hero) {
            game.stage = GameStage.WarReveal;
            console.log("stage changed to: ", game.stage )
            if (game.players.one.selectedClass === "cleric" || game.players.two.selectedClass === "cleric") {
              game.stage = GameStage.ClericAbility;
              console.log("stage changed to: ", game.stage )

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
        game.stage = GameStage.WarReveal;
        console.log("stage changed to: ", game.stage )
      } else {
        game.stage = GameStage.Reveal;
        console.log("stage changed to: ", game.stage )
      }
    },

    doNotUseClericAbility: (_, {game}) => {
      const playerOne = game.players.one;
      const playerTwo = game.players.two;

      if (playerOne.war.hero && playerTwo.war.hero) {
        game.stage = GameStage.WarReveal
        console.log("stage changed to: ", game.stage )
      } else {
        game.stage = GameStage.Reveal;          
        console.log("stage changed to: ", game.stage )
      }
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
  update: ({game}) => {
    switch (game.stage) {
      case GameStage.Deal:
        dealCards(game);
        break;
      case GameStage.Draw:
        drawCards(game);
        break;
      case GameStage.Joker:
        joker(game);
        break;
      case GameStage.Reveal:
      case GameStage.WarReveal:
        revealCards(game);
        break;
      case GameStage.Score:
      case GameStage.WarScore:
        scoreCards(game);
        break;
    }
  }
})
