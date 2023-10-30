import { useContext, useEffect } from "react";
import { GameContext } from "../../game/GameContext";
import { getCardValueFromRank } from "../../game/utils";
import { GameStage } from "../../game/types/game";
import OutcomeText from "../common/OutcomeText";
import confetti from 'canvas-confetti';

const TableScoreText = () => {

  const renderConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      shapes: ['square'],
      colors: ['f52c4e', 'd01232', 'ff7640', 'ffcb3b', '15c662', 'ba44f5']
      // colors: ['#BA44F5']
    })
  }
  
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
      <OutcomeText type="damage" contents={"-" + score.toString()} />
    ) : (
      <OutcomeText contents="It's a draw!" />
    );
  }

  const opponentScore = getCardValueFromRank(opponent.selectedCard.rank);
  const playerScore = getCardValueFromRank(player.selectedCard.rank);
  const score = Math.abs(opponentScore - playerScore);

  if (player.selectedCard.suit === 'joker' || opponent.selectedCard.suit === 'joker') {
    renderConfetti()
    return(
      <>
        <OutcomeText contents="Joker!" type="joker" />
      </>
    )
  } else if(score > 0) {
    return(
      <OutcomeText contents={"-" + score.toString()} type="damage" />
    )
  } else {
    return(
      <OutcomeText contents="WAR!" type="special" />
    )
  }
};

export default TableScoreText;
