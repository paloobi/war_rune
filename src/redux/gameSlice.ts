import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { GameState } from '../game/types/game'
import { Player } from '../game/types/player'

export interface GameStoreState {
  game: GameState | null,
  player: Player | null
}

const initialState: GameStoreState = {
  game: null,
  player: null
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGame: (state, action: PayloadAction<{game: GameState, playerId?: string}>) => {
      const {game, playerId} = action.payload;
      state.game = game;
      if (playerId) {
        state.player = Object.values(game.players).find(player => player.playerId === playerId) ?? null;
      }
    },
  },
})

// Action creators are generated for each case reducer function
export const { setGame } = gameSlice.actions

export default gameSlice.reducer