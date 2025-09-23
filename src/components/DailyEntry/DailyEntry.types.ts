export interface DailyEntryChoiceProps {
  title: string;
  description?: string;
  choices: { value: number; label: string }[];
  value: number | null;
  onChange: (v: number | null) => void;
  allowNull?: boolean;
}

export interface DailyEntryDataSourceProps {
  onConnect: () => void;
  onRefresh?: () => void; // new
  onDisconnect?: () => void; // new
  description: string;
  title: string;
  icon?: React.ComponentType<any>;
  usages: string[];
  isConnected?: boolean;
  isLoading?: boolean;
}
