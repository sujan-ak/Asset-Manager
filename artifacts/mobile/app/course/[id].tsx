import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/Badge";
import { COURSES, QUIZZES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/context/ProgressContext";
import { ProgressCalculator } from "@/lib/progressCalculator";

export default function CourseDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourseProgress, enrollCourse } = useProgress();
  const course = COURSES.find((c) => c.id === id);
  const courseProgress = course ? getCourseProgress(course.id) : null;
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (course?.isPurchased && !courseProgress) {
      enrollCourse(course.id);
    }
  }, [course?.id, course?.isPurchased]);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Course not found.</Text>
      </View>
    );
  }

  const quiz = QUIZZES.find((q) => q.courseId === course.id);
  const progress = courseProgress?.progress || 0;
  const completedModules = courseProgress
    ? Object.values(courseProgress.modules).filter((m) => m.isCompleted).length
    : 0;
  const remainingModules = course.modules.length - completedModules;
  const lastModuleId = courseProgress
    ? ProgressCalculator.getLastAccessedModuleId(courseProgress.modules)
    : null;
  const hasStarted = progress > 0;

  const handleEnrollNow = async () => {
    if (!course) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEnrolling(true);

    try {
      await enrollCourse(course.id);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert(
        "Enrollment Successful! 🎉",
        `You've successfully enrolled in "${course.title}". Ready to start learning?`,
        [
          {
            text: "View Course",
            style: "cancel",
            onPress: () => {
              setIsEnrolling(false);
            },
          },
          {
            text: "Start Learning",
            onPress: () => {
              setIsEnrolling(false);
              router.push({ 
                pathname: "/course/learn", 
                params: { courseId: course.id, moduleId: course.modules[0].id } 
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('[CourseDetail] Enrollment error:', error);
      Alert.alert(
        "Enrollment Failed",
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 120 }}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image source={course.thumbnail} style={styles.thumbnail} />
          <View style={styles.overlay} />
          <Pressable
            style={[styles.backCircle, { top: (Platform.OS === "web" ? 67 : insets.top) + 8 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#FFF" />
          </Pressable>
          <View style={[styles.thumbnailBadge, { bottom: 16, left: 16 }]}>
            <Badge label={course.level} variant="primary" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{course.category}</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{course.title}</Text>
          <Text style={[styles.instructor, { color: colors.mutedForeground }]}>By {course.instructor}</Text>

          {/* Stats row */}
          <View style={[styles.statsRow, { backgroundColor: colors.muted, borderRadius: 14 }]}>
            {[
              { icon: "star", value: course.rating.toString(), label: "Rating" },
              { icon: "book", value: `${course.lessons}`, label: "Lessons" },
              { icon: "clock", value: course.duration, label: "Duration" },
              { icon: "users", value: `${course.reviews}`, label: "Students" },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Feather name={s.icon as any} size={16} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About this course</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{course.description}</Text>

          {/* Tags */}
          <View style={styles.tags}>
            {course.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Progress (if enrolled) */}
          {course.isPurchased && hasStarted && (
            <View style={[styles.progressCard, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={[styles.progressLabel, { color: colors.primary }]}>Your Progress</Text>
                  <Text style={[styles.progressPct, { color: colors.primary }]}>{progress}%</Text>
                </View>
                {progress === 100 && (
                  <View style={[styles.completeBadge, { backgroundColor: "#10B981" }]}>
                    <Feather name="award" size={16} color="#FFF" />
                    <Text style={styles.completeBadgeText}>Completed</Text>
                  </View>
                )}
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: colors.primary }]}
                />
              </View>
              <View style={styles.progressStats}>
                <Text style={[styles.progressSub, { color: colors.foreground }]}>
                  {completedModules} of {course.modules.length} lessons completed
                </Text>
                {remainingModules > 0 && (
                  <Text style={[styles.progressRemaining, { color: colors.mutedForeground }]}>
                    {remainingModules} remaining
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Curriculum */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Curriculum</Text>
          <Text style={[styles.curriculumSubtitle, { color: colors.mutedForeground }]}>
            {course.modules.length} lessons · {course.duration}
          </Text>
          {course.modules.map((mod, idx) => {
            const modProgress = courseProgress?.modules[mod.id];
            const isCompleted = modProgress?.isCompleted || false;
            const watchedPercentage = modProgress?.videoProgress.watchedPercentage || 0;

            return (
              <Pressable
                key={mod.id}
                style={[
                  styles.moduleItem,
                  { 
                    backgroundColor: colors.card, 
                    borderColor: isCompleted ? "#10B981" : colors.border,
                    borderWidth: isCompleted ? 2 : 1
                  },
                ]}
                onPress={() => {
                  if (course.isPurchased) {
                    router.push({ pathname: "/course/learn", params: { courseId: course.id, moduleId: mod.id } });
                  }
                }}
              >
                <View
                  style={[
                    styles.moduleNum,
                    { backgroundColor: isCompleted ? "#DCFCE7" : colors.muted },
                  ]}
                >
                  {isCompleted ? (
                    <Feather name="check" size={14} color="#10B981" />
                  ) : (
                    <Text style={[styles.moduleNumText, { color: colors.mutedForeground }]}>{idx + 1}</Text>
                  )}
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleTitle, { color: isCompleted ? "#10B981" : colors.foreground }]}>
                    {mod.title}
                  </Text>
                  <View style={styles.moduleMetaRow}>
                    <Feather name="clock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.moduleDuration, { color: colors.mutedForeground }]}>{mod.duration}</Text>
                    {watchedPercentage > 0 && watchedPercentage < 100 && (
                      <Text style={[styles.watchedPercentage, { color: colors.primary }]}>
                        · {Math.round(watchedPercentage)}% watched
                      </Text>
                    )}
                  </View>
                </View>
                {course.isPurchased ? (
                  <Feather 
                    name={isCompleted ? "check-circle" : "play-circle"} 
                    size={20} 
                    color={isCompleted ? "#10B981" : colors.primary} 
                  />
                ) : (
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                )}
              </Pressable>
            );
          })}

          {/* Quiz */}
          {quiz && course.isPurchased && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quiz</Text>
              <Pressable
                style={[styles.quizCard, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: "/quiz/[id]", params: { id: quiz.id } });
                }}
              >
                <View>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizSub}>{quiz.questions.length} questions · {quiz.timeLimit / 60} min</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#FFF" />
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      {/* CTA */}
      <View
        style={[
          styles.cta,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 20 : insets.bottom + 8,
          },
        ]}
      >
        {course.isPurchased ? (
          <Pressable
            style={[styles.ctaBtn, { backgroundColor: progress === 100 ? "#10B981" : colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const targetModuleId = lastModuleId || course.modules[0].id;
              router.push({ pathname: "/course/learn", params: { courseId: course.id, moduleId: targetModuleId } });
            }}
          >
            {progress === 100 ? (
              <>
                <Feather name="award" size={18} color="#FFF" />
                <Text style={styles.ctaBtnText}>Review Course</Text>
              </>
            ) : progress > 0 ? (
              <>
                <Feather name="play" size={18} color="#FFF" />
                <Text style={styles.ctaBtnText}>Continue Learning · {progress}%</Text>
              </>
            ) : (
              <>
                <Feather name="play" size={18} color="#FFF" />
                <Text style={styles.ctaBtnText}>Start Learning</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.ctaRow}>
            <View>
              {course.isFree ? (
                <Text style={[styles.ctaPrice, { color: colors.success }]}>Free</Text>
              ) : (
                <Text style={[styles.ctaPrice, { color: colors.primary }]}>₹{course.price}</Text>
              )}
            </View>
            <Pressable
              style={[styles.ctaBtn, { backgroundColor: colors.secondary, flex: 1, opacity: isEnrolling ? 0.6 : 1 }]}
              onPress={handleEnrollNow}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <Text style={styles.ctaBtnText}>Enrolling...</Text>
              ) : (
                <Text style={styles.ctaBtnText}>{course.isFree ? "Enroll for Free" : "Enroll Now"}</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: 16 },
  errorText: { fontSize: 16, textAlign: "center", marginTop: 40 },
  thumbnailContainer: { position: "relative", height: 240 },
  thumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  backCircle: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailBadge: { position: "absolute" },
  content: { padding: 20, gap: 12 },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  instructor: { fontSize: 14 },
  statsRow: { flexDirection: "row", paddingVertical: 14 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 14, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  description: { fontSize: 14, lineHeight: 22 },
  tags: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: "500" },
  progressCard: { 
    borderRadius: 16, 
    padding: 18, 
    gap: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center"
  },
  progressLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  progressPct: { fontSize: 24, fontWeight: "800" },
  completeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  progressTrack: { height: 8, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressSub: { fontSize: 13, fontWeight: "500" },
  progressRemaining: { fontSize: 12 },
  curriculumSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -8,
  },
  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  moduleNum: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  moduleNumText: { fontSize: 13, fontWeight: "700" },
  moduleInfo: { flex: 1, gap: 4 },
  moduleTitle: { fontSize: 14, fontWeight: "600" },
  moduleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  moduleDuration: { fontSize: 12 },
  watchedPercentage: {
    fontSize: 11,
    fontWeight: "600",
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  quizTitle: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  quizSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  cta: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
  ctaRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  ctaPrice: { fontSize: 22, fontWeight: "800" },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 52,
  },
  ctaBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});
