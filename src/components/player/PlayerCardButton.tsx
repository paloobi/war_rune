import { useContext } from "react";
import { Card } from "../../game/types/card";
import { GameStage } from "../../game/types/game";
import { ACTION_DELAY } from "../../game/utils";
import CardImage from "../common/CardImage";
import { GameContext } from "../../game/GameContext";

import "./PlayerCardButton.css";
import { getSuitFromClass } from "../../game/types/class";

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

  const highlight =
    (player.selectedClass === "knight" &&
      card.suit === getSuitFromClass("knight")) ||
    (player.selectedClass === "mage" && card.suit === getSuitFromClass("mage"));

  return (
    <button
      className={`card_button ${highlight ? "highlight" : ""}`}
      disabled={isSelectDisabled()}
      key={`${card.rank}_${card.suit}`}
      onClick={() => {
        Rune.actions.selectCard({
          playerId: player.playerNum === 1 ? "one" : "two",
          card,
          cardIndex,
        });
        setTimeout(() => {
          // attempt to reveal the cards after a delay
          Rune.actions.revealCards();
          // attempt to score cards after a delay
          setTimeout(() => {
            Rune.actions.scoreCards();
            // attempt to discard cards after a LONG delay
            setTimeout(() => {
              // check for joker phase after a delay
              setTimeout(() => {
                Rune.actions.joker();
                // draw cards after a delay
                setTimeout(() => {
                  Rune.actions.drawCards();
                }, ACTION_DELAY); // delay between joker and draw
              }, ACTION_DELAY * 10); // delay between score and discard
            }, ACTION_DELAY); // delay between discard and joker
          }, ACTION_DELAY); // delay between reveal and score
        }, ACTION_DELAY); // delay between select and reveal
      }}
    >
      <CardImage card={card} />
    </button>
  );
};

export default PlayerCardButton;
