import { PlayerClass, getSuitFromClass } from "../../game/types/class";

import "./ClassIcon.css";

const ClassIcon = ({ playerClass }: { playerClass: PlayerClass }) => {
  const classSuit = getSuitFromClass(playerClass);

  return (
    <img
      className="class_icon"
      src={`images/cards/other_suit_${classSuit}.png`}
      alt={`Class Icon: ${playerClass}`}
    />
  );
};

export default ClassIcon;
