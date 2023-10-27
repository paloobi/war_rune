import type { Player } from "./player";

export enum GameStage {
  ClassSelect = "CLASS_SELECT",
  Start = "START",
  Shuffle = "SHUFFLE",
  Deal = "DEAL",
  Draw = "DRAW",
  Select = "SELECT",
  ClericAbility = "CLERIC_ABILITY",
  Score = "SCORE",
  Steal = "STEAL",
  WarSelect = "WAR_SELECT",
  WarScore = "WAR_SCORE",
  Discard = "DISCARD",
  End = "END",
}

export interface GameState {
  stage: GameStage;
  players: {
    one: Player;
    two: Player;
  };
}