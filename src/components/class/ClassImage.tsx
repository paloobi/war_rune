import { PlayerClass, getSuitFromClass } from "../../game/types/class";

const ClassImage = ({ playerClass }: { playerClass: PlayerClass }) => {
  const classSuit = getSuitFromClass(playerClass);

  return (
    <img
      className="card_image"
      src={`images/cards/card_${classSuit}_suit.png`}
      alt={`Class: ${playerClass}`}
    />
  );
};

export default ClassImage;
