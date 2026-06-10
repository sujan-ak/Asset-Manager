import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CourseCard } from "@/components/CourseCard";
import { SearchBar } from "@/components/SearchBar";
import { CATEGORIES, COURSES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { TEXT_STYLES } from "@/constants/typography";

export default function CoursesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("All");

  const filtered = COURSES.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Courses</Text>
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search courses..." />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                  borderColor: activeCategory === cat ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: activeCategory === cat ? "#FFF" : colors.foreground },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
        </Text>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No courses found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Try a different search or category</Text>
          </View>
        ) : (
          filtered.map((course) => <CourseCard key={course.id} course={course} horizontal />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingBottom: 12 },
  pageTitle: { ...TEXT_STYLES.pageTitle, fontSize: 26, fontWeight: "800", paddingHorizontal: 20, marginBottom: 8 },
  categories: { paddingHorizontal: 20, gap: 8, paddingTop: 12 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    transform: [{ scale: 1 }],
  },
  chipText: { ...TEXT_STYLES.button, fontSize: 14, fontWeight: "700" },
  list: { paddingHorizontal: 20, paddingTop: 16, gap: 0 },
  count: { fontSize: 13, marginBottom: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 14 },
});
