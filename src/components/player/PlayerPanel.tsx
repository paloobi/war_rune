import { useContext } from "react";
import PlayerHand from "./PlayerHand";
import PlayerHitPointsBar from "./PlayerHitPointsBar";
import { GameContext } from "../../game/GameContext";
import Deck from "../common/Deck";

import "./PlayerPanel.css";

const PlayerPanel = () => {
  const { player } = useContext(GameContext);
  if (!player) {
    throw new Error("Cannot render player info before game start");
  }

  return (
    <div className="playerPanel">
      <div className="playerPanel_left">
        <PlayerHand />
        <PlayerHitPointsBar />
      </div>
      <div className="playerPanel_deck">
        <p>{player.deck.length}</p>
        <Deck count={player.deck.length} />
      </div>
    </div>
  );
};

export default PlayerPanel;
