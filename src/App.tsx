import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { GameStage, type GameState } from "./game/types/game.ts";
import PlayerDebugInfo from "./components/debug/PlayerDebugInfo.tsx";
import { ACTION_DELAY } from "./game/utils.ts";
import PlayerPanel from "./components/player/PlayerPanel.tsx";
import { GameContext } from "./game/GameContext.ts";

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

  const onDeal = () => {
    Rune.actions.setStage({ stage: GameStage.Deal });

    setTimeout(() => {
      Rune.actions.dealCards();
      setTimeout(() => {
        Rune.actions.drawCards();
      }, ACTION_DELAY);
    }, ACTION_DELAY);
  };

  return (
    <>
      <GameContext.Provider value={gameContext}>
        <h1>War</h1>
        {game.stage === GameStage.Start && (
          <button onClick={onDeal}>Deal Cards</button>
        )}
        {game.stage !== GameStage.Start && <PlayerPanel />}
        <div>
          <PlayerDebugInfo />
        </div>
      </GameContext.Provider>
    </>
  );
}

export default App;
