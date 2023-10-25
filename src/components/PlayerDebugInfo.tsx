import { Card } from "../game/types/card";
import CardImage from "./CardImage";
import { GameStage, GameState } from "../game/types/game";
import { ACTION_DELAY } from "../game/utils";

const PlayerDebugInfo = ({
  game,
  playerId,
}: {
  game: GameState;
  playerId: "one" | "two";
}) => {
  const player = game.players[playerId];

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

      <dt>Number of Player Wins</dt>
      <dd>{player.wins}</dd>

      <dt>Hit Points Remaining</dt>
      <dd>{player.hp >= 0 ? player.hp : 0}</dd>

      <dl>
        <dt>Current Selected Card</dt>
        <dd>
          {player.selectedCard ? (
            <CardImage card={player.selectedCard} />
          ) : (
            <p>No card selected</p>
          )}
        </dd>

        <dt>War Sacrifices</dt>
        <dd>
          {player.war.sacrifices.length ? (
            player.war.sacrifices.map((card: Card) => (
              <CardImage key={`${card.rank}_${card.suit}`} card={card} />
            ))
          ) : (
            <p>No tie yet, no sacrifice cards selected</p>
          )}
        </dd>

        <dt>War Hero</dt>
        <dd>
          {player.war.hero ? (
            <CardImage card={player.war.hero} />
          ) : (
            <p>No war hero selected</p>
          )}
        </dd>

        <dt>Current Hand</dt>
        <dd style={{ display: "flex", flexDirection: "row" }}>
          {player.hand.map((card: Card | null, index: number) =>
            card ? (
              <button
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
                    // draw cards after a delay
                    setTimeout(() => Rune.actions.drawCards(), ACTION_DELAY);
                  }, ACTION_DELAY);
                }}
              >
                <CardImage card={card} />
              </button>
            ) : (
              <div
                key={index}
                style={{
                  border: "1px solid darkgray",
                  borderRadius: "4%",
                  width: 96 + 19 + 19,
                  height: 99 + 10 + 9,
                  marginTop: "8px",
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <p>
                  Empty slot <br /> in hand
                </p>
              </div>
            )
          )}
        </dd>

        <dt>Deck</dt>
        <dd>
          {player.deck.map((card: Card) => (
            <CardImage key={`${card.rank}_${card.suit}`} card={card} />
          ))}
        </dd>
      </dl>
    </div>
  );
};

export default PlayerDebugInfo;
