import { Card } from "../game/types/card";
import CardImage from "./CardImage";
import { GameStage, GameState } from "../game/types/game";
import { ACTION_DELAY } from "../game/utils";
import { act } from "react-dom/test-utils";

const PlayerDebugInfo = ({
  game,
  playerNumber,
}: {
  game: GameState;
  playerNumber: "one" | "two";
}) => {
  const player = game.players[playerNumber];

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
      <div>
        {player.selectedCard ? (
          <CardImage card={player.selectedCard} />
        ) : (
          <p>No card selected</p>
        )}
      </div>

      <h3>War Sacrifices</h3>
      <div>
        {player.war.sacrifices.length ? (
          player.war.sacrifices.map((card: Card) => (
            <CardImage key={`${card.rank}_${card.suit}`} card={card} />
          ))
        ) : (
          <p>No tie yet, no sacrifice cards selected</p>
        )}
      </div>

      <h3>War Hero</h3>
      <div>
        {player.war.hero ? (
          <CardImage card={player.war.hero} />
        ) : (
          <p>No war hero selected</p>
        )}
      </div>

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
                  Rune.actions.scoreCards();
                  setTimeout(() => {
                    Rune.actions.joker();
                    // draw cards after a delay
                    setTimeout(() => { 
                      Rune.actions.drawCards()
                    }, ACTION_DELAY) //
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
        )}
      </div>

      <h3>Deck</h3>

      <div>{player.deck.length}</div>  

      <div>
        {player.deck.map((card: Card) => (
          <CardImage key={`${card.rank}_${card.suit}`} card={card} />
        ))}
      </div>
    </div>
  );
};

export default PlayerDebugInfo;
