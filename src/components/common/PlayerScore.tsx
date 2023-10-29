import "./PlayerScore.css";

const PlayerScore = ({
  score,
  className,
}: {
  score: number;
  className?: string;
}) => {
  return (
    <div className={`playerScore ${className}`}>
      <p>{score}</p>
    </div>
  );
};

export default PlayerScore;
