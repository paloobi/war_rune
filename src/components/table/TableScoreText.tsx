import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { getCardValueFromRank } from "../../game/utils";
import { GameStage } from "../../game/types/game";
import OutcomeText from "../common/OutcomeText";
import Confetti from "./Confetti";

import "./TableScoreText.css";

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
    return score > 0 ? (
      <div
        className={`scoreAnimation--${
          opponentScore > playerScore ? "opponentWin" : "playerWin"
        }`}
      >
        <OutcomeText type="damage" contents={"-" + score.toString()} />
      </div>
    ) : (
      <OutcomeText contents="Draw!" />
    );
  }

  const opponentScore = getCardValueFromRank(opponent.selectedCard.rank);
  const playerScore = getCardValueFromRank(player.selectedCard.rank);
  const score = Math.abs(opponentScore - playerScore);

  if (
    player.selectedCard.suit === "joker" ||
    opponent.selectedCard.suit === "joker"
  ) {
    return (
      <>
        <Confetti />
        <OutcomeText contents="Joker!" type="joker" />
      </>
    );
  }

  return score > 0 ? (
    <div
      className={`scoreAnimation--${
        opponentScore > playerScore ? "opponentWin" : "playerWin"
      }`}
    >
      <OutcomeText contents={"-" + score.toString()} type="damage" />
    </div>
  ) : (
    <OutcomeText contents="WAR!" type="special" />
  );
};

export default TableScoreText;
