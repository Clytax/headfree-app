export interface DailyEntryChoiceProps {
  title: string;
  description?: string;
  choices: { value: number; label: string }[];
  value: number | null;
  onChange: (v: number | null) => void;
  allowNull?: boolean;
}

type Props = {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  usages?: string[];
  isConnected?: boolean;
  isLoading?: boolean;
  onConnect?: () => void;
  onRefresh?: () => void;
  onDisconnect?: () => void;
  onManualEntry?: () => void; // new prop for manual entry button
  children?: React.ReactNode; // important: render children inside the card
};
