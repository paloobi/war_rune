import { useContext } from "react";
import { GameContext } from "./game/GameContext";
import { GameStage } from "./game/types/game";
import OpponentPanel from "./components/opponent/OpponentPanel";
import PlayerPanel from "./components/player/PlayerPanel";
import Table from "./components/table/Table";
import { ACTION_DELAY, isCurrentWinner } from "./game/utils";

const Game = () => {
  const { game, player } = useContext(GameContext);

  if (!game || !player) {
    throw new Error("Cannot display game info before Rune Game started");
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
      case GameStage.Reveal:
        return "yellow";
      case GameStage.WarSelect:
      case GameStage.WarReveal:
        return "orange";
      case GameStage.Score:
        // return green for current player
        // otherwise return orange on War, red on damage
        return isCurrentWinner(player, game)
          ? "green"
          : game.players?.one?.selectedCard?.rank ===
            game.players?.two?.selectedCard?.rank
          ? "orange"
          : "red";
      case GameStage.WarScore:
        // return green for current player
        // otherwise return gray on draw, red on damage
        return isCurrentWinner(player, game)
          ? "green"
          : game.players?.one?.war?.hero?.rank ===
            game.players?.two?.war?.hero?.rank
          ? "gray"
          : "red";
      default:
        return null;
    }
  };

  return (
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
  );
};

export default Game;
