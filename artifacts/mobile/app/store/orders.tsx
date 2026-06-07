import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const MOCK_ORDERS = [
  {
    id: "ord1",
    date: "Jun 2, 2026",
    status: "Delivered",
    items: ["Arduino Robotics Starter Kit"],
    total: 2999,
  },
  {
    id: "ord2",
    date: "May 15, 2026",
    status: "Processing",
    items: ["Robotics Complete Notes Bundle", "AI/ML Question Bank 2025"],
    total: 698,
  },
];

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Orders</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_ORDERS.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
          </View>
        ) : (
          MOCK_ORDERS.map((order) => (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.orderHeader}>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>Order #{order.id.toUpperCase()}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: order.status === "Delivered" ? "#DCFCE7" : "#FEF3C7" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: order.status === "Delivered" ? "#16A34A" : "#D97706" },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{order.date}</Text>
              {order.items.map((item, i) => (
                <Text key={i} style={[styles.item, { color: colors.foreground }]}>
                  · {item}
                </Text>
              ))}
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total Paid</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{order.total}</Text>
              </View>
            </View>
          ))
        )}
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
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  orderCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, gap: 8 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { fontSize: 13, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  date: { fontSize: 12 },
  item: { fontSize: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, marginTop: 4 },
  totalLabel: { fontSize: 13 },
  totalAmount: { fontSize: 16, fontWeight: "700" },
});
