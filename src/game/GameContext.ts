import { createContext } from 'react';
import { Player } from './types/player';
import { GameState } from './types/game';

interface GameContextType {
  player: Player | null;
  game: GameState | null;
  opponent: Player | null;
}

export const GameContext = createContext<GameContextType>({player: null, game: null, opponent: null});
