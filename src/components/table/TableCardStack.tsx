import { useContext } from "react";
import { Player } from "../../game/types/player";
import CardMaybeSelected from "../common/CardMaybeSelected";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";

import "./TableCardStack.css";
import { isCurrentWinner } from "../../game/utils";

const TableCardStack = ({
  player,
  isOpponent,
}: {
  player: Player;
  isOpponent: boolean;
}) => {
  const { game } = useContext(GameContext);
  if (!game) {
    throw new Error("Cannot show cards before game start");
  }

  const showSelectCard =
    game.stage === GameStage.Select ||
    game.stage === GameStage.WarSelect ||
    game.stage === GameStage.Score ||
    game.stage === GameStage.WarScore ||
    game.stage === GameStage.Reveal ||
    game.stage === GameStage.WarReveal;

  const showWinner =
    game.stage === GameStage.Score ||
    game.stage === GameStage.WarScore ||
    game.stage === GameStage.Reveal ||
    game.stage === GameStage.WarReveal;

  const showWarCards =
    game.stage === GameStage.WarSelect ||
    game.stage === GameStage.WarScore ||
    game.stage === GameStage.WarReveal;

  const showAll =
    game.stage === GameStage.WarScore || game.stage === GameStage.Score;

  const isWinner = showWinner && isCurrentWinner(player, game);

  return (
    <div className={`table_cardStack ${showAll ? "showAll" : ""}`}>
      {showSelectCard && (
        <div
          className={`table_cardStack--card ${
            isWinner && game.stage === GameStage.Score ? "winner" : ""
          } ${isOpponent ? "opponent" : "player"}`}
        >
          <CardMaybeSelected card={player.selectedCard} />
        </div>
      )}
      {showWarCards && <CardMaybeSelected card={player.war.sacrifices[0]} />}
      {showWarCards && player.war.sacrifices[0] && (
        <CardMaybeSelected card={player.war.sacrifices[1]} />
      )}
      {showWarCards && player.war.sacrifices[1] && (
        <div
          className={`table_cardStack--warHero ${
            isWinner && game.stage === GameStage.WarScore ? "winner" : ""
          } ${isOpponent ? "opponent" : "player"}`}
        >
          <CardMaybeSelected card={player.war.hero} />
        </div>
      )}
    </div>
  );
};

export default TableCardStack;
