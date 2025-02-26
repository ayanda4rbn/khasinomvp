
import { Card, BuildType } from '@/types/game';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number, isPlayerTurn: boolean) => {
  if (!isPlayerTurn) {
    e.preventDefault();
    return;
  }
  e.dataTransfer.setData('text/plain', index.toString());
};

const DriftDialog = ({ 
  onConfirm, 
  onCancel, 
  open 
}: { 
  onConfirm: () => void; 
  onCancel: () => void; 
  open: boolean;
}) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogTitle>Drift Option</AlertDialogTitle>
      <AlertDialogDescription>
        You have another card of the same value. Would you like to drift (leave the cards on the table)?
      </AlertDialogDescription>
      <div className="flex justify-end space-x-2">
        <AlertDialogCancel onClick={onCancel}>No, take cards</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Yes, drift</AlertDialogAction>
      </div>
    </AlertDialogContent>
  </AlertDialog>
);

export const handleBuildCapture = (
  card: Card,
  build: BuildType,
  playerHand: Card[],
  cardIndex: number,
  setPlayerChowedCards: (cards: Card[]) => void,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[],
  playerChowedCards: Card[]
) => {
  // Check if player has another card of the same value
  const hasAnotherSameValueCard = playerHand.some((c, i) => 
    i !== cardIndex && c.value === card.value
  );

  if (hasAnotherSameValueCard) {
    // Show drift dialog
    const driftDialog = document.createElement('div');
    document.body.appendChild(driftDialog);

    const cleanup = () => {
      document.body.removeChild(driftDialog);
    };

    const handleConfirmDrift = () => {
      // Just remove the card from hand but don't add to chowed cards
      setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
      setIsPlayerTurn(false);
      cleanup();
      toast.success("Drifting with the card!");
    };

    const handleCancelDrift = () => {
      // Normal capture behavior
      const newChowedCards = [...build.cards, card];
      setPlayerChowedCards([...playerChowedCards, ...newChowedCards]);
      setBuilds(builds.filter(b => b.id !== build.id));
      setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
      setIsPlayerTurn(false);
      cleanup();
      toast.success("Cards captured!");
    };

    const root = ReactDOM.createRoot(driftDialog);
    root.render(
      <DriftDialog
        open={true}
        onConfirm={handleConfirmDrift}
        onCancel={handleCancelDrift}
      />
    );
  } else {
    // Normal capture behavior without drift option
    const newChowedCards = [...build.cards, card];
    setPlayerChowedCards([...playerChowedCards, ...newChowedCards]);
    setBuilds(builds.filter(b => b.id !== build.id));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.success("Cards captured!");
  }
};

export const handleBuildAugment = (
  card: Card,
  build: BuildType,
  playerHand: Card[],
  cardIndex: number,
  hasPlayerBuild: boolean,
  setBuilds: (builds: BuildType[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  builds: BuildType[],
  setPlayerChowedCards: (cards: Card[]) => void
): boolean => {
  const newSum = build.value + card.value;
  
  // Allow augmenting if the player has the capturing card for the new sum
  if (newSum <= 10 && newSum < build.value * 2 && playerHand.some(c => c.value === newSum)) {
    // Add the card to the build and update its value
    const updatedBuild: BuildType = {
      ...build,
      cards: [...build.cards, card],
      value: newSum,
      owner: 'player'
    };

    setBuilds(builds.map(b => b.id === build.id ? updatedBuild : b));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    return true;
  }

  toast.error("Invalid build augmentation!");
  return false;
};

export const handleNewBuild = (
  card: Card,
  tableCard: Card,
  playerHand: Card[],
  cardIndex: number,
  hasPlayerBuild: boolean,
  setBuilds: (builds: BuildType[]) => void,
  setTableCards: (cards: Card[]) => void,
  setPlayerHand: (hand: Card[]) => void,
  setPlayerChowedCards: (cards: Card[]) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  tableCards: Card[],
  builds: BuildType[]
): boolean => {
  if (hasPlayerBuild) {
    toast.error("You cannot create a new build when you have an existing build!");
    return false;
  }

  const buildValue = card.value + tableCard.value;
  if (playerHand.some(c => c.value === buildValue)) {
    // Check if player has more than one card of the same value for capturing
    const sameValueCards = playerHand.filter(c => c.value === buildValue);
    if (sameValueCards.length < 2) {
      toast.error("You need at least one more card to capture this build later!");
      return false;
    }

    const x = Math.random() * 400 + 50;
    const y = Math.random() * 200 + 50;

    const buildCards = [card, tableCard].sort((a, b) => b.value - a.value);

    const newBuild: BuildType = {
      id: Date.now(),
      cards: buildCards,
      value: buildValue,
      position: { x, y },
      owner: 'player'
    };

    setBuilds([...builds, newBuild]);
    setTableCards(tableCards.filter(c => c !== tableCard));
    setPlayerHand(playerHand.filter((_, i) => i !== cardIndex));
    setIsPlayerTurn(false);
    toast.info("You created a build!");
    return true;
  }
  return false;
};
