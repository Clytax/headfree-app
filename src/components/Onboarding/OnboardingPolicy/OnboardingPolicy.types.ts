export interface OnboardingPolicyCheckProps {
  isActive?: boolean;
  onPress?: () => void;
  label: string;
  description: string;
  required?: boolean;
  accessibilityLabel?: string;
}
