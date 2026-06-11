import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContextSupabase";
import { useProgress } from "@/context/ProgressContext";
import { useColors } from "@/hooks/useColors";

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { courseProgress } = useProgress();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const enrolledCourses = Array.from(courseProgress.values());
  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((s, c) => s + c.progress, 0) / enrolledCourses.length)
      : 0;

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Learning",
      items: [
        { icon: "book-open", label: "My Courses", onPress: () => router.push("/(tabs)/courses") },
        { icon: "shopping-bag", label: "Store", onPress: () => router.push("/(tabs)/store") },
        { icon: "shopping-cart", label: "My Orders", onPress: () => router.push("/store/orders") },
        { 
          icon: "award", 
          label: "Achievements", 
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert(
              "Achievements 🏆",
              "Your achievements will be displayed here. Complete more courses and lessons to unlock badges and certificates!",
              [{ text: "OK" }]
            );
          }
        },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: "user", label: "Edit Profile", onPress: () => router.push("/profile/edit") },
        { icon: "settings", label: "Settings", onPress: () => router.push("/settings") },
        { icon: "bell", label: "Notifications", onPress: () => router.push("/settings/notifications") },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "help-circle", label: "Help & Support", onPress: () => router.push("/settings/help") },
        { icon: "log-out", label: "Sign Out", onPress: handleLogout, danger: true },
      ],
    },
  ];

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "S";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Profile</Text>

      {/* Avatar card */}
      <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? "Student"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.grade ?? "Student"}</Text>
          </View>
          {user?.school ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.school}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>{enrolledCourses.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Enrolled</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          {avgProgress === 0 ? (
            <>
              <Text style={[styles.statNum, { color: colors.foreground }]}>-</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Start Now</Text>
            </>
          ) : (
            <>
              <Text style={[styles.statNum, { color: colors.foreground }]}>{avgProgress}%</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Avg Progress</Text>
            </>
          )}
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.foreground }]}>3</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Quizzes</Text>
        </View>
      </View>

      {/* Menu sections */}
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {section.items.map((item, idx) => (
              <React.Fragment key={item.label}>
                <Pressable
                  style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={item.onPress}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.danger ? "#FEE2E2" : colors.accent }]}>
                    <Feather name={item.icon as any} size={16} color={item.danger ? "#DC2626" : colors.primary} />
                  </View>
                  <Text style={[styles.menuLabel, { color: item.danger ? "#DC2626" : colors.foreground }]}>
                    {item.label}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
                {idx < section.items.length - 1 && (
                  <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}

      <Text style={[styles.version, { color: colors.mutedForeground }]}>EDODWAJA v1.0.0 · Member since {user?.joinedDate}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26, fontWeight: "800", paddingHorizontal: 20, marginBottom: 16 },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  initials: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  name: { fontSize: 20, fontWeight: "800", color: "#FFF", marginBottom: 2 },
  email: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 12 },
  badges: { flexDirection: "row", gap: 8 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#FFF" },
  statsRow: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 16,
    marginBottom: 24,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  menuCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  menuDivider: { height: 1, marginLeft: 62 },
  version: { textAlign: "center", fontSize: 12, paddingBottom: 8 },
});
