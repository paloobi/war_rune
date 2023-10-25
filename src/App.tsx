import { useEffect, useState } from "react";
import "./App.css";
import { GameStage, type GameState } from "./game/types/game.ts";
import PlayerDebugInfo from "./components/PlayerDebugInfo.tsx";
import { ACTION_DELAY } from "./game/utils.ts";

function App() {
  const [game, setGame] = useState<GameState>();
  useEffect(() => {
    Rune.initClient({
      onChange: ({ game }) => {
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
      <h1>War</h1>
      {game.stage === GameStage.Start && (
        <button onClick={onDeal}>Deal Cards</button>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100vw",
        }}
      >
        <PlayerDebugInfo game={game} playerId="one" />
        <PlayerDebugInfo game={game} playerId="two" />
      </div>
    </>
  );
}

export default App;
