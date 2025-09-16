export interface DailyTipProps {
  icon?: React.ReactNode;
  description: string;
  index: number;
  setIndex?: (index: number) => void;
  totalTips: number;
}
