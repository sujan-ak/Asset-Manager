import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
          <Feather name="mail" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {sent ? (
          <View style={[styles.successBox, { backgroundColor: "#DCFCE7" }]}>
            <Feather name="check-circle" size={18} color="#16A34A" />
            <Text style={styles.successText}>Reset link sent! Please check your email inbox.</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.btn, { backgroundColor: colors.primary, opacity: pressed || !email ? 0.8 : 1 }]}
              onPress={handleReset}
              disabled={loading || !email}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Link</Text>}
            </Pressable>
          </View>
        )}

        <Pressable onPress={() => router.push("/(auth)/login")} style={styles.backToLogin}>
          <Text style={[styles.backToLoginText, { color: colors.primary }]}>Back to Sign In</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { marginBottom: 32, width: 40 },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  form: { gap: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  btnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
  },
  successText: { fontSize: 14, color: "#16A34A", flex: 1 },
  backToLogin: { alignItems: "center", marginTop: 28 },
  backToLoginText: { fontSize: 15, fontWeight: "600" },
});
