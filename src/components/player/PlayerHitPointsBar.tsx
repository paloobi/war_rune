import { Player } from "../../game/types/player";

const PlayerHitPointsBar = ({ player }: { player: Player }) => {
  return <div>{player.hp}</div>;
};

export default PlayerHitPointsBar;
