import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContextSupabase";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchAndMarkRead();
  }, [user?.id]);

  async function fetchAndMarkRead() {
    setIsLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, read, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    setNotifications(data ?? []);
    setIsLoading(false);

    // Mark all unread as read
    const unreadIds = (data ?? []).filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);
    }
  }

  function formatDate(iso: string) {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="bell-off" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 24 }}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          renderItem={({ item }) => (
            <View style={[styles.item, { backgroundColor: item.read ? colors.background : colors.card }]}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + "1A" }]}>
                <Feather name="bell" size={18} color={colors.primary} />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemRow}>
                  <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.itemBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={[styles.itemTime, { color: colors.mutedForeground }]}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", textAlign: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "600" },
  separator: { height: 1 },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemContent: { flex: 1, gap: 3 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  itemBody: { fontSize: 13, lineHeight: 18 },
  itemTime: { fontSize: 11, marginTop: 2 },
});
