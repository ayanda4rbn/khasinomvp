
import { GameSummary } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface GameSummaryDialogProps {
  open: boolean;
  onClose: () => void;
  summary: GameSummary;
  playerName: string;
}

export const GameSummaryDialog: React.FC<GameSummaryDialogProps> = ({
  open,
  onClose,
  summary,
  playerName,
}) => {
  const navigate = useNavigate();
  
  const getSpadesBonus = (playerSpades: number, aiSpades: number) => {
    if (playerSpades > aiSpades) return "(+2)";
    if (aiSpades > playerSpades) return "";
    if (playerSpades === aiSpades) return "(+1)";
    return "";
  };

  const getAISpadesBonus = (playerSpades: number, aiSpades: number) => {
    if (aiSpades > playerSpades) return "(+2)";
    if (playerSpades > aiSpades) return "";
    if (playerSpades === aiSpades) return "(+1)";
    return "";
  };

  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleSaveScore = () => {
    navigate('/login');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Game Summary</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-bold">{playerName}</h3>
            <p>Cards: {summary.playerScore.cardsCount} {summary.playerScore.cardsCount > summary.aiScore.cardsCount ? "(+2)" : summary.playerScore.cardsCount === summary.aiScore.cardsCount ? "(+1)" : ""}</p>
            <p>Spades: {summary.playerScore.spadesCount} {getSpadesBonus(summary.playerScore.spadesCount, summary.aiScore.spadesCount)}</p>
            <p>Mummy: {summary.playerScore.mummy ? "Yes (+2)" : "No"}</p>
            <p>Spy: {summary.playerScore.spy ? "Yes (+1)" : "No"}</p>
            <p>Aces: {summary.playerScore.aces} (+{summary.playerScore.aces})</p>
            <p className="font-bold">Total: {summary.playerScore.total}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">AI</h3>
            <p>Cards: {summary.aiScore.cardsCount} {summary.aiScore.cardsCount > summary.playerScore.cardsCount ? "(+2)" : summary.aiScore.cardsCount === summary.playerScore.cardsCount ? "(+1)" : ""}</p>
            <p>Spades: {summary.aiScore.spadesCount} {getAISpadesBonus(summary.playerScore.spadesCount, summary.aiScore.spadesCount)}</p>
            <p>Mummy: {summary.aiScore.mummy ? "Yes (+2)" : "No"}</p>
            <p>Spy: {summary.aiScore.spy ? "Yes (+1)" : "No"}</p>
            <p>Aces: {summary.aiScore.aces} (+{summary.aiScore.aces})</p>
            <p className="font-bold">Total: {summary.aiScore.total}</p>
          </div>
        </div>
        <div className="mt-4 text-center font-bold">
          {summary.winner === 'player' ? `${playerName} wins!` :
           summary.winner === 'ai' ? "AI wins!" :
           "It's a tie!"}
        </div>
        <div className="mt-4 flex gap-4 justify-center">
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button onClick={handleSaveScore} variant="secondary">Save Score</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
