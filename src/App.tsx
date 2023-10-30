import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { GameStage, type GameState } from "./game/types/game.ts";
import { ACTION_DELAY } from "./game/utils.ts";
import PlayerPanel from "./components/player/PlayerPanel.tsx";
import { GameContext } from "./game/GameContext.ts";
import OpponentPanel from "./components/opponent/OpponentPanel.tsx";
import Table from "./components/table/Table.tsx";

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

  return (
    <GameContext.Provider value={gameContext}>
      {game.stage === GameStage.Start && (
        <button onClick={onDeal}>Deal Cards</button>
      )}
      <div className="game-container">
        {game.stage !== GameStage.Start && <OpponentPanel />}
        {game.stage !== GameStage.Start && <Table />}
        {game.stage !== GameStage.Start && <PlayerPanel />}
      </div>
      {game.stage === GameStage.Start && (
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
              <a href="https://github.com/AnthonyPinto">@anthonypinto</a> - art
              from <a href="https://kenney.nl/">Kenney.nl</a>
            </small>
          </p>
        </footer>
      )}
    </GameContext.Provider>
  );
}

export default App;
