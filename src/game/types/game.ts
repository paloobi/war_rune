import type { Player } from "./player";

export enum GameStage {
  Start = "START",
  Shuffle = "SHUFFLE",
  Deal = "DEAL",
  ClassSelect = "CLASS_SELECT",
  Draw = "DRAW",
  Select = "SELECT",
  Score = "SCORE",
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