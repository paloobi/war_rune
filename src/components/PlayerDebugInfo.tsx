import { Card } from "../game/types/card";
import CardImage from "./CardImage";
import { GameState } from "../game/types/game";
import PlayerCardButton from "./PlayerCardButton";

const PlayerDebugInfo = ({
  game,
  playerNumber,
}: {
  game: GameState;
  playerNumber: "one" | "two";
}) => {
  const player = game.players[playerNumber];

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
            <PlayerCardButton
              player={player}
              game={game}
              cardIndex={index}
              card={card}
            />
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
      <p>
        {player.deck.map((card: Card) => (
          <CardImage key={`${card.rank}_${card.suit}`} card={card} />
        ))}
      </p>
    </div>
  );
};

export default PlayerDebugInfo;
