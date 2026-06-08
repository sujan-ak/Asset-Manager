import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface PlaybackSpeedSelectorProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: "0.5x" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "Normal" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
];

export function PlaybackSpeedSelector({ currentSpeed, onSpeedChange }: PlaybackSpeedSelectorProps) {
  const colors = useColors();
  const [showMenu, setShowMenu] = useState(false);

  const currentSpeedLabel = SPEED_OPTIONS.find(option => option.value === currentSpeed)?.label || "1x";

  const handleSpeedSelect = async (speed: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSpeedChange(speed);
    setShowMenu(false);
  };

  const toggleMenu = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(!showMenu);
  };

  return (
    <>
      {/* Speed Button */}
      <Pressable style={[styles.speedButton, { borderColor: "rgba(255,255,255,0.3)" }]} onPress={toggleMenu}>
        <Text style={styles.speedButtonText}>{currentSpeedLabel}</Text>
        <Feather 
          name={showMenu ? "chevron-up" : "chevron-down"} 
          size={14} 
          color="#FFF" 
        />
      </Pressable>

      {/* Speed Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={[styles.speedMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.foreground }]}>Playback Speed</Text>
            </View>
            
            {SPEED_OPTIONS.map((option) => {
              const isSelected = option.value === currentSpeed;
              
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.speedOption,
                    isSelected && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => handleSpeedSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      { color: isSelected ? colors.primary : colors.foreground },
                      isSelected && { fontWeight: "600" },
                    ]}
                  >
                    {option.label}
                  </Text>
                  
                  {isSelected && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  speedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    minWidth: 60,
    justifyContent: "center",
  },
  speedButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  speedMenu: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 180,
    maxWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuHeader: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  speedOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  speedOptionText: {
    fontSize: 15,
  },
});