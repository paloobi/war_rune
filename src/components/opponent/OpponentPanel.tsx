import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import HitPointsBar from "../common/HitPointsBar";
import Deck from "../common/Deck";

import "./OpponentPanel.css";

const OpponentPanel = () => {
  const { opponent } = useContext(GameContext);
  if (!opponent) {
    throw new Error("Cannot display opponent info before game has started");
  }

  return (
    <div className="opponentPanel">
      <div className="opponentPanel_deck">
        <Deck count={opponent.deck.length} />
        <p>{opponent.deck.length}</p>
      </div>
      <HitPointsBar hp={opponent.hp} label="opponent" />
    </div>
  );
};

export default OpponentPanel;
