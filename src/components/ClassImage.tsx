import { CardSuit } from "../game/types/card";
import { ClassName } from "../game/types/class";

export interface Class {
    name: ClassName | null
    suit: CardSuit
}

const ClassImage = ({ playerClass }: {playerClass: Class}) => {
  return (
    <img
      className="card_image"
      src={`images/cards/card_${playerClass.suit}_suit.png`}
      alt={`Class: ${playerClass.suit}`}
    />
  );
};

export default ClassImage;