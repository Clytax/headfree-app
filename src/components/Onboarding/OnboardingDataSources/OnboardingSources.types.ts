export interface OnboardingDataSourceProps {
  id: string;
  title: string;
  subtitle: string;

  usages: string[];

  onConnect: () => void;
  connectText: string;

  required?: boolean;

  connected?: boolean;

  icon?: React.ElementType;
}
