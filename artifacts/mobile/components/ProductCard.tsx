import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Product } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const colors = useColors();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={() => router.push({ pathname: "/store/[id]", params: { id: product.id } })}
    >
      <View style={styles.imageContainer}>
        <Image source={product.thumbnail} style={styles.thumbnail} />
        {product.badge && (
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        )}
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: product.category === "physical" ? colors.accent : colors.muted },
          ]}
        >
          <Feather
            name={product.category === "physical" ? "package" : "file-text"}
            size={12}
            color={product.category === "physical" ? colors.primary : colors.mutedForeground}
          />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.subcategory, { color: colors.mutedForeground }]}>{product.subcategory}</Text>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.ratingRow}>
          <Feather name="star" size={11} color="#F59E0B" />
          <Text style={[styles.rating, { color: colors.mutedForeground }]}> {product.rating}</Text>
          <Text style={[styles.reviews, { color: colors.mutedForeground }]}> ({product.reviews})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>₹{product.price}</Text>
          <Text style={[styles.originalPrice, { color: colors.mutedForeground }]}>₹{product.originalPrice}</Text>
          <View style={[styles.discountBadge, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.discountText, { color: "#16A34A" }]}>{discount}% off</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 12,
  },
  imageContainer: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  categoryIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 10,
    gap: 3,
  },
  subcategory: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 11,
  },
  reviews: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
