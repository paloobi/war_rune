import { useEffect, useState } from "react";
import "./App.css";
import { GameStage, type GameState } from "./game/types/game.ts";
import PlayerDebugInfo from "./components/PlayerDebugInfo.tsx";
import { ACTION_DELAY } from "./game/utils.ts";

function App() {
  const [game, setGame] = useState<GameState>();
  const [playerId, setPlayerId] = useState<string>();
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
      <h1>War</h1>
      {game.stage === GameStage.Start && (
        <button onClick={onDeal}>Deal Cards</button>
      )}
      <div>
        {playerId === game.players.one.playerId && (
          <PlayerDebugInfo game={game} playerNumber="one" />
        )}
        {playerId === game.players.two.playerId && (
          <PlayerDebugInfo game={game} playerNumber="two" />
        )}
      </div>
    </>
  );
}

export default App;
