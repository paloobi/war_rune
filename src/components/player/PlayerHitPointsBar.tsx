import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import HitPointsBar from "../common/HitPointsBar";

const PlayerHitPointsBar = () => {
  const { player } = useContext(GameContext);
  if (!player) {
    throw new Error("cannot render hit bar before game start");
  }
  const playerClass = player.selectedClass;
  return (
    <HitPointsBar
      hp={player.hp}
      label={"player"}
      playerClass={playerClass ?? undefined}
    />
  );
};

export default PlayerHitPointsBar;
