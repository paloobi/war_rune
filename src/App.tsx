import { useEffect, useState } from "react";
import "./App.css";
import { GameStage, type GameState } from "./game/types/game.ts";
import PlayerDebugInfo from "./components/PlayerDebugInfo.tsx";
import { ACTION_DELAY } from "./game/utils.ts";
import { GameContext } from "./game/gameContext.ts";
import PlayerHand from "./components/PlayerHand.tsx";

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
      <GameContext.Provider
        value={{
          game,
          player:
            playerId === game.players.one.playerId
              ? game.players.one
              : game.players.two,
        }}
      >
        <h1>War</h1>
        {game.stage === GameStage.Start && (
          <button onClick={onDeal}>Deal Cards</button>
        )}
        <div>
          <PlayerHand />
          {playerId === game.players.one.playerId && (
            <PlayerDebugInfo game={game} playerNumber="one" />
          )}
          {playerId === game.players.two.playerId && (
            <PlayerDebugInfo game={game} playerNumber="two" />
          )}
        </div>
      </GameContext.Provider>
    </>
  );
}

export default App;
