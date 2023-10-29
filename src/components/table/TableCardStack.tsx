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
    <div
      className={`table_cardStack ${showAll ? "showAll" : ""} ${
        isWinner ? "winner" : ""
      } ${isOpponent ? "opponent" : "player"}`}
    >
      {showSelectCard && <CardMaybeSelected card={player.selectedCard} />}
      {showWarCards && <CardMaybeSelected card={player.war.sacrifices[0]} />}
      {showWarCards && player.war.sacrifices[0] && (
        <CardMaybeSelected card={player.war.sacrifices[1]} />
      )}
      {showWarCards && player.war.sacrifices[1] && (
        <CardMaybeSelected card={player.war.hero} />
      )}
    </div>
  );
};

export default TableCardStack;
