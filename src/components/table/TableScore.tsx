import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { getCardValueFromRank } from "../../game/utils";
import CardImage from "../common/CardImage";

const TableScore = () => {
  const { player, opponent } = useContext(GameContext);

  if (!opponent?.selectedCard || !player?.selectedCard) {
    throw new Error(
      "Entered Reveal stage without game started and both cards selected"
    );
  }

  const opponentScore = getCardValueFromRank(opponent.selectedCard.rank);
  const playerScore = getCardValueFromRank(player.selectedCard.rank);
  const score = Math.abs(opponentScore - playerScore);
  return (
    <>
      <div>
        <p>{opponentScore}</p>
        {<CardImage card={opponent.selectedCard} />}
        {opponentScore > playerScore && (
          <div>
            <p>Winner!</p>
          </div>
        )}
      </div>
      <p>{score > 0 ? score : "WAR!"}</p>
      <div>
        {<CardImage card={player.selectedCard} />}
        {playerScore}
        {playerScore > opponentScore && (
          <div>
            <p>Winner!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TableScore;
