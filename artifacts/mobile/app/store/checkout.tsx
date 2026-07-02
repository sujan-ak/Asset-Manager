import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContextSupabase";
import { supabase } from "@/lib/supabase";
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { setInvoicePath } from '@/lib/invoiceStorage';

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, total, clearCart, removeFromCart } = useCart();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_percent: number; id: string } | null>(null);

  const discount = appliedPromo ? Math.round(total * appliedPromo.discount_percent / 100) : 0;
  const finalTotal = total - discount;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const hasPhysical = items.some((i) => i.product.category === "physical");

  // Navigate back automatically when the user removes all items from the cart
  useEffect(() => {
    if (items.length === 0) router.back();
  }, [items.length]);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) {
          setName(data.full_name);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      }
    }
    loadProfile();
  }, [user?.id]);

  async function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoError("");
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('id, code, discount_percent, expiry_at, usage_limit, used_count, is_active')
        .eq('code', code)
        .maybeSingle();

      if (error || !data) { setPromoError('Invalid promo code.'); return; }
      if (!data.is_active) { setPromoError('This promo code is no longer active.'); return; }
      if (data.expiry_at && new Date(data.expiry_at) < new Date()) { setPromoError('This promo code has expired.'); return; }
      if (data.usage_limit !== null && data.used_count >= data.usage_limit) { setPromoError('This promo code has reached its usage limit.'); return; }

      setAppliedPromo({ code: data.code, discount_percent: data.discount_percent, id: data.id });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setPromoError('Failed to validate promo code.');
    } finally {
      setPromoLoading(false);
    }
  }

  async function handleOrder() {
    if (hasPhysical && (!name || !address || !city || !phone)) {
      Alert.alert("Incomplete", "Please fill in all shipping details.");
      return;
    }
    if (!hasPhysical && (!name || !phone)) {
      Alert.alert("Incomplete", "Please fill in your name and phone number.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Authentication Required", "Please log in to place an order.");
      return;
    }

    setLoading(true);
    try {
      // 1. Insert order into the database
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          status: 'completed',
          promo_code: appliedPromo?.code ?? null,
          shipping_address: {
            name,
            address,
            city,
            phone,
          },
          items: items.map(item => ({
            product_id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
          })),
        });

      if (orderError) throw orderError;

      // Increment promo used_count after successful order
      if (appliedPromo) {
        const { data: promoData } = await supabase
          .from('promo_codes')
          .select('used_count')
          .eq('id', appliedPromo.id)
          .single();
        if (promoData) {
          await supabase
            .from('promo_codes')
            .update({ used_count: promoData.used_count + 1 })
            .eq('id', appliedPromo.id);
        }
      }

      // 2. Enroll user in purchased courses
      for (const item of items) {
        try {
          const { data: dbProd } = await supabase
            .from('products')
            .select('is_course, course_id')
            .eq('id', item.product.id)
            .maybeSingle();

          if (dbProd && (dbProd.is_course || dbProd.course_id)) {
            const courseId = dbProd.course_id || item.product.id;
            const { error: enrollError } = await supabase
              .from('enrollments')
              .upsert({
                user_id: user.id,
                course_id: Number(courseId),
                payment_status: 'completed',
                status: 'active',
                enrolled_at: new Date().toISOString(),
              }, { onConflict: 'user_id,course_id' });

            if (enrollError) {
              console.error('[Checkout] Enrollment failed for course:', courseId, enrollError);
            }
          }
        } catch (e) {
          console.error('[Checkout] Error checking course enrollment for product:', item.product.id, e);
        }
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();

      // Generate invoice PDF
      try {
        const orderId = Date.now().toString();
        const invoiceHtml = `
          <!DOCTYPE html><html><head><meta charset="utf-8"/>
          <style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{color:#4F46E5}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border:1px solid #e5e7eb;text-align:left}th{background:#f3f4f6}.total{font-size:18px;font-weight:bold;color:#4F46E5}.footer{margin-top:40px;font-size:12px;color:#9ca3af}</style>
          </head><body>
          <h1>EDODWAJA</h1><p>Invoice</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p><strong>Customer:</strong> ${name}</p>
          <table><thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>
          ${items.map(i => `<tr><td>${i.product.title}</td><td>₹${i.product.price}</td><td>${i.quantity}</td><td>₹${i.product.price * i.quantity}</td></tr>`).join('')}
          </tbody></table>
          <p>Subtotal: ₹${total}</p>
          ${appliedPromo ? `<p style="color:#10B981">Promo (${appliedPromo.code}): -₹${discount}</p>` : ''}
          <p class="total">Total Paid: ₹${finalTotal}</p>
          <div class="footer">Edodwaja · Learn · Explore · Excel</div>
          </body></html>`;
        const { uri } = await Print.printToFileAsync({ html: invoiceHtml, base64: false });
        const dir = `${FileSystem.documentDirectory}invoices/`;
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        const dest = `${dir}invoice_${orderId}.pdf`;
        await FileSystem.moveAsync({ from: uri, to: dest });
        await setInvoicePath(orderId, dest);
      } catch (e) {
        console.error('[Checkout] Invoice generation failed:', e);
      }

      Alert.alert("Order Placed Successfully!", `Your order of ₹${finalTotal} has been recorded.${appliedPromo ? ` You saved ₹${discount}!` : ''}`, [
        { text: "View Orders", onPress: () => router.replace("/store/orders") },
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err: any) {
      console.error('[Checkout] Place order failed:', err);
      Alert.alert("Order Error", err.message || "Failed to place your order. Please try again.");
    } finally {
      setLoading(false);
    }
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
                <Pressable
                  onPress={() => removeFromCart(String(item.product.id))}
                  style={styles.removeBtn}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </Pressable>
              </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Subtotal</Text>
              <Text style={[styles.totalAmount, { color: colors.foreground }]}>₹{total}</Text>
            </View>
            {appliedPromo && (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>Promo ({appliedPromo.code}) -{appliedPromo.discount_percent}%</Text>
                <Text style={styles.discountAmount}>-₹{discount}</Text>
              </View>
            )}
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{finalTotal}</Text>
            </View>
          </View>

          {/* Promo code */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Promo Code</Text>
          {appliedPromo ? (
            <View style={[styles.promoApplied, { backgroundColor: '#DCFCE7', borderColor: '#10B981' }]}>
              <Feather name="check-circle" size={16} color="#10B981" />
              <Text style={styles.promoAppliedText}>{appliedPromo.code} — {appliedPromo.discount_percent}% off applied!</Text>
              <Pressable onPress={() => { setAppliedPromo(null); setPromoCode(''); }} hitSlop={8}>
                <Feather name="x" size={16} color="#6B7280" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.promoRow}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: promoError ? '#DC2626' : colors.border, flex: 1 }]}>
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  value={promoCode}
                  onChangeText={(t) => { setPromoCode(t.toUpperCase()); setPromoError(''); }}
                  placeholder="Enter promo code"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                />
              </View>
              <Pressable
                style={[styles.promoBtn, { backgroundColor: colors.primary, opacity: promoLoading ? 0.7 : 1 }]}
                onPress={handleApplyPromo}
                disabled={promoLoading}
              >
                {promoLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.promoBtnText}>Apply</Text>}
              </Pressable>
            </View>
          )}
          {promoError ? <Text style={styles.promoError}>{promoError}</Text> : null}

          {/* Delivery details or Contact details depending on product type */}
          {hasPhysical ? (
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
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact Details</Text>
              {[
                { label: "Full Name", value: name, setter: setName, placeholder: "Your full name", keyboard: "default" as const },
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
                <Text style={styles.orderBtnText}>Place Order · ₹{finalTotal}</Text>
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
  orderItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  removeBtn: { padding: 4 },
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
  promoRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 4 },
  promoBtn: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12 },
  promoBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  promoApplied: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 4 },
  promoAppliedText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#065F46' },
  promoError: { fontSize: 12, color: '#DC2626', marginTop: 4, marginBottom: 8 },
  discountRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  discountLabel: { fontSize: 13, color: '#10B981', fontWeight: '600' },
  discountAmount: { fontSize: 13, color: '#10B981', fontWeight: '700' },
});
