import type { RuneClient } from "rune-games-sdk/multiplayer"
import type { GameState } from "./game/types/game";
import { GameStage } from "./game/types/game";
import { Card } from "./game/types/card";
import { Player } from "./game/types/player";
import { dealCards, drawCards, joker, revealCards, scoreCards } from "./game/gameEvents";

export const ACTION_DELAY = 1000;
export const MAX_HP = 50;

type GameActions = {
  setStage: (params: { stage: GameStage }) => void
  selectCard: (params: { playerId: "one" | "two", card: Card, cardIndex: number }) => void,
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
        hp: MAX_HP,
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
