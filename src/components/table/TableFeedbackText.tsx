import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";
import TableScoreText from "./TableScoreText";

const TableFeedbackText = () => {
  const { game, player, opponent } = useContext(GameContext);
  if (!game || !player || !opponent) {
    throw new Error("Cannot render TableContents before game has started");
  }
  switch (game.stage) {
    case GameStage.Shuffle:
      return <p>Shuffling...</p>;
    case GameStage.Deal:
    case GameStage.Draw:
      return <p>Dealing...</p>;
    case GameStage.Discard:
      return <p>Cards to the winner...</p>;
    case GameStage.WarScore:
    case GameStage.Score:
      return <TableScoreText />;
    default:
      return <div />;
  }
};

export default TableFeedbackText;
