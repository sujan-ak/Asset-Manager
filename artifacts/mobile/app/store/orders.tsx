import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContextSupabase";
import { supabase } from "@/lib/supabase";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { getInvoicePath } from '@/lib/invoiceStorage';

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invoicePaths, setInvoicePaths] = useState<Record<string, string>>({});
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Orders] Error fetching orders:', error);
          return;
        }

        if (data) {
          const mapped = data.map((order: any) => {
            let itemsList: any[] = [];
            try {
              itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            } catch (e) {
              itemsList = Array.isArray(order.items) ? order.items : [];
            }
            const dateObj = new Date(order.created_at);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            return {
              id: String(order.id),
              date: dateStr,
              status: order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Processing',
              items: itemsList.map((i: any) => i.title || "Untitled Product"),
              total: Number(order.total_amount) || 0,
            };
          });
          setOrders(mapped);

          // Load invoice paths for each order
          const paths: Record<string, string> = {};
          await Promise.all(mapped.map(async (o: any) => {
            const p = await getInvoicePath(o.id);
            if (p) {
              if (Platform.OS === 'web' || p.startsWith('html:')) {
                paths[o.id] = p;
              } else {
                try {
                  const info = await FileSystem.getInfoAsync(p);
                  if (info && info.exists) paths[o.id] = p;
                } catch (err) {
                  console.warn('Error reading file info:', err);
                }
              }
            }
          }));
          setInvoicePaths(paths);
        }
      } catch (err) {
        console.error('[Orders] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [user?.id]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleRefundRequest = (orderId: string) => {
    Alert.alert(
      'Request Refund',
      'Please briefly describe your reason for requesting a refund.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            if (!user?.id) return;
            const { error } = await supabase
              .from('refund_requests')
              .insert({ user_id: user.id, order_id: orderId, status: 'pending' });
            if (error) {
              Alert.alert('Error', 'Failed to submit refund request. Please try again.');
            } else {
              Alert.alert('Submitted', 'Your refund request has been submitted. Our team will review it shortly.');
            }
          },
        },
      ]
    );
  };

  const handleShareInvoice = async (orderId: string) => {
    const path = invoicePaths[orderId];
    if (!path) { Alert.alert('No invoice', 'Invoice not available for this order.'); return; }
    setSharingId(orderId);
    try {
      if (Platform.OS === 'web' || path.startsWith('html:')) {
        const htmlContent = path.startsWith('html:') ? path.substring(5) : path;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        } else {
          Alert.alert('Popup Blocked', 'Please allow popups to print/download the invoice.');
        }
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Download Invoice' });
      } else {
        Alert.alert('Saved', `Invoice at:\n${path}`);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not share invoice.');
    } finally {
      setSharingId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 14, color: colors.mutedForeground, fontWeight: "500" }}>Loading...</Text>
      </View>
    );
  }

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
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.orderHeader}>
                <Text style={[styles.orderId, { color: colors.mutedForeground }]}>Order #{order.id.toUpperCase()}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: (order.status === "Delivered" || order.status === "Completed") ? "#DCFCE7" : "#FEF3C7" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: (order.status === "Delivered" || order.status === "Completed") ? "#16A34A" : "#D97706" },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{order.date}</Text>
              {order.items.map((item: string, i: number) => (
                <Text key={i} style={[styles.item, { color: colors.foreground }]}>
                  · {item}
                </Text>
              ))}
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total Paid</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>₹{order.total}</Text>
              </View>
              {invoicePaths[order.id] && (
                <Pressable
                  style={[styles.invoiceBtn, { borderColor: colors.border }]}
                  onPress={() => handleShareInvoice(order.id)}
                  disabled={sharingId === order.id}
                >
                  <Feather name="download" size={14} color={colors.primary} />
                  <Text style={[styles.invoiceBtnText, { color: colors.primary }]}>
                    {sharingId === order.id ? 'Opening...' : 'Download Invoice'}
                  </Text>
                </Pressable>
              )}
              {order.status === 'Completed' && (
                <Pressable
                  style={[styles.refundBtn, { borderColor: '#FCA5A5' }]}
                  onPress={() => handleRefundRequest(order.id)}
                >
                  <Feather name="rotate-ccw" size={14} color="#DC2626" />
                  <Text style={[styles.refundBtnText]}>Request Refund</Text>
                </Pressable>
              )}
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
  invoiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  invoiceBtnText: { fontSize: 13, fontWeight: '600' },
  refundBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', backgroundColor: '#FEF2F2' },
  refundBtnText: { fontSize: 13, fontWeight: '600', color: '#DC2626' },
});
