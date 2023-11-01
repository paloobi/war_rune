import { useContext } from "react";
import { GameContext } from "./game/GameContext";
import { GameStage } from "./game/types/game";
import OpponentPanel from "./components/opponent/OpponentPanel";
import PlayerPanel from "./components/player/PlayerPanel";
import Table from "./components/table/Table";
import { ACTION_DELAY, isCurrentWinner } from "./game/utils";
import ClassSelect from "./components/class/ClassSelect";

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
    // jokers revealed
    if (
      (game.players?.one?.selectedCard?.suit === "joker" ||
        game.players?.two?.selectedCard?.suit === "joker") &&
      (game.stage === GameStage.Reveal ||
        game.stage === GameStage.Score ||
        game.stage === GameStage.Joker)
    ) {
      return "purple";
    }

    // jokers revealed during a war
    if (
      (game.players?.one?.war?.hero?.suit === "joker" ||
        game.players?.two?.war?.hero?.suit === "joker") &&
      (game.stage === GameStage.WarReveal ||
        game.stage === GameStage.WarScore ||
        game.stage === GameStage.Joker)
    ) {
      return "purple";
    }

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
        // return green for current player winning
        // otherwise return orange on War, red on damage
        return isCurrentWinner(player, game)
          ? "green"
          : game.players?.one?.selectedCard?.rank ===
            game.players?.two?.selectedCard?.rank
          ? "orange"
          : "red";
      case GameStage.WarScore:
        // return green for current player winning
        // otherwise return gray on draw, red on damage
        return isCurrentWinner(player, game)
          ? "green"
          : game.players?.one?.war?.hero?.rank ===
            game.players?.two?.war?.hero?.rank
          ? "gray"
          : "red";
      case GameStage.Joker:
        return "purple";
      default:
        return null;
    }
  };

  const hasGameStarted =
    game.stage !== GameStage.Start && game.stage !== GameStage.ClassSelect;

  return (
    <div className={`page-container ${getColorClassName()}`}>
      {game.stage === GameStage.ClassSelect && <ClassSelect />}
      {game.stage === GameStage.Start && (
        <button className="dealCardsButton" onClick={onDeal}>
          Deal Cards
        </button>
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
    </div>
  );
};

export default Game;
