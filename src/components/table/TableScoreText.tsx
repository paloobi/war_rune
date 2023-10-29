import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { getCardValueFromRank } from "../../game/utils";
import { GameStage } from "../../game/types/game";

const TableScoreText = () => {
  const { game, player, opponent } = useContext(GameContext);

  if (!game || !opponent?.selectedCard || !player?.selectedCard) {
    throw new Error(
      "Entered Score stage without game started and both cards selected"
    );
  }

  if (game.stage === GameStage.WarScore) {
    if (!opponent?.war?.hero || !player?.war?.hero) {
      throw new Error(
        "Cannot score in War without both players selecting Hero"
      );
    }
    const opponentScore = getCardValueFromRank(opponent.war.hero.rank);
    const playerScore = getCardValueFromRank(player.war.hero.rank);
    const score = Math.abs(opponentScore - playerScore);
    return score > 0 ? <p>{score}</p> : <p>It's a draw!</p>;
  }

  const opponentScore = getCardValueFromRank(opponent.selectedCard.rank);
  const playerScore = getCardValueFromRank(player.selectedCard.rank);
  const score = Math.abs(opponentScore - playerScore);

  return score > 0 ? <p>{score}</p> : <p>WAR!</p>;
};

export default TableScoreText;
