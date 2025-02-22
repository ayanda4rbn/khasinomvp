
import { GameSummary } from '@/types/game';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Game Summary</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-bold">{playerName}</h3>
            <p>Cards: {summary.playerScore.cardsCount} {summary.playerScore.cardsCount > summary.aiScore.cardsCount ? "(+2)" : ""}</p>
            <p>Spades: {summary.playerScore.spadesCount} {summary.playerScore.spadesCount > summary.aiScore.spadesCount ? "(+1)" : ""}</p>
            <p>Mummy: {summary.playerScore.mummy ? "Yes (+2)" : "No"}</p>
            <p>Spy: {summary.playerScore.spy ? "Yes (+1)" : "No"}</p>
            <p>Aces: {summary.playerScore.aces} (+{summary.playerScore.aces})</p>
            <p className="font-bold">Total: {summary.playerScore.total}</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">AI</h3>
            <p>Cards: {summary.aiScore.cardsCount} {summary.aiScore.cardsCount > summary.playerScore.cardsCount ? "(+2)" : ""}</p>
            <p>Spades: {summary.aiScore.spadesCount} {summary.aiScore.spadesCount > summary.playerScore.spadesCount ? "(+1)" : ""}</p>
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
      </DialogContent>
    </Dialog>
  );
};
