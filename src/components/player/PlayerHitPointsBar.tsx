import { useContext } from "react";
import { GameContext } from "../../game/GameContext";

const PlayerHitPointsBar = () => {
  const { player } = useContext(GameContext);
  if (!player) {
    throw new Error("cannot render hit bar before game start");
  }
  return <div>{player.hp}</div>;
};

export default PlayerHitPointsBar;
