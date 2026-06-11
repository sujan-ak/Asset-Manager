import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { NewsCard } from "@/components/NewsCard";
import { SectionHeader } from "@/components/SectionHeader";
import { WatchlistCard } from "@/components/WatchlistCard";
import { LearningStreak } from "@/components/LearningStreak";
import { useAuth } from "@/context/AuthContextSupabase";
import { useProgress } from "@/context/ProgressContext";
import { COURSES, NEWS_ITEMS, PRODUCTS } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";
import { TEXT_STYLES } from "@/constants/typography";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { watchlist, courseProgress } = useProgress();

  const enrolledCourses = Array.from(courseProgress.values());
  const completedCount = enrolledCourses.filter((p) => p.progress === 100).length;
  const inProgressCount = enrolledCourses.filter((p) => p.progress > 0 && p.progress < 100).length;
  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((sum, p) => sum + p.progress, 0) / enrolledCourses.length
        )
      : 0;

  // Mock learning streak (in real app, calculate from user activity)
  const learningStreak = 5;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning 👋</Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name ?? "Student"}</Text>
        </View>
        <Pressable
          style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {}}
        >
          <Feather name="bell" size={20} color={colors.foreground} />
          <View style={[styles.notifDot, { backgroundColor: colors.secondary }]} />
        </Pressable>
      </View>

      {/* Stats Banner */}
      <View style={[styles.statsBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{enrolledCourses.length}</Text>
          <Text style={styles.statLabel}>Courses Enrolled</Text>
        </View>
        <View style={[styles.statDivider]} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Courses Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{avgProgress}%</Text>
          <Text style={styles.statLabel}>Average Progress</Text>
        </View>
      </View>

      {/* Learning Streak */}
      {enrolledCourses.length > 0 && (
        <View style={styles.streakSection}>
          <LearningStreak streak={learningStreak} bestStreak={7} />
        </View>
      )}

      {/* Continue Learning */}
      {watchlist.length > 0 && (
        <View style={styles.section}>
          <SectionHeader 
            title="Continue Watching" 
            subtitle={`${watchlist.length} lesson${watchlist.length > 1 ? 's' : ''} in progress`}
            onSeeAll={() => router.push("/(tabs)/courses")} 
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {watchlist.map((item) => (
              <WatchlistCard key={`${item.courseId}-${item.moduleId}`} item={item} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Courses */}
      <View style={styles.section}>
        <SectionHeader title="Featured Courses" onSeeAll={() => router.push("/(tabs)/courses")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <SectionHeader title="Shop & Learn" onSeeAll={() => router.push("/(tabs)/store")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ScrollView>
      </View>

      {/* Latest News */}
      <View style={styles.section}>
        <SectionHeader title="Latest News" onSeeAll={() => router.push("/(tabs)/news")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {NEWS_ITEMS.slice(0, 3).map((item) => (
            <NewsCard key={item.id} item={item} featured />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 14 },
  userName: { fontSize: 22, fontWeight: "800" },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: 8,
    right: 8,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  statsBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    flexDirection: "row",
    paddingVertical: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: "center", paddingHorizontal: 4 },
  statNumber: { fontSize: 26, fontWeight: "800", color: "#FFF", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.85)", marginTop: 4, textAlign: "center" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  streakSection: { marginHorizontal: 20, marginBottom: 28 },
  section: { marginBottom: 28, paddingHorizontal: 20 },
});
