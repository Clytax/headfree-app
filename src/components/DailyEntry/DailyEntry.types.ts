export interface DailyEntryChoiceProps {
  title: string;
  description?: string;
  choices: { value: number; label: string }[];
  value: number | null;
  onChange: (v: number | null) => void;
  allowNull?: boolean;
}

export interface DailyEntryDataSourceProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  onConnect: () => void;
  usages: string[];

  isConnected: boolean;
  isLoading?: boolean;
}
