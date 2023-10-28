import { useContext } from "react";
import CardImage from "../common/CardImage";
import EmptyCardSlot from "../common/EmptyCardSlot";
import { GameContext } from "../../game/GameContext";

const PlayerHand = () => {
  const { player } = useContext(GameContext);
  if (!player) {
    throw new Error("cannot render hit bar before game start");
  }
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