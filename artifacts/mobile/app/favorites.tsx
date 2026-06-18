import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CourseCard } from "@/components/CourseCard";
import { useFavorites } from "@/context/FavoritesContext";
import { COURSES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favoriteCourses, watchLaterLessons, removeFromWatchLater } = useFavorites();
  const [activeTab, setActiveTab] = useState<"favorites" | "watchLater">("favorites");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Favorites & Watch Later</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabSelector, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "favorites" && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab("favorites");
          }}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === "favorites" ? colors.primary : colors.mutedForeground },
              activeTab === "favorites" && { fontWeight: "700" },
            ]}
          >
            Favorites
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === "watchLater" && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab("watchLater");
          }}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === "watchLater" ? colors.primary : colors.mutedForeground },
              activeTab === "watchLater" && { fontWeight: "700" },
            ]}
          >
            Watch Later
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "favorites" ? (
          favoriteCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                <Feather name="heart" size={48} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No favorites yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Tap the heart icon on any course to save it here
              </Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/search")}
              >
                <Text style={styles.emptyButtonText}>Browse Courses</Text>
                <Feather name="arrow-right" size={16} color="#FFF" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.coursesGrid}>
              {favoriteCourses.map((fav) => {
                const course = COURSES.find((c) => c.id === fav.courseId);
                if (!course) return null;
                return <CourseCard key={fav.courseId} course={course} />;
              })}
            </View>
          )
        ) : watchLaterLessons.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="bookmark" size={48} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No saved lessons
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Save lessons while watching to find them here later
            </Text>
          </View>
        ) : (
          <View style={styles.lessonsList}>
            {watchLaterLessons.map((lesson) => (
              <Pressable
                key={lesson.lessonId}
                style={[styles.lessonItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() =>
                  router.push({
                    pathname: "/course/learn",
                    params: { courseId: lesson.courseId, moduleId: lesson.moduleId },
                  })
                }
              >
                <Image source={lesson.courseThumbnail} style={styles.lessonThumbnail} />
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonCourse, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {lesson.courseTitle}
                  </Text>
                  <Text style={[styles.lessonTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {lesson.lessonTitle}
                  </Text>
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    removeFromWatchLater(lesson.lessonId);
                  }}
                >
                  <Feather name="x" size={18} color={colors.mutedForeground} />
                </Pressable>
              </Pressable>
            ))}
          </View>
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
  tabSelector: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  lessonsList: {
    gap: 12,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  lessonThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  lessonInfo: {
    flex: 1,
    gap: 4,
  },
  lessonCourse: {
    fontSize: 12,
    fontWeight: "500",
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
