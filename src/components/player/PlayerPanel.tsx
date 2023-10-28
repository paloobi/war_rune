import { Player } from "../../game/types/player";

import PlayerDeck from "./PlayerDeck";
import PlayerHand from "./PlayerHand";
import PlayerHitPointsBar from "./PlayerHitPointsBar";

const PlayerPanel = ({ player }: { player: Player }) => {
  return (
    <>
      <PlayerHitPointsBar player={player} />
      <PlayerDeck player={player} />
      <PlayerHand player={player} />
    </>
  );
};

export default PlayerPanel;
