import { Player } from "../../game/types/player";
import CardImage from "../common/CardImage";
import EmptyCardSlot from "../common/EmptyCardSlot";

const PlayerHand = ({ player }: { player: Player }) => {
  const { hand } = player;
  return (
    <div>
      {hand.map((card) =>
        card ? (
          <CardImage card={card} key={`${card.rank}-${card.suit}`} />
        ) : (
          <EmptyCardSlot />
        )
      )}
    </div>
  );
};

export default PlayerHand;
