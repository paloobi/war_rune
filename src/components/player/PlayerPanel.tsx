import PlayerDeck from "./PlayerDeck";
import PlayerHand from "./PlayerHand";
import PlayerHitPointsBar from "./PlayerHitPointsBar";
import "./PlayerPanel.css";

const PlayerPanel = () => {
  return (
    <div className="playerPanel">
      <div className="playerPanel_left">
        <PlayerHand />
        <PlayerHitPointsBar />
      </div>
      <div className="playerPanel_deck">
        <PlayerDeck />
      </div>
    </div>
  );
};

export default PlayerPanel;
