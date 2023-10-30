import { useContext } from "react";
import { GameContext } from "../../game/GameContext";
import TableFeedbackText from "./TableFeedbackText";
import TableCardStack from "./TableCardStack";

import "./Table.css";
import TablePlayerScore from "./TablePlayerScore";

const Table = () => {
  const { game, player, opponent } = useContext(GameContext);
  if (!game || !player || !opponent) {
    throw new Error("Cannot load game table before game is started");
  }

  return (
    <>
      <div className="table">
        <div className="table_playerInfo">
          <TablePlayerScore
            className={"playerInfo-opponent--score"}
            player={opponent}
          />
          <TableCardStack player={opponent} isOpponent={true} />
        </div>
        <div className="table_playerInfo">
          <TableCardStack player={player} isOpponent={false} />
          <TablePlayerScore
            className={"playerInfo-player--score"}
            player={player}
          />
        </div>
      </div>
      <div className="feedbackText">
        <TableFeedbackText />
      </div>
    </>
  );
};

export default Table;
