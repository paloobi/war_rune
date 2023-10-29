import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import CardMaybeSelected from "../common/CardMaybeSelected";

const TableWarSelect = () => {
  const { player, opponent } = useContext(GameContext);
  if (!opponent || !player) {
    throw new Error("Cannot enter war select without game started");
  }

  return (
    <>
      <div>
        {<CardMaybeSelected card={opponent.selectedCard} />}
        {opponent.war.sacrifices.map((card) => (
          <CardMaybeSelected card={card} />
        ))}
        {<CardMaybeSelected card={opponent.war.hero} />}
      </div>
      <div>
        {<CardMaybeSelected card={player.selectedCard} />}
        {player.war.sacrifices.map((card) => (
          <CardMaybeSelected card={card} />
        ))}
        {<CardMaybeSelected card={player.war.hero} />}
      </div>
    </>
  );
};

export default TableWarSelect;
