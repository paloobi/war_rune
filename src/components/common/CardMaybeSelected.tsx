import { Card } from "../../game/types/card";
import CardImage from "./CardImage";
import EmptyCardSlot from "./EmptyCardSlot";

const CardMaybeSelected = ({ card }: { card: Card | null }) =>
  card ? <CardImage card={card} /> : <EmptyCardSlot />;

export default CardMaybeSelected;
