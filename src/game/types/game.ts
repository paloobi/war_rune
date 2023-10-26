import type { Player } from "./player";

export enum GameStage {
  ClassSelect = "CLASS_SELECT",
  Start = "START",
  Shuffle = "SHUFFLE",
  Deal = "DEAL",
  Draw = "DRAW",
  Select = "SELECT",
  PreScoreAbility = "PRE_SCORE_ABILITY",
  Score = "SCORE",
  PostScoreAbility = "POST_SCORE_ABILITY",
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