import { Card } from "../game/types/card";

const CardImage = ({ card }: { card: Card }) => {
  return (
    <img
      width={80}
      height={80}
      src={`images/cards/card_${card.suit}_${card.rank}.png`}
      alt={`Playing Card: ${card.rank} of ${card.suit}`}
    />
  );
};

export default CardImage;
