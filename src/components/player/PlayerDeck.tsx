import { Player } from "../../game/types/player";
import CardImage from "../common/CardImage";
import EmptyCardSlot from "../common/EmptyCardSlot";

const PlayerDeck = ({ player }: { player: Player }) => {
  const { deck } = player;
  return (
    <div>{deck.length ? <CardImage card={deck[0]} /> : <EmptyCardSlot />}</div>
  );
};

export default PlayerDeck;
