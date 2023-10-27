import { useContext } from "react";
import { GameContext } from "../game/gameContext";
import { Card } from "../game/types/card";
import { GameStage } from "../game/types/game";
import { ACTION_DELAY } from "../game/utils";
import CardImage from "./CardImage";

const PlayerHand = () => {
  const { game, player } = useContext(GameContext);
  if (!player || !game || game.stage === GameStage.Start) {
    return null;
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

  return player.hand.map((card: Card | null, index: number) =>
    card ? (
      <button
        className="card_button"
        disabled={isSelectDisabled()}
        key={`${card.rank}_${card.suit}`}
        onClick={() => {
          Rune.actions.selectCard({
            playerId: player.playerNum === 1 ? "one" : "two",
            card,
            cardIndex: index,
          });
          setTimeout(() => {
            // attempt to reveal the cards after a delay
            Rune.actions.revealCards();
            setTimeout(() => {
              // attempt to score cards after a delay
              Rune.actions.scoreCards();
              // draw cards after a delay
              setTimeout(() => Rune.actions.drawCards(), ACTION_DELAY);
            }, ACTION_DELAY);
          }, ACTION_DELAY);
        }}
      >
        <CardImage card={card} />
      </button>
    ) : (
      <div key={index} className="card_empty_slot">
        <p>
          Empty slot <br /> in hand
        </p>
      </div>
    )
  );
};

export default PlayerHand;
