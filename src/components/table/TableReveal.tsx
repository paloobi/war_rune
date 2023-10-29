import { useContext } from "react";
import { getCardValueFromRank } from "../../game/utils";
import { GameContext } from "../../game/GameContext";
import CardImage from "../common/CardImage";

const TableReveal = () => {
  const { player, opponent } = useContext(GameContext);

  if (!opponent?.selectedCard || !player?.selectedCard) {
    throw new Error("Entered Reveal stage without both cards selected");
  }
  const opponentScore = getCardValueFromRank(opponent.selectedCard.rank);
  const playerScore = getCardValueFromRank(player.selectedCard.rank);
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

export default TableReveal;
