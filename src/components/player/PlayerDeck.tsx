import { useContext } from "react";
import CardImage from "../common/CardImage";
import EmptyCardSlot from "../common/EmptyCardSlot";
import { GameContext } from "../../game/GameContext";

const PlayerDeck = () => {
  const { player } = useContext(GameContext);
  if (!player) {
    throw new Error("cannot render hit bar before game start");
  }
  const { deck } = player;
  return (
    <div>{deck.length ? <CardImage card={deck[0]} /> : <EmptyCardSlot />}</div>
  );
};

export default PlayerDeck;
