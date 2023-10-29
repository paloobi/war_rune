import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import TableContents from "./TableContents";

import "./Table.css";

const Table = () => {
  const { game, player, opponent } = useContext(GameContext);
  if (!game || !player || !opponent) {
    throw new Error("Cannot load game table before game is started");
  }

  return (
    <div className="table">
      <TableContents />
    </div>
  );
};

export default Table;
