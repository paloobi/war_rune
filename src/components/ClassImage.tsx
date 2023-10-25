import { CardSuit } from "../game/types/card";
import { NameOfClass } from "../game/types/class";

export interface Class {
    nameOfClass: NameOfClass
    suit: CardSuit
}

const ClassImage = ({ theClass }: {theClass: Class}) => {
  return (
    <img
      className="card_image"
      src={`images/cards/card_${theClass.suit}_suit.png`}
      alt={`Class: ${theClass.suit}`}
    />
  );
};

export default ClassImage;