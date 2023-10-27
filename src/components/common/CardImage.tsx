import { Card } from "../../game/types/card";

const CardImage = ({ card }: { card: Card }) => {
  return (
    <img
      className="card_image"
      src={`images/cards/card_${
        card.isHidden ? "back" : `${card.suit}_${card.rank}`
      }.png`}
      alt={`Playing Card: ${card.rank} of ${card.suit}`}
    />
  );
};

export default CardImage;
