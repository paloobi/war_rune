import { Card } from "../game/types/card";
import { GameStage, GameState } from "../game/types/game";
import { Player } from "../game/types/player";
import { ACTION_DELAY } from "../game/utils";
import CardImage from "./CardImage";

const PlayerCardButton = ({
  card,
  cardIndex,
  player,
  game,
}: {
  card: Card;
  cardIndex: number;
  player: Player;
  game: GameState;
}) => {
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
  );
};

export default PlayerCardButton;
