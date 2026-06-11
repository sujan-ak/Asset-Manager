import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProgress } from "@/context/ProgressContext";
import { COURSES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { ProgressAnalytics } from "@/lib/progressAnalytics";
import { ProgressStats } from "@/components/ProgressStats";
import { CourseProgressCard } from "@/components/CourseProgressCard";
import { WatchlistCard } from "@/components/WatchlistCard";
import { SectionHeader } from "@/components/SectionHeader";

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courseProgress, watchlist } = useProgress();

  // Calculate learning statistics
  const stats = useMemo(
    () => ProgressAnalytics.calculateLearningStats(courseProgress, COURSES),
    [courseProgress]
  );

  const coursesWithProgress = useMemo(
    () => ProgressAnalytics.getCoursesWithProgress(courseProgress, COURSES),
    [courseProgress]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Get max minutes for weekly activity chart scaling
  const maxMinutes = Math.max(...stats.weeklyActivity.map((d) => d.minutes), 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Your Progress</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Track your learning journey
          </Text>
        </View>
      </View>

      {/* Empty State */}
      {stats.totalCoursesEnrolled === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="trending-up" size={48} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Your Learning Journey Starts Here! 🚀
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Enroll in courses to track your progress and achieve your learning goals
          </Text>
          <Pressable
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/courses")}
          >
            <Text style={styles.emptyBtnText}>Browse Courses</Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </Pressable>
        </View>
      ) : (
        <>
          {/* Progress Statistics */}
          <View style={styles.section}>
            <ProgressStats
              totalCoursesEnrolled={stats.totalCoursesEnrolled}
              coursesCompleted={stats.coursesCompleted}
              coursesInProgress={stats.coursesInProgress}
              totalLessonsCompleted={stats.totalLessonsCompleted}
              averageProgress={stats.averageProgress}
              learningStreak={stats.learningStreak}
            />
          </View>

          {/* Learning Streak Card */}
          {stats.totalLessonsCompleted === 0 ? (
            <View style={styles.section}>
              <View
                style={[
                  styles.streakCard,
                  { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
              >
                <View style={styles.streakHeader}>
                  <View style={[styles.streakIcon, { backgroundColor: colors.card }]}>
                    <Feather name="target" size={24} color={colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.streakTitle, { color: colors.foreground }]}>
                      Complete your first lesson to start a streak!
                    </Text>
                    <Text style={[styles.streakSubtitle, { color: colors.mutedForeground }]}>
                      Build momentum by learning every day
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : stats.learningStreak > 0 ? (
            <View style={styles.section}>
              <View
                style={[
                  styles.streakCard,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <View style={styles.streakHeader}>
                  <View style={styles.streakIcon}>
                    <Feather name="zap" size={24} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.streakTitle}>
                      {stats.learningStreak} Day Streak! 🔥
                    </Text>
                    <Text style={styles.streakSubtitle}>
                      Keep it up! You're on a roll
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* Weekly Activity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Weekly Activity
            </Text>
            {stats.weeklyActivity.reduce((sum, d) => sum + d.minutes, 0) === 0 ? (
              <View
                style={[
                  styles.emptyActivityCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.emptyActivityIcon, { backgroundColor: colors.muted }]}>
                  <Feather name="bar-chart-2" size={32} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.emptyActivityTitle, { color: colors.foreground }]}>
                  Complete a lesson to begin tracking 📈
                </Text>
                <Text style={[styles.emptyActivityText, { color: colors.mutedForeground }]}>
                  Start your first lesson to see your learning statistics here
                </Text>
                <Pressable
                  style={[styles.emptyActivityBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    const firstCourse = coursesWithProgress[0];
                    if (firstCourse) {
                      router.push(`/course/${firstCourse.courseId}`);
                    } else {
                      router.push("/(tabs)/courses");
                    }
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Start Learning"
                  accessibilityHint="Double tap to start learning"
                >
                  <Text style={styles.emptyActivityBtnText}>Start Learning</Text>
                  <Feather name="arrow-right" size={16} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.activityCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.activityChart} pointerEvents="none">
                  {stats.weeklyActivity.map((day, index) => {
                    const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
                    const hasActivity = day.minutes > 0;

                    return (
                      <View
                        key={`week-${index}-${day.day}`}
                        style={styles.activityBarContainer}
                      >
                        <View style={styles.activityBarWrapper}>
                          <View
                            style={[
                              styles.activityBar,
                              {
                                height: `${Math.max(height, 5)}%`,
                                backgroundColor: hasActivity ? colors.primary : colors.muted,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.activityDay, { color: colors.mutedForeground }]}>
                          {day.day}
                        </Text>
                        {hasActivity && (
                          <Text style={[styles.activityMinutes, { color: colors.primary }]}>
                            {day.minutes}m
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
                <View style={styles.activitySummary}>
                  <View style={styles.activityStat}>
                    <Feather name="clock" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.activityStatText, { color: colors.foreground }]}>
                      {stats.weeklyActivity.reduce((sum, d) => sum + d.minutes, 0)} min this week
                    </Text>
                  </View>
                  <View style={styles.activityStat}>
                    <Feather name="check-circle" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.activityStatText, { color: colors.foreground }]}>
                      {stats.weeklyActivity.reduce((sum, d) => sum + d.lessonsCompleted, 0)}{" "}
                      lessons completed
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Continue Learning */}
          {watchlist.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Continue Learning"
                subtitle={`${watchlist.length} lesson${watchlist.length > 1 ? "s" : ""} in progress`}
              />
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
              >
                {watchlist.map((item) => (
                  <WatchlistCard key={`${item.courseId}-${item.moduleId}`} item={item} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recently Completed Lessons */}
          {stats.recentlyCompleted.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Recently Completed"
                subtitle={`${stats.recentlyCompleted.length} lesson${
                  stats.recentlyCompleted.length > 1 ? "s" : ""
                }`}
              />
              <View style={styles.completedList}>
                {stats.recentlyCompleted.slice(0, 5).map((lesson, index) => (
                  <Pressable
                    key={`${lesson.courseId}-${lesson.moduleId}-${index}`}
                    style={[
                      styles.completedItem,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => router.push(`/course/${lesson.courseId}`)}
                  >
                    <Image source={lesson.courseThumbnail} style={styles.completedThumbnail} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.completedModuleTitle, { color: colors.foreground }]}
                        numberOfLines={1}
                      >
                        {lesson.moduleTitle}
                      </Text>
                      <Text
                        style={[styles.completedCourseTitle, { color: colors.mutedForeground }]}
                        numberOfLines={1}
                      >
                        {lesson.courseTitle}
                      </Text>
                      <Text style={[styles.completedDate, { color: colors.mutedForeground }]}>
                        {formatCompletedDate(lesson.completedAt)}
                      </Text>
                    </View>
                    <View style={styles.completedCheck}>
                      <Feather name="check-circle" size={20} color="#10B981" />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Course Progress Cards */}
          {coursesWithProgress.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Your Courses"
                subtitle={`${coursesWithProgress.length} enrolled`}
              />
              <View style={styles.coursesList}>
                {coursesWithProgress.map((course) => (
                  <CourseProgressCard key={course.courseId} course={course} />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function formatCompletedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pageTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 12, paddingHorizontal: 20 },
  carouselContent: { paddingLeft: 20, paddingRight: 4 },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 48,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },

  // Streak Card
  streakCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },

  // Weekly Activity Empty State
  emptyActivityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 20,
  },
  emptyActivityIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyActivityTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyActivityText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActivityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 48,
  },
  emptyActivityBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },

  // Weekly Activity
  activityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  activityChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 140,
    marginBottom: 20,
    position: "relative",
    zIndex: 1,
  },
  activityBarContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  activityBarWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  activityBar: {
    width: "60%",
    borderRadius: 4,
    minHeight: 4,
    position: "relative",
  },
  activityDay: {
    fontSize: 11,
    fontWeight: "600",
  },
  activityMinutes: {
    fontSize: 10,
    fontWeight: "700",
  },
  activitySummary: {
    gap: 8,
  },
  activityStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityStatText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Recently Completed
  completedList: {
    gap: 10,
    paddingHorizontal: 20,
  },
  completedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  completedThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  completedModuleTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  completedCourseTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  completedDate: {
    fontSize: 11,
  },
  completedCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  // Courses List
  coursesList: {
    gap: 12,
    paddingHorizontal: 20,
  },
});
