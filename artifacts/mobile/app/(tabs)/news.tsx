import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NewsCard } from "@/components/NewsCard";
import { SearchBar } from "@/components/SearchBar";
import { NEWS_ITEMS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = NEWS_ITEMS.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>News</Text>
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search news..." />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
          </View>
        ) : (
          filtered.map((item) => <NewsCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingBottom: 12 },
  pageTitle: { fontSize: 26, fontWeight: "800", paddingHorizontal: 20, marginBottom: 4 },
  list: { paddingHorizontal: 20, paddingTop: 16 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
});
