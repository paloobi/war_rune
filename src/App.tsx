import { useEffect, useMemo, useState } from "react";
import { GameStage, type GameState } from "./game/types/game.ts";
import PlayerPanel from "./components/player/PlayerPanel.tsx";
import { GameContext } from "./game/GameContext.ts";
import OpponentPanel from "./components/opponent/OpponentPanel.tsx";
import Table from "./components/table/Table.tsx";
import ClassSelect from "./components/class/ClassSelect.tsx";

import "./App.css";

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
      {game.stage === GameStage.Start ||
        (game.stage === GameStage.ClassSelect && (
          <footer>
            <p>
              <small>
                Made by <a href="https://github.com/dyazdani">@dyazdani</a>{" "}
                <a href="https://github.com/jvaneyken">@jvaneyken</a>{" "}
                <a href="https://github.com/paloobi/">@paloobi</a> for React Jam
                Fall 2023
              </small>
            </p>
            <p>
              <small>
                logo by{" "}
                <a href="https://github.com/AnthonyPinto">@anthonypinto</a> -
                art from <a href="https://kenney.nl/">Kenney.nl</a>
              </small>
            </p>
          </footer>
        ))}
    </GameContext.Provider>
  );
}

export default App;
