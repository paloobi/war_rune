/* eslint-disable no-case-declarations */
import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import { GameStage } from "../../game/types/game";
import TableSelect from "./TableSelect";
import TableReveal from "./TableReveal";
import TableScore from "./TableScore";
import TableWarSelect from "./TableWarSelect";
import TableWarReveal from "./TableWarReveal";
import TableWarScore from "./TableWarScore";

const TableContents = () => {
  const { game, player, opponent } = useContext(GameContext);
  if (!game || !player || !opponent) {
    throw new Error("Cannot render TableContents before game has started");
  }
  switch (game.stage) {
    case GameStage.Shuffle:
      return <>Shuffling...</>;
    case GameStage.Deal:
    case GameStage.Draw:
      return <>Dealing...</>;
    case GameStage.Select:
      return <TableSelect />;
    case GameStage.Reveal:
      return <TableReveal />;
    case GameStage.Score:
      return <TableScore />;
    case GameStage.Discard:
      return <>Cards to the winner...</>;
    case GameStage.WarSelect:
      return <TableWarSelect />;
    case GameStage.WarReveal:
      return <TableWarReveal />;
    case GameStage.WarScore:
      return <TableWarScore />;
  }
};

export default TableContents;
