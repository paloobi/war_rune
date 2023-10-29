import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";
import { Player } from "../../game/types/player";
import { getCardValueFromRank } from "../../game/utils";

const TablePlayerScore = ({ player }: { player: Player }) => {
  const { game } = useContext(GameContext);

  if (!game) {
    throw new Error("Cannot render score before game is started");
  }

  if (game.stage === GameStage.Score) {
    if (!player.selectedCard) {
      throw new Error("Cannot score before card is selected");
    }
    return <p>{getCardValueFromRank(player.selectedCard.rank)}</p>;
  }

  if (game.stage === GameStage.WarScore) {
    if (!player?.war?.hero) {
      throw new Error("Cannot score before card is selected");
    }
    return <p>{getCardValueFromRank(player.war.hero.rank)}</p>;
  }
  return <div />;
};

export default TablePlayerScore;
