import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const NOTIF_SETTINGS = [
  { key: "lessons", label: "New Lessons", sub: "When new content is available" },
  { key: "quiz", label: "Quiz Reminders", sub: "Reminders to take pending quizzes" },
  { key: "news", label: "News & Updates", sub: "Latest educational news" },
  { key: "offers", label: "Offers & Promotions", sub: "Deals on courses and products" },
  { key: "progress", label: "Progress Reports", sub: "Weekly learning summary" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_SETTINGS.map((s) => [s.key, true]))
  );
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function toggle(key: string) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {NOTIF_SETTINGS.map((item, idx) => (
            <React.Fragment key={item.key}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                </View>
                <Switch
                  value={prefs[item.key]}
                  onValueChange={() => toggle(item.key)}
                  trackColor={{ true: colors.primary }}
                  thumbColor="#FFF"
                />
              </View>
              {idx < NOTIF_SETTINGS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowSub: { fontSize: 12, marginTop: 1 },
  divider: { height: 1, marginLeft: 16 },
});
