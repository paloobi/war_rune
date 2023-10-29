import { Card } from "../../game/types/card";
import { useContext } from "react";
import CardImage from "../common/CardImage";
import PlayerCardButton from "../player/PlayerCardButton";
import { GameContext } from "../../game/GameContext";

const PlayerDebugInfo = () => {
  const { game, player } = useContext(GameContext);

  if (!game || !player) {
    throw new Error("Cannot show debug info before game start");
  }

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
            <PlayerCardButton cardIndex={index} card={card} />
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
