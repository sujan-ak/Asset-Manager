import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface LessonStateIndicatorProps {
  state: "completed" | "current" | "locked" | "available";
  size?: "small" | "medium" | "large";
}

export function LessonStateIndicator({ state, size = "medium" }: LessonStateIndicatorProps) {
  const colors = useColors();

  const getStateConfig = () => {
    switch (state) {
      case "completed":
        return {
          icon: "check-circle" as const,
          iconColor: "#10B981",
          bgColor: "#DCFCE7",
          borderColor: "#10B981",
        };
      case "current":
        return {
          icon: "play-circle" as const,
          iconColor: colors.primary,
          bgColor: colors.accent,
          borderColor: colors.primary,
        };
      case "locked":
        return {
          icon: "lock" as const,
          iconColor: colors.mutedForeground,
          bgColor: colors.muted,
          borderColor: colors.border,
        };
      case "available":
        return {
          icon: "circle" as const,
          iconColor: colors.mutedForeground,
          bgColor: colors.card,
          borderColor: colors.border,
        };
    }
  };

  const sizeConfig = {
    small: { container: 28, icon: 14, border: 1.5 },
    medium: { container: 36, icon: 18, border: 2 },
    large: { container: 44, icon: 22, border: 2 },
  };

  const config = getStateConfig();
  const sizing = sizeConfig[size];

  return (
    <View
      style={[
        styles.container,
        {
          width: sizing.container,
          height: sizing.container,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          borderWidth: sizing.border,
        },
      ]}
    >
      <Feather name={config.icon} size={sizing.icon} color={config.iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
