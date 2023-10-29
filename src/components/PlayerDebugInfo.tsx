import { Card } from "../game/types/card";
import CardImage from "./CardImage";
import { GameStage } from "../game/types/game";
import { ACTION_DELAY } from "../game/utils";
import PlayerCardButton from "./PlayerCardButton";
import { useContext } from "react";
import { GameContext } from "../game/GameContext";
import { PlayerClass, playerClasses } from "../game/types/class";
import ClassImage from "./ClassImage";

const PlayerDebugInfo = () => {
  const { game, player } = useContext(GameContext);

  if (!game || !player) {
    return null;
  }

  const isClassSelectDisabled = (playerClass: PlayerClass): boolean => {
    // disable if class has already been selected
    if (game.stage === GameStage.ClassSelect) {
      if (player.playerNum === 1) {
        return game.players.two.selectedClass === playerClass;
      } else {
        return game.players.one.selectedClass === playerClass;
      }
    } else {
      return true;
    }
  };

  const isClericAbilityDisabled = (): boolean => {
    if (game.stage === GameStage.ClericAbility) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <div className="player_debug_info">
      <h2>Player {player.playerNum} Info</h2>

      <h3>Number of Player Wins</h3>
      <p>{player.wins}</p>

      <h3>Class</h3>
      <div className="class_container">
        {game.stage === GameStage.ClassSelect ? (
          playerClasses.map((playerClass) => {
            // FOR NOW, ONLY ONLY MAGE AND KNIGHT BECAUSE OTHER CLASSES NOT STABLE
            if (playerClass === "knight" || playerClass === "mage") {
              return (
                <button
                  className="class_button"
                  disabled={isClassSelectDisabled(playerClass)}
                  key={playerClass}
                  onClick={() => {
                    Rune.actions.selectClass(playerClass);
                  }}
                >
                  <ClassImage playerClass={playerClass} />
                </button>
              )
            }
          }
            
          )
        ) : (
          <p>{player.selectedClass}</p>
        )}
      </div>

      <div className="ability_buttons_container">
        {/* Cleric buttons for healing or not */}
        {/* TODO: These buttons only appearing during war and pressing them does nothing (probably because stage is undefined) */}
        {player.selectedClass === "cleric" &&
          game.stage === GameStage.ClericAbility && (
            <>
              <button
                type="button"
                className="cleric_ability_button"
                disabled={isClericAbilityDisabled()}
                onClick={() => {
                  Rune.actions.useClericAbility();
                  setTimeout(() => {
                    Rune.actions.revealCards();
                    setTimeout(() => {
                      Rune.actions.scoreCards()
                      setTimeout(() => Rune.actions.drawCards(), ACTION_DELAY);
                    }, ACTION_DELAY);
                  }, ACTION_DELAY);
                }}
              >
                Heal HP
              </button>

              <button
                type="button"
                className="cleric_ability_button"
                disabled={isClericAbilityDisabled()}
                onClick={() => {
                  Rune.actions.doNotUseClericAbility();
                  setTimeout(() => {
                    Rune.actions.revealCards();
                    setTimeout(() => {
                      Rune.actions.scoreCards()
                      setTimeout(() => Rune.actions.drawCards(), ACTION_DELAY);
                    }, ACTION_DELAY);
                  }, ACTION_DELAY);

                }}
              >
                Deal Damage
              </button>
            </>
          )}

        {/* Rogue buttons for stealing cards */}
        {player.selectedClass === "rogue" && game.stage === GameStage.Steal && (
          <>
            <button
              type="button"
              className="rogue_ability_button"
              onClick={() => {
                Rune.actions.stealCard({
                  playerId: player.playerNum === 1 ? "one" : "two",
                  index: 0,
                });
                setTimeout(() => Rune.actions.drawCards(), ACTION_DELAY);
              }}
            >
              <CardImage card={{
                suit: player.rogueStealCardOptions[0].suit,
                rank: player.rogueStealCardOptions[0].rank,
                isHidden: false}} />
            </button>
            <button
              type="button"
              className="rogue_ability_button"
              onClick={() => {
                Rune.actions.stealCard({
                  playerId: player.playerNum === 1 ? "one" : "two",
                  index: 1,
                });
                setTimeout(() => Rune.actions.drawCards(), ACTION_DELAY);
              }}
            >
              <CardImage card={{
                suit: player.rogueStealCardOptions[1].suit,
                rank: player.rogueStealCardOptions[1].rank,
                isHidden: false}} />
            </button>
          </>
        )}
      </div>

      <p>
        {player.selectedClass ? (
          <ClassImage playerClass={player.selectedClass} />
        ) : (
          <p>No class selected</p>
        )}
      </p>

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
            <PlayerCardButton cardIndex={index} card={card} />
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
        {player.deck.map((card: Card) => ( //TODO: hide deck again when finished debugging
          <CardImage key={`${card.rank}_${card.suit}`} card={{...card, isHidden:false}} />
        ))}
      </p>
    </div>
  );
};

export default PlayerDebugInfo;
