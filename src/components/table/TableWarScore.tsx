import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { getCardValueFromRank } from "../../game/utils";
import CardImage from "../common/CardImage";

const TableWarScore = () => {
  const { opponent, player } = useContext(GameContext);
  if (!opponent?.war?.hero || !player?.war?.hero) {
    throw new Error(
      "Entered War Reveal or Score stage without both cards selected"
    );
  }
  const opponentWarScore = getCardValueFromRank(opponent.war.hero.rank);
  const playerWarScore = getCardValueFromRank(player.war.hero.rank);
  const warScore = Math.abs(opponentWarScore - playerWarScore);
  return (
    <>
      <div>
        <p>{opponentWarScore}</p>
        {<CardImage card={opponent.war.hero} />}
        {opponentWarScore > playerWarScore && (
          <div>
            <p>Winner!</p>
          </div>
        )}
      </div>
      <p>{warScore > 0 ? warScore : "It's a draw!"}</p>
      <div>
        {<CardImage card={player.war.hero} />}
        {playerWarScore}
        {playerWarScore > opponentWarScore && (
          <div>
            <p>Winner!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TableWarScore;
