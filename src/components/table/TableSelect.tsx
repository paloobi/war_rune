import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import CardMaybeSelected from "../common/CardMaybeSelected";

const TableSelect = () => {
  const { player, opponent } = useContext(GameContext);
  if (!player || !opponent) {
    throw new Error("Cannot select cards before game is started");
  }

  return (
    <>
      <div>{<CardMaybeSelected card={opponent.selectedCard} />}</div>
      <div>{<CardMaybeSelected card={player.selectedCard} />}</div>
    </>
  );
};

export default TableSelect;
