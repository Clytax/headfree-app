/* eslint-env jest */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";

import Home from "@/app/(main)/(tabs)/(home-stack)";

// ---- Mocks for navigation / routing ----
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/",
  useSegments: () => [],
}));

// ---- Mocks for context / data hooks ----
jest.mock("@/context/auth/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "test-user-id" } }),
}));

jest.mock("@/hooks/firebase/useUser", () => ({
  useUser: () => ({ data: { id: "test-user-id" }, isLoading: false }),
}));

jest.mock("@/hooks/firebase/usePredictions", () => ({
  usePredictions: () => ({ data: [], isLoading: false }),
}));

jest.mock("@/hooks/firebase/useDailyEntry", () => ({
  useYesterdayEntry: () => ({
    hasYesterdayEntry: true,
    yesterdayDate: "2024-01-01",
    yesterdaysEntry: { id: "yesterday-entry-id" },
    isLoading: false,
  }),
}));

// ---- UI-only component mocks ----
jest.mock("@/components/DailyTip/DailyTips", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockDailyTips: React.FC = () => <View testID="mock-daily-tips" />;
  MockDailyTips.displayName = "MockDailyTips";
  return MockDailyTips;
});

jest.mock("@/components/common/Divider/Divider", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const MockDivider: React.FC<any> = (props) => (
    <View>
      <Text>{props.title}</Text>
    </View>
  );
  MockDivider.displayName = "MockDivider";
  return MockDivider;
});

jest.mock("@/components/Outlook/Outlook", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockOutlook: React.FC = () => <View testID="mock-outlook" />;
  MockOutlook.displayName = "MockOutlook";
  return MockOutlook;
});

jest.mock("@/components/Outlook/HomeNoPredictionToday", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockNoPrediction: React.FC = () => <View testID="mock-no-prediction" />;
  MockNoPrediction.displayName = "MockNoPrediction";
  return MockNoPrediction;
});

jest.mock("@/components/Outlook/PredictionHistory", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const MockHistoryModal: React.FC<any> = (props) =>
    props.visible ? (
      <View testID="mock-history-modal">
        <Text>History visible</Text>
      </View>
    ) : null;

  MockHistoryModal.displayName = "MockHistoryModal";
  return MockHistoryModal;
});

// ---- HomeGeneratePrediction mock with a clickable CTA ----
jest.mock("@/components/Outlook/HomeGeneratePrediction", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const MockHomeGeneratePrediction: React.FC<{
    openPredictionModal: () => void;
  }> = ({ openPredictionModal }) => (
    <View>
      <Text
        accessibilityRole="button"
        accessibilityLabel="Generate prediction"
        onPress={openPredictionModal}
      >
        Generate prediction
      </Text>
    </View>
  );

  MockHomeGeneratePrediction.displayName = "MockHomeGeneratePrediction";
  return MockHomeGeneratePrediction;
});

// ---- Bottom sheet mock (Prediction component) ----
jest.mock("@/components/Prediction/", () => {
  const React = require("react");
  const { useState, forwardRef, useImperativeHandle } = React;
  const { View, Text } = require("react-native");

  const MockHomePredictionBottomSheet = forwardRef((props: any, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      present: () => setVisible(true),
      dismiss: () => setVisible(false),
    }));

    if (!visible) return null;

    return (
      <View testID="mock-bottom-sheet">
        <Text>Mock Prediction Bottom Sheet</Text>
      </View>
    );
  });

  MockHomePredictionBottomSheet.displayName = "MockHomePredictionBottomSheet";

  return {
    __esModule: true,
    default: MockHomePredictionBottomSheet,
  };
});

// ---- Icons ----
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const MaterialIcons: React.FC<any> = (props) => <Text>{props.name}</Text>;
  MaterialIcons.displayName = "MaterialIcons";
  return { MaterialIcons };
});

// ---- Safe area ----
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ------------------------------------------------------
// TESTS
// ------------------------------------------------------

describe("Home screen forecast flow", () => {
  it("opens the prediction bottom sheet when the user taps the Generate prediction CTA", async () => {
    const { getByText, queryByTestId } = render(<Home />);

    expect(queryByTestId("mock-bottom-sheet")).toBeNull();

    const generateCta = getByText("Generate prediction");
    fireEvent.press(generateCta);

    await waitFor(() => {
      expect(queryByTestId("mock-bottom-sheet")).not.toBeNull();
    });
  });
});
