import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/hooks/useColors";

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, total, clearCart } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // TODO: Integrate real payment gateway (Razorpay recommended for India)
  // before production release. Current flow is DEMO ONLY.
  async function handleOrder() {
    if (!name || !address || !city || !phone) {
      Alert.alert("Incomplete", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearCart();
    Alert.alert("Demo Order Placed!", "This is a test order — no payment was charged.", [
      { text: "OK", onPress: () => router.replace("/(tabs)") },
    ]);
  }

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Feather name="shopping-bag" size={48} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
        <Pressable style={[styles.shopBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/(tabs)/store")}>
          <Text style={styles.shopBtnText}>Browse Store</Text>
        </Pressable>
      </View>
    );
  }

  const hasPhysical = items.some((i) => i.product.category === "physical");

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Checkout</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Order summary */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Summary</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.orderItem}>
                <Text style={[styles.orderItemName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.product.title}
                </Text>
                <Text style={[styles.orderItemPrice, { color: colors.primary }]}>
                  ₹{item.product.price} × {item.quantity}
                </Text>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{total}</Text>
            </View>
          </View>

          {/* Delivery details for physical items */}
          {hasPhysical && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Delivery Details</Text>
              {[
                { label: "Full Name", value: name, setter: setName, placeholder: "Your full name", keyboard: "default" as const },
                { label: "Address", value: address, setter: setAddress, placeholder: "Street address", keyboard: "default" as const },
                { label: "City / Pincode", value: city, setter: setCity, placeholder: "City, Pincode", keyboard: "default" as const },
                { label: "Phone", value: phone, setter: setPhone, placeholder: "10-digit mobile number", keyboard: "phone-pad" as const },
              ].map((field) => (
                <View key={field.label} style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.foreground }]}>{field.label}</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: colors.foreground }]}
                      value={field.value}
                      onChangeText={field.setter}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType={field.keyboard}
                    />
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Payment method */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment Method</Text>
          <View style={[styles.demoModeCard, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
            <Feather name="alert-triangle" size={18} color="#92400E" />
            <Text style={[styles.demoModeText, { color: "#92400E" }]}>Demo Mode — No real payment will be processed</Text>
          </View>
          <View style={[styles.paymentCard, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
            <Feather name="credit-card" size={20} color={colors.primary} />
            <Text style={[styles.paymentText, { color: colors.primary }]}>UPI / Debit / Credit Card</Text>
            <Feather name="check-circle" size={18} color={colors.primary} />
          </View>
        </ScrollView>

        {/* Place order */}
        <View
          style={[
            styles.cta,
            { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 20 : insets.bottom + 8 },
          ]}
        >
          <Pressable
            style={[styles.orderBtn, { backgroundColor: colors.primary }]}
            onPress={handleOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.orderBtnText}>Place Order (Demo) · ₹{total}</Text>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: "center", paddingHorizontal: 24, gap: 16 },
  backBtn: { alignSelf: "flex-start", marginBottom: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  shopBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  shopBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginTop: 8, marginBottom: 10 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10, marginBottom: 4 },
  orderItem: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  orderItemName: { fontSize: 14, flex: 1 },
  orderItemPrice: { fontSize: 14, fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalAmount: { fontSize: 18, fontWeight: "800" },
  fieldGroup: { gap: 6, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600" },
  inputWrapper: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 15 },
  demoModeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  demoModeText: { flex: 1, fontSize: 13, fontWeight: "600" },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  paymentText: { flex: 1, fontSize: 15, fontWeight: "600" },
  cta: { padding: 16, borderTopWidth: 1 },
  orderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  orderBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});
