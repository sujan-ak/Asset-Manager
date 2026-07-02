import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContextSupabase";
import { useColors } from "@/hooks/useColors";
import { setNotificationsEnabled, getNotificationsEnabled, registerForPushNotifications } from "@/lib/notifications";

const NOTIF_SETTINGS = [
  { key: "lessons", label: "New Lessons", sub: "When new content is available" },
  { key: "quiz", label: "Quiz Reminders", sub: "Reminders to take pending quizzes" },
  { key: "streak", label: "Learning Streak", sub: "Daily reminders to keep your streak" },
  { key: "news", label: "News & Updates", sub: "Latest educational news" },
  { key: "offers", label: "Offers & Promotions", sub: "Deals on courses and products" },
  { key: "progress", label: "Progress Reports", sub: "Weekly learning summary" },
];

const NOTIF_STORAGE_KEY = "@edodwaja_notification_prefs";

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [masterEnabled, setMasterEnabled] = useState(true);
  const [masterLoading, setMasterLoading] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_SETTINGS.map((s) => [s.key, true]))
  );
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  async function loadAll() {
    setLoading(true);
    try {
      // Load per-category prefs from AsyncStorage
      const stored = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) setPrefs(JSON.parse(stored));

      // Load master toggle from Supabase
      if (user?.id) {
        const enabled = await getNotificationsEnabled(user.id);
        setMasterEnabled(enabled);
      }

      // Check OS permission status
      if (Platform.OS !== "web") {
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
      }
    } catch (err) {
      console.error("[NotificationsScreen] loadAll error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleMaster(value: boolean) {
    if (!user?.id) return;
    setMasterLoading(true);

    // If enabling, request permission and register token if not yet granted
    if (value && Platform.OS !== "web") {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const token = await registerForPushNotifications(user.id);
        if (!token) {
          // Permission denied — inform user and bail
          Alert.alert(
            "Permission Required",
            "Please enable notifications for EDODWAJA in your device settings.",
            [{ text: "OK" }]
          );
          setMasterLoading(false);
          return;
        }
        setPermissionStatus("granted");
      }
    }

    const { error } = await setNotificationsEnabled(user.id, value);
    if (error) {
      Alert.alert("Error", "Failed to update notification settings. Please try again.");
    } else {
      setMasterEnabled(value);
    }
    setMasterLoading(false);
  }

  async function toggleCategory(key: string) {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (err) {
      console.error("[NotificationsScreen] Failed to save prefs:", err);
    }
  }

  const permissionDenied = permissionStatus !== null && permissionStatus !== "granted" && Platform.OS !== "web";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* OS permission warning */}
          {permissionDenied && (
            <View style={[styles.warningBox, { backgroundColor: "#FEF3C7" }]}>
              <Feather name="alert-triangle" size={16} color="#D97706" />
              <Text style={[styles.warningText, { color: "#92400E" }]}>
                Notifications are disabled in your device settings. Enable them to receive alerts.
              </Text>
            </View>
          )}

          {/* Master toggle */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 }]}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
                <Feather name="bell" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>Push Notifications</Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                  {masterEnabled ? "Notifications are enabled" : "Notifications are disabled"}
                </Text>
              </View>
              {masterLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Switch
                  value={masterEnabled}
                  onValueChange={toggleMaster}
                  trackColor={{ true: colors.primary }}
                  thumbColor="#FFF"
                />
              )}
            </View>
          </View>

          {/* Per-category toggles — dimmed when master is off */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: masterEnabled ? 1 : 0.5 }]}>
            {NOTIF_SETTINGS.map((item, idx) => (
              <React.Fragment key={item.key}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={prefs[item.key]}
                    onValueChange={() => toggleCategory(item.key)}
                    trackColor={{ true: colors.primary }}
                    thumbColor="#FFF"
                    disabled={!masterEnabled || loading}
                  />
                </View>
                {idx < NOTIF_SETTINGS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: { flex: 1, fontSize: 13, lineHeight: 18 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowSub: { fontSize: 12, marginTop: 1 },
  divider: { height: 1, marginLeft: 16 },
});
