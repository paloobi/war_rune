import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";
import { Player } from "../../game/types/player";
import { getCardValueFromRank } from "../../game/utils";
import PlayerScore from "../common/PlayerScore";
import { getSuitFromClass } from "../../game/types/class";

import "./TablePlayerScore.css";

const TablePlayerScore = ({
  player,
  className,
}: {
  player: Player;
  className: string;
}) => {
  const { game, opponent } = useContext(GameContext);

  if (!game || !opponent) {
    throw new Error("Cannot render score before game is started");
  }

  if (game.stage === GameStage.Score) {
    if (!player.selectedCard) {
      throw new Error("Cannot score before card is selected");
    }
    return (
      <>
        <PlayerScore
          className={className}
          score={getCardValueFromRank(
            player.selectedCard,
            player.selectedClass === "mage"
          )}
        />
        {player.selectedClass === "mage" &&
          player.selectedCard.suit === getSuitFromClass("mage") && (
            <div
              className={`extraDamage ${
                player === opponent ? "opponent" : "player"
              }`}
            >
              +2
            </div>
          )}
      </>
    );
  }

  if (game.stage === GameStage.WarScore) {
    if (!player?.war?.hero) {
      throw new Error("Cannot score before card is selected");
    }
    return (
      <>
        <PlayerScore
          className={className}
          score={getCardValueFromRank(
            player.war.hero,
            player.selectedClass === "mage"
          )}
        />
        {player.selectedClass === "mage" &&
          player.war.hero.suit === getSuitFromClass("mage") && (
            <div
              className={`extraDamage ${
                player === opponent ? "opponent" : "player"
              }`}
            >
              +2
            </div>
          )}
      </>
    );
  }
  return <div />;
};

export default TablePlayerScore;
