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

  const getColorClassName = ():
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "purple"
    | "gray"
    | null => {
    switch (game.stage) {
      case GameStage.Start:
      case GameStage.Shuffle:
      case GameStage.Deal:
      case GameStage.Draw:
      case GameStage.Discard:
      case GameStage.End:
      case GameStage.Select:
        return "yellow";
      case GameStage.Reveal:
      case GameStage.Score:
        return game.players?.one?.selectedCard?.rank ===
          game.players?.two?.selectedCard?.rank
          ? "orange"
          : "red";
      case GameStage.WarSelect:
        return "orange";
      case GameStage.WarScore:
      case GameStage.WarReveal:
        return game.players?.one?.war?.hero?.rank ===
          game.players?.two?.war?.hero?.rank
          ? "gray"
          : "red";
      default:
        return null;
    }
  };

  return (
    <GameContext.Provider value={gameContext}>
      <div className={`page-container ${getColorClassName()}`}>
        {game.stage === GameStage.Start && (
          <button onClick={onDeal}>Deal Cards</button>
        )}
        <div className="game-container">
          {game.stage !== GameStage.Start && <OpponentPanel />}
          {game.stage !== GameStage.Start && <Table />}
          {game.stage !== GameStage.Start && <PlayerPanel />}
        </div>
      </div>
    </GameContext.Provider>
  );
}

export default App;
