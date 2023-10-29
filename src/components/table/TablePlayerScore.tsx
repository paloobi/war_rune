import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";
import { Player } from "../../game/types/player";
import { getCardValueFromRank } from "../../game/utils";
import PlayerScore from "../common/PlayerScore";

const TablePlayerScore = ({
  player,
  className,
}: {
  player: Player;
  className: string;
}) => {
  const { game } = useContext(GameContext);

  if (!game) {
    throw new Error("Cannot render score before game is started");
  }

  if (game.stage === GameStage.Score) {
    if (!player.selectedCard) {
      throw new Error("Cannot score before card is selected");
    }
    return (
      <PlayerScore
        className={className}
        score={getCardValueFromRank(player.selectedCard.rank)}
      />
    );
  }

  if (game.stage === GameStage.WarScore) {
    if (!player?.war?.hero) {
      throw new Error("Cannot score before card is selected");
    }
    return (
      <PlayerScore
        className={className}
        score={getCardValueFromRank(player.war.hero.rank)}
      />
    );
  }
  return <div />;
};

export default TablePlayerScore;
