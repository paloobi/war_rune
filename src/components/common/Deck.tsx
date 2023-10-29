import CardBackImage from "./CardBackImage";
import "./CardImage.css";
import EmptyCardSlot from "./EmptyCardSlot";

const Deck = ({ count }: { count: number }) => {
  return count ? <CardBackImage /> : <EmptyCardSlot />;
};

export default Deck;
