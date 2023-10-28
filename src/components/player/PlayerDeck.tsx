import { Player } from "../../game/types/player";
import CardImage from "../common/CardImage";

const PlayerDeck = ({ player }: { player: Player }) => {
  const { deck } = player;
  return (
    <div>
      {deck.map((card) =>
        card ? (
          <CardImage card={card} key={`${card.rank}-${card.suit}`} />
        ) : null
      )}
    </div>
  );
};

export default PlayerDeck;
