import PlayerDeck from "./PlayerDeck";
import PlayerHand from "./PlayerHand";
import PlayerHitPointsBar from "./PlayerHitPointsBar";

const PlayerPanel = () => {
  return (
    <>
      <PlayerHitPointsBar />
      <PlayerDeck />
      <PlayerHand />
    </>
  );
};

export default PlayerPanel;
