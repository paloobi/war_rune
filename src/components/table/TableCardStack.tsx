import { useContext } from "react";
import { Player } from "../../game/types/player";
import CardMaybeSelected from "../common/CardMaybeSelected";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";

const TableCardStack = ({ player }: { player: Player }) => {
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

  const showWarCards =
    game.stage === GameStage.WarSelect ||
    game.stage === GameStage.WarScore ||
    game.stage === GameStage.WarReveal;

  return (
    <div>
      {showSelectCard && <CardMaybeSelected card={player.selectedCard} />}
      {showWarCards && (
        <>
          {player.war.sacrifices.map((card) => (
            <CardMaybeSelected card={card} />
          ))}
          {<CardMaybeSelected card={player.war.hero} />}
        </>
      )}
    </div>
  );
};

export default TableCardStack;
