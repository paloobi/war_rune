import { Card } from "../../game/types/card";
import CardBackImage from "./CardBackImage";
import EmptyCardSlot from "./EmptyCardSlot";

const CardMaybeSelected = ({ card }: { card: Card | null }) => {
  return card ? <CardBackImage /> : <EmptyCardSlot />;
};

export default CardMaybeSelected;
