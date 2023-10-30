import { PlayerClass } from "../../game/types/class";
import { MAX_HP } from "../../logic";
import ClassIcon from "../class/ClassIcon";

import "./HitPointsBar.css";

const HitPointsBar = ({
  hp,
  label,
  playerClass,
}: {
  hp: number;
  label: string;
  playerClass?: PlayerClass;
}) => {
  const getClassName = (): string => {
    if (hp < MAX_HP * 0.2) {
      return "hp_bar-low";
    }
    if (hp < MAX_HP / 2) {
      return "hp_bar-mid";
    }
    return "hp_bar-normal";
  };

  return (
    <div className="hp_bar-container">
      <div className="hp_bar-labelContainer">
        <div className="hp_bar-labelContainer--left">
          {playerClass && <ClassIcon playerClass={playerClass} />}
          <label className="hp_bar-label" htmlFor={`hp_bar-${label}`}>
            hp
          </label>
        </div>
        <div className="hp_bar-number">
          {hp > 0 ? hp : 0}/{MAX_HP}
        </div>
      </div>
      <progress
        id={`hp_bar-${label}`}
        className={`hp_bar ${getClassName()}`}
        max={MAX_HP}
        value={hp}
      />
    </div>
  );
};

export default HitPointsBar;
