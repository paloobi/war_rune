import { createContext } from 'react';
import { Player } from './types/player';
import { GameState } from './types/game';

interface GameContextType {
  player: Player | null;
  game: GameState | null;
}

export const GameContext = createContext<GameContextType>({player: null, game: null });
