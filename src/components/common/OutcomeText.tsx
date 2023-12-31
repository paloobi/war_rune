import "./OutcomeText.css";

const OutcomeText = ({
  contents,
  type = "normal",
}: {
  contents: string;
  type?: "normal" | "damage" | "special" | "heal" | "joker";
}) => {
  return <p className={`outcomeText outcomeText-${type}`}>{contents}</p>;
};

export default OutcomeText;
