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
    if (
      player.war.hero.suit === "joker" ||
      opponent.war.hero.suit === "joker"
    ) {
      return (
        <>
          <Confetti />
          <OutcomeText contents="Joker!" type="joker" />
        </>
      );
    }
    const opponentScore = getCardValueFromRank(opponent.war.hero, opponent.selectedClass === "mage");
    const playerScore = getCardValueFromRank(player.war.hero, player.selectedClass === "mage");
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

  const opponentScore = getCardValueFromRank(opponent.selectedCard, opponent.selectedClass === "mage");
  const playerScore = getCardValueFromRank(player.selectedCard, player.selectedClass === "mage");
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

  const didKnightCauseWar = 
    (player.selectedClass === "knight" && player.selectedCard.suit === "spades") || 
    (opponent.selectedClass === "knight" && opponent.selectedCard.suit === "spades"); 

    console.log("Current player knight check: ", player.selectedClass, player.selectedCard.suit)
    console.log("Opponent knight check: ", opponent.selectedClass, opponent.selectedCard.suit)


  return score === 0 || didKnightCauseWar ? (
    <OutcomeText contents="WAR!" type="special" />
  ) : (
    <div
      className={`scoreAnimation--${
        opponentScore > playerScore ? "opponentWin" : "playerWin"
      }`}
    >
      <OutcomeText contents={"-" + score.toString()} type="damage" />
    </div>
  );
};

export default TableScoreText;
