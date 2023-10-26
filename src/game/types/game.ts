import type { Player } from "./player";

export enum GameStage {
  Start = "START",
  Shuffle = "SHUFFLE",
  Deal = "DEAL",
  Draw = "DRAW",
  Joker = "JOKER",
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