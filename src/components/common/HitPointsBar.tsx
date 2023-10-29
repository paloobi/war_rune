import { MAX_HP } from "../../logic";
import "./HitPointsBar.css";

const HitPointsBar = ({ hp, label }: { hp: number; label: string }) => {
  console.log(hp);
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
      <label className="hp_bar-label" htmlFor={`hp_bar-${label}`}>
        hp
      </label>
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
