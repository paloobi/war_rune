import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { GameStage, type GameState } from "./game/types/game.ts";
import PlayerDebugInfo from "./components/PlayerDebugInfo.tsx";
import { ACTION_DELAY } from "./game/utils.ts";
import { GameContext } from "./game/GameContext.ts";
import PlayerHand from "./components/PlayerHand.tsx";

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
        if (!playerId) {
          setPlayerId(yourPlayerId);
        }
        setGame(game);
      },
    });
  }, [playerId]);

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
        <div>
          <PlayerDebugInfo />
        </div>
      </GameContext.Provider>
    </>
  );
}

export default App;
