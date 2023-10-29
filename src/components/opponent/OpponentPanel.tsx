import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import HitPointsBar from "../common/HitPointsBar";
import CardBackImage from "../common/CardBackImage";
import EmptyCardSlot from "../common/EmptyCardSlot";

import "./OpponentPanel.css";

const OpponentPanel = () => {
  const { opponent } = useContext(GameContext);
  if (!opponent) {
    throw new Error("Cannot display opponent info before game has started");
  }

  return (
    <div className="opponentPanel">
      <div className="opponentPanel_deck">
        {opponent.deck.length ? <CardBackImage /> : <EmptyCardSlot />}
      </div>
      <HitPointsBar hp={opponent.hp} label="opponent" />
    </div>
  );
};

export default OpponentPanel;
