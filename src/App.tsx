import { useEffect } from "react";
import "./App.css";
import { GameStage } from "./game/types/game.ts";
import PlayerDebugInfo from "./components/PlayerDebugInfo.tsx";
import { ACTION_DELAY } from "./game/utils.ts";
import { useDispatch, useSelector } from "react-redux";
import { setGame } from "./redux/gameSlice.ts";
import type { RootState } from "./redux/store.ts";

function App() {
  const { game, player } = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId }) => {
        if (!player && yourPlayerId) {
          dispatch(setGame({ game, playerId: yourPlayerId }));
        } else {
          dispatch(setGame({ game }));
        }
      },
    });
  }, [player, dispatch]);

  if (!game) {
    return <div>Loading...</div>;
  }

  const onDeal = () => {
    Rune.actions.setStage({ stage: GameStage.Deal });

    setTimeout(() => {
      Rune.actions.dealCards();
      setTimeout(() => {
        Rune.actions.drawCards();
      }, ACTION_DELAY);
    }, ACTION_DELAY);
  };

  return (
    <>
      <h1>War</h1>
      {game.stage === GameStage.Start && (
        <button onClick={onDeal}>Deal Cards</button>
      )}
      <div>
        <PlayerDebugInfo />
      </div>
    </>
  );
}

export default App;
