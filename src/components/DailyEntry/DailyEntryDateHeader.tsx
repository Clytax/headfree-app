// components/DailyEntry/DailyEntryDateHeader.tsx
import React, { useCallback, useState } from "react";
import { Platform, View, TouchableOpacity } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants";
import { addDays, isSameDay, toISODate } from "@/utils/date/iso";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

type Props = {
  date: Date;
  onChange: (d: Date) => void;
};

const DailyEntryDateHeader: React.FC<Props> = ({ date, onChange }) => {
  const [iosOpen, setIosOpen] = useState(false);
  const today = new Date();

  const go = useCallback(
    (delta: number) => {
      onChange(addDays(date, delta));
    },
    [date, onChange]
  );

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value: date,
        onChange: (_, selected) => selected && onChange(selected),
      });
    } else {
      setIosOpen(true);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => go(-1)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ChevronLeft size={24} color={Colors.textDark} />
      </TouchableOpacity>

      <TouchableOpacity onPress={openPicker} style={{ alignItems: "center" }}>
        <Text fontWeight="bold">{toISODate(date)}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <CalendarIcon size={16} color={Colors.neutral400} />
          <Text color={Colors.neutral400}>(tap to pick)</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => go(1)}
        disabled={isSameDay(date, today)}
        style={{ opacity: isSameDay(date, today) ? 0.4 : 1 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ChevronRight size={24} color={Colors.textDark} />
      </TouchableOpacity>

      {Platform.OS === "ios" && iosOpen && (
        <DateTimePicker
          mode="date"
          value={date}
          onChange={(_, selected) => {
            setIosOpen(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
};

export default DailyEntryDateHeader;
