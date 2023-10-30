import "./PlayerScore.css";

const PlayerScore = ({
  score,
  className,
}: {
  score: number;
  className?: string;
}) => {
  if (isNaN(score)) {
    return null;
  } 
  return (
    <div className={`playerScore ${className}`}>
      <p>{score}</p>
    </div>
  );
}

export default PlayerScore;
