import { Card } from "../../game/types/card";
import CardImage from "../common/CardImage";
import { GameStage } from "../../game/types/game";
import { ACTION_DELAY } from "../../game/utils";
import { useContext } from "react";
import { GameContext } from "../../game/GameContext";

const PlayerDebugInfo = () => {
  const { game, player } = useContext(GameContext);

  if (!game || !player) {
    throw new Error("Cannot show debug info before game start");
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
    <div className="player_debug_info">
      <h2>Player {player.playerNum} Info</h2>

      <h3>Number of Player Wins</h3>
      <p>{player.wins}</p>

      <h3>Hit Points Remaining</h3>
      <p>{player.hp >= 0 ? player.hp : 0}</p>

      <h3>Current Selected Card</h3>
      <p>
        {player.selectedCard ? (
          <CardImage card={player.selectedCard} />
        ) : (
          <p>No card selected</p>
        )}
      </p>

      <h3>War Sacrifices</h3>
      <p>
        {player.war.sacrifices.length ? (
          player.war.sacrifices.map((card: Card) => (
            <CardImage key={`${card.rank}_${card.suit}`} card={card} />
          ))
        ) : (
          <p>No tie yet, no sacrifice cards selected</p>
        )}
      </p>

      <h3>War Hero</h3>
      <p>
        {player.war.hero ? (
          <CardImage card={player.war.hero} />
        ) : (
          <p>No war hero selected</p>
        )}
      </p>

      <h3>Current Hand</h3>
      <div className="hand_container">
        {player.hand.map((card: Card | null, index: number) =>
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
            <div key={index} className="card_empty_slot_debug">
              <p>
                Empty slot <br /> in hand
              </p>
            </div>
          )
        )}
      </div>

      <h3>Deck</h3>
      <p>
        {player.deck.map((card: Card) => (
          <CardImage key={`${card.rank}_${card.suit}`} card={card} />
        ))}
      </p>
    </div>
  );
};

export default PlayerDebugInfo;
