import { useContext, useEffect } from "react";
import { GameContext } from "../../game/GameContext";
import { getCardValueFromRank } from "../../game/utils";
import { GameStage } from "../../game/types/game";
import OutcomeText from "../common/OutcomeText";
import confetti from 'canvas-confetti';

const TableScoreText = () => {

  // useEffect(() => {
  //   confetti({

  //   })
  // }, [])
  confetti();
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
    return(
      <>
        {/* {confetti()} */}
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

//   return score > 0 ? (
//     <OutcomeText contents={"-" + score.toString()} type="damage" />
//   ) : (
//     <OutcomeText contents="WAR!" type="special" />
//   );
};

export default TableScoreText;
