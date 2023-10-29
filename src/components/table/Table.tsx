import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import TableFeedbackText from "./TableFeedbackText";
import TableCardStack from "./TableCardStack";
import TablePlayerScore from "./TablePlayerScore";

import "./Table.css";

const Table = () => {
  const { game, player, opponent } = useContext(GameContext);
  if (!game || !player || !opponent) {
    throw new Error("Cannot load game table before game is started");
  }

  return (
    <div className="table">
      <TablePlayerScore player={opponent} />
      <TableCardStack player={opponent} />
      <TableFeedbackText />
      <TableCardStack player={player} />
      <TablePlayerScore player={player} />
    </div>
  );
};

export default Table;
