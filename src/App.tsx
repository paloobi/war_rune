import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Game from "./Game";
import { GameState } from "./game/types/game";
import { GameContext } from "./game/GameContext";

function App() {
  const [game, setGame] = useState<GameState>();
  const [playerId, setPlayerId] = useState<string>();
  const gameContext = useMemo(
    () => ({
      game: game || null,
      player:
        (game &&
          Object.values(game.players).find(
            (player) => player.playerId === playerId
          )) ||
        null,
      opponent:
        (game &&
          Object.values(game.players).find(
            (player) => player.playerId !== playerId
          )) ||
        null,
    }),
    [game, playerId]
  );

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setPlayerId(yourPlayerId);
        setGame(game);
      },
    });
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <GameContext.Provider value={gameContext}>
      <Game />
    </GameContext.Provider>
  );
}

export default App;
