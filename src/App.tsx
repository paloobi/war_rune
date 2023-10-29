import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { GameStage, type GameState } from "./game/types/game.ts";
import { ACTION_DELAY } from "./game/utils.ts";
import PlayerPanel from "./components/player/PlayerPanel.tsx";
import { GameContext } from "./game/GameContext.ts";
import OpponentPanel from "./components/opponent/OpponentPanel.tsx";
import Table from "./components/table/Table.tsx";
import ClassSelect from "./components/class/ClassSelect.tsx";

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

  const onDeal = () => {
    Rune.actions.setStage({ stage: GameStage.Deal });

    setTimeout(() => {
      Rune.actions.dealCards();
      setTimeout(() => {
        Rune.actions.drawCards();
      }, ACTION_DELAY);
    }, ACTION_DELAY);
  };

  const hasGameStarted =
    game.stage !== GameStage.Start && game.stage !== GameStage.ClassSelect;

  return (
    <GameContext.Provider value={gameContext}>
      {game.stage === GameStage.ClassSelect && <ClassSelect />}
      {game.stage === GameStage.Start && (
        <button onClick={onDeal}>Deal Cards</button>
      )}
      {hasGameStarted && (
        <div className="game-container">
          <OpponentPanel />
          <Table />
          <PlayerPanel />
        </div>
      )}
    </GameContext.Provider>
  );
}

export default App;
