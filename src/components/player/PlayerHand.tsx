import { useContext } from "react";
import EmptyCardSlot from "../common/EmptyCardSlot";
import { GameContext } from "../../game/GameContext";
import "./PlayerHand.css";
import PlayerCardButton from "./PlayerCardButton";

const PlayerHand = () => {
  const { player } = useContext(GameContext);
  if (!player) {
    throw new Error("cannot render hit bar before game start");
  }
  const { hand } = player;
  return (
    <div className="playerHand_container">
      {hand.map((card, index) =>
        card ? (
          <PlayerCardButton card={card} cardIndex={index} />
        ) : (
          <EmptyCardSlot />
        )
      )}
    </div>
  );
};

export default PlayerHand;
