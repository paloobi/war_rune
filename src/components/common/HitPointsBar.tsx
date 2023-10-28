import { MAX_HP } from "../../logic";
import "./HitPointsBar.css";

const HitPointsBar = ({ hp, label }: { hp: number; label: string }) => {
  return (
    <>
      <label htmlFor={`hp_bar-${label}`}>HP</label>
      <progress id={`hp_bar-${label}`} max={MAX_HP} value={hp}>
        70%
      </progress>
    </>
  );
};

export default HitPointsBar;
