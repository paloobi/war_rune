import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";
import { playerClasses, PlayerClass } from "../../game/types/class";
import ClassImage from "./ClassImage";

import "./ClassSelect.css";

const ClassSelect = () => {
  const { game, player } = useContext(GameContext);
  if (!game || !player) {
    throw new Error("Cannot select class before Rune Game started");
  }

  const opposingPlayer =
    player === game.players.one ? game.players.two : game.players.one;

  const isClassSelectDisabled = (playerClass: PlayerClass): boolean => {
    // disable if class select and there is already a class
    if (game.stage === GameStage.ClassSelect) {
      return opposingPlayer.selectedClass === playerClass;
    } else {
      return true;
    }
  };

  return (
    <>
      <h3>Select Class</h3>
      <div className="class_container">
        {!player.selectedClass ? (
          playerClasses.map((playerClass) => {
            if ((playerClass === "mage" || playerClass === "knight") && playerClass !== opposingPlayer.selectedClass) {
              return (
                <div>
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
                  <p style={{ marginBottom: 24, marginTop: 0 }}>
                    {playerClass}
                    <br />
                    <small>
                      {playerClass === "mage" && <>+5 damage</>}
                      {playerClass === "knight" && <>trigger wars</>}
                    </small>
                  </p>
                </div>
              );
            }
          })
        ) : (
          <p>{player.selectedClass}</p>
        )}
      </div>
    </>
  );
};

export default ClassSelect;
