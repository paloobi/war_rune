import { useContext } from "react";
import { Card } from "../../game/types/card";
import { GameStage } from "../../game/types/game";
import CardImage from "../common/CardImage";
import { GameContext } from "../../game/GameContext";

import "./PlayerCardButton.css";

const PlayerCardButton = ({
  card,
  cardIndex,
}: {
  card: Card;
  cardIndex: number;
}) => {
  const { player, game } = useContext(GameContext);

  if (!player || !game) {
    throw new Error(
      "Attempted to render player card before game state instantiated"
    );
  }

  const isSelectDisabled = (): boolean => {
    switch (game.stage) {
      // disable if select and there is already a selected card
      case GameStage.Select:
        return !!player.selectedCard;
      // disable if war select and there is already a hero
      case GameStage.WarSelect:
        return !!player.war.hero;
      default:
        // disable by default
        return true;
    }
  };
  return (
    <button
      className="card_button"
      disabled={isSelectDisabled()}
      key={`${card.rank}_${card.suit}`}
      onClick={() => {
        Rune.actions.selectCard({
          playerId: player.playerNum === 1 ? "one" : "two",
          card,
          cardIndex,
        });
      }}
    >
      <CardImage card={card} />
    </button>
  );
};

export default PlayerCardButton;
