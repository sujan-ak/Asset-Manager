import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoPlayerEnhanced } from "@/components/VideoPlayerEnhanced";
import { ResumeModal } from "@/components/ResumeModal";
import { LessonCompleteModal } from "@/components/LessonCompleteModal";
import { LearningTabs } from "@/components/LearningTabs";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContextSupabase";
import { useFavorites } from "@/context/FavoritesContext";
import { getCourseById, getCourseModules } from "@/services/courseDataProvider";
import { markLessonComplete, upsertLessonProgress, fetchCourseLessonsProgress } from "@/lib/progressStorage";
import { getEnrollment, isExpired, Enrollment } from "@/services/enrollmentService";
import { ActivityIndicator } from "react-native";

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courseId, moduleId } = useLocalSearchParams<{ courseId: string; moduleId: string }>();
  const { user } = useAuth();
  const { isInWatchLater, toggleWatchLater } = useFavorites();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]); // flat lessons
  const [lessonsProgress, setLessonsProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "content">("overview");
  const [activeModuleId, setActiveModuleId] = useState<string | undefined>(moduleId);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [resumeFromTime, setResumeFromTime] = useState(0);
  const [showVideoAuthPrompt, setShowVideoAuthPrompt] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  useEffect(() => {
    async function loadData() {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const courseData = await getCourseById(courseId);
        if (courseData) {
          const mappedCourse = {
            id: String(courseData.id),
            title: courseData.title,
            category: courseData.category || "General",
            level: courseData.level ? (courseData.level.charAt(0).toUpperCase() + courseData.level.slice(1)) : "Beginner",
            price: courseData.price || 0,
            isFree: courseData.is_free,
            thumbnail: courseData.thumbnail_url ? { uri: courseData.thumbnail_url } : require('@/assets/images/course_robotics.png'),
            instructor: "Edodwaja Instructor",
            rating: 4.8,
            reviews: 120,
            description: courseData.description || "",
            tags: [courseData.category || "Robotics"],
          };
          setCourse(mappedCourse);

          const modulesData = await getCourseModules(courseId);
          const flatLessons = modulesData.flatMap((m: any) =>
            m.lessons.map((l: any) => ({
              id: l.id,
              title: l.title,
              videoUrl: l.video_url || "",
              duration: l.duration_minutes ? `${l.duration_minutes} mins` : "0 mins",
              description: l.content || "",
              notes: l.notes ? [l.notes] : [],
              resources: [],
            }))
          );
          setLessons(flatLessons);

          if (!activeModuleId && flatLessons.length > 0) {
            setActiveModuleId(moduleId ?? flatLessons[0].id);
          }

          if (user?.id) {
            const progressData = await fetchCourseLessonsProgress(user.id, courseId);
            setLessonsProgress(progressData);
            const enrollmentData = await getEnrollment(user.id, courseId);
            setEnrollment(enrollmentData);
          }
        }
      } catch (error) {
        console.error("[LearnScreen] load error", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [courseId, user?.id]);

  useEffect(() => {
    if (!activeModuleId) return;
    const activeProg = lessonsProgress.find((p) => String(p.lesson_id) === activeModuleId);
    const savedTime = activeProg?.current_time_secs;
    if (savedTime && savedTime > 30) {
      setResumeFromTime(savedTime);
      setShowResumeModal(true);
    }
  }, [activeModuleId]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>Course not found.</Text>
      </View>
    );
  }

  const completedModules = lessonsProgress.filter((p) => p.is_completed).length;
  const remainingModules = lessons.length - completedModules;
  const progressPercentage = lessons.length > 0 ? Math.round((completedModules / lessons.length) * 100) : 0;

  const activeModule = lessons.find((m) => m.id === activeModuleId) ?? lessons[0];
  const activeLessonProgress = lessonsProgress.find((p) => String(p.lesson_id) === activeModule?.id);
  const initialTime = showResumeModal ? 0 : (activeLessonProgress?.current_time_secs ?? 0);
  const isSaved = activeModule ? isInWatchLater(activeModule.id) : false;

  const expired = isExpired(enrollment);

  const handleRenewAccess = () => {
    Alert.alert(
      "Access Expired",
      "Your 1-year access to this course has expired. Please contact support or re-enroll to continue learning.",
      [{ text: "OK" }]
    );
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const handleWatchLaterToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const wasAdded = !isSaved;
    toggleWatchLater({
      courseId,
      moduleId: activeModule.id,
      lessonId: activeModule.id,
      courseTitle: course.title,
      lessonTitle: activeModule.title,
      courseThumbnail: course.thumbnail,
    });
    showToast(wasAdded ? 'Added to Watch Later' : 'Removed from Watch Later');
  };

  const handleProgressUpdate = async (currentTime: number, duration: number) => {
    if (!user?.id || !courseId || !activeModule?.id) return;
    const watchPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const { error } = await upsertLessonProgress(user.id, courseId, activeModule.id, currentTime, watchPercentage);
    if (error && (error as any).status === 401) {
      setShowVideoAuthPrompt(true);
      return;
    }
    try {
      const progressData = await fetchCourseLessonsProgress(user.id, courseId);
      setLessonsProgress(progressData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVideoComplete = async () => {
    if (!user?.id || !courseId || !activeModule?.id) return;
    await markLessonComplete(user.id, courseId, activeModule.id);
    try {
      const progressData = await fetchCourseLessonsProgress(user.id, courseId);
      setLessonsProgress(progressData);
    } catch (e) {
      console.error(e);
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCompleteModal(true);
  };

  const handleResumeVideo = () => {
    setShowResumeModal(false);
  };

  const handleStartOver = async () => {
    if (!user?.id || !courseId || !activeModule?.id) return;
    setShowResumeModal(false);
    await upsertLessonProgress(user.id, courseId, activeModule.id, 0, 0);
    const progressData = await fetchCourseLessonsProgress(user.id, courseId);
    setLessonsProgress(progressData);
  };

  const handleReplayLesson = async () => {
    if (!user?.id || !courseId || !activeModule?.id) return;
    setShowCompleteModal(false);
    await upsertLessonProgress(user.id, courseId, activeModule.id, 0, 0);
    const progressData = await fetchCourseLessonsProgress(user.id, courseId);
    setLessonsProgress(progressData);
  };

  const handleNextLesson = () => {
    setShowCompleteModal(false);
    const currentIndex = lessons.findIndex((m) => m.id === activeModule.id);
    const nextModule = lessons[currentIndex + 1];
    if (nextModule) {
      setActiveModuleId(nextModule.id);
    }
  };

  const getNextModule = () => {
    if (!activeModule) return null;
    const currentIndex = lessons.findIndex((m) => m.id === activeModule.id);
    return lessons[currentIndex + 1];
  };

  const getPreviousModule = () => {
    if (!activeModule) return null;
    const currentIndex = lessons.findIndex((m) => m.id === activeModule.id);
    return lessons[currentIndex - 1];
  };

  const handleMarkComplete = async () => {
    if (!user?.id || !courseId || !activeModule?.id) return;
    await markLessonComplete(user.id, courseId, activeModule.id);
    try {
      const progressData = await fetchCourseLessonsProgress(user.id, courseId);
      setLessonsProgress(progressData);
    } catch (e) {
      console.error(e);
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePreviousLesson = async () => {
    await Haptics.selectionAsync();
    if (!activeModule) return;
    const currentIndex = lessons.findIndex((m) => m.id === activeModule.id);
    const prevModule = lessons[currentIndex - 1];
    if (prevModule) {
      setActiveModuleId(prevModule.id);
    }
  };

  const handleNextLessonNav = async () => {
    await Haptics.selectionAsync();
    if (!activeModule) return;
    const currentIndex = lessons.findIndex((m) => m.id === activeModule.id);
    const nextModule = lessons[currentIndex + 1];
    if (nextModule) {
      setActiveModuleId(nextModule.id);
    }
  };

  const handleModuleSelect = async (moduleId: string) => {
    await Haptics.selectionAsync();
    setActiveModuleId(moduleId);
    setActiveTab("overview");
  };

  const getModuleState = (module: any, index: number) => {
    const modProgress = lessonsProgress.find((p) => String(p.lesson_id) === module.id);
    const isCompleted = modProgress?.is_completed || false;
    const isCurrent = activeModuleId === module.id;
    
    // Sequential unlocking: can access if previous is completed or is first
    const previousModule = lessons[index - 1];
    const prevProgress = previousModule ? lessonsProgress.find((p) => String(p.lesson_id) === previousModule.id) : null;
    const canAccess = index === 0 || !previousModule || prevProgress?.is_completed;
    const isLocked = !canAccess;
    
    return { isCompleted, isCurrent, isLocked };
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)/courses");
          }
        }} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          Learning
        </Text>
        <Pressable onPress={handleWatchLaterToggle} style={styles.watchLaterBtn}>
          <MaterialIcons 
            name={isSaved ? "bookmark" : "bookmark-border"} 
            size={22} 
            color={isSaved ? colors.primary : colors.mutedForeground} 
          />
        </Pressable>
      </View>

      {/* Course Header - Compact */}
      <View style={[styles.courseHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.courseTitle, { color: colors.foreground }]} numberOfLines={2}>
          {course.title}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItemInline}>
            <Feather name="check-circle" size={13} color="#10B981" />
            <Text style={[styles.statTextInline, { color: colors.foreground, fontWeight: "600" }]}>
              {completedModules} Completed
            </Text>
          </View>
          {remainingModules > 0 && (
            <>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItemInline}>
                <Feather name="circle" size={13} color={colors.mutedForeground} />
                <Text style={[styles.statTextInline, { color: colors.mutedForeground }]}>
                  {remainingModules} Remaining
                </Text>
              </View>
            </>
          )}
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` as any, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressBarText, { color: colors.mutedForeground }]}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
      </View>

      {/* Video Player - Compact 25% screen */}
      <View style={styles.videoWrapper}>
        {expired ? (
          <View style={[styles.expiredBanner, { backgroundColor: "#FEF2F2" }]}>
            <Feather name="lock" size={28} color="#DC2626" />
            <Text style={styles.expiredTitle}>Your access has expired</Text>
            <Text style={styles.expiredSub}>Your 1-year access to this course has ended.</Text>
            <Pressable
              style={styles.renewBtn}
              onPress={handleRenewAccess}
            >
              <Text style={styles.renewBtnText}>Renew Access</Text>
            </Pressable>
          </View>
        ) : (
          <VideoPlayerEnhanced
            videoUrl={activeModule.videoUrl}
            initialTime={initialTime}
            onProgressUpdate={handleProgressUpdate}
            onComplete={handleVideoComplete}
            onAuthError={() => setShowVideoAuthPrompt(true)}
            showAuthPrompt={showVideoAuthPrompt}
            onAuthPromptDismiss={() => setShowVideoAuthPrompt(false)}
          />
        )}
      </View>

      {/* Mark Complete Button */}
      {!(lessonsProgress.find((p) => String(p.lesson_id) === activeModule?.id)?.is_completed) && (
        <View style={[styles.actionButtonContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable
            style={[styles.markCompleteBtn, { backgroundColor: colors.primary }]}
            onPress={handleMarkComplete}
          >
            <Feather name="check" size={16} color="#FFF" />
            <Text style={styles.markCompleteBtnText}>Mark Lesson Complete</Text>
          </Pressable>
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          ["overview", "Overview"],
          ["content", "Lessons"],
        ].map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.tab, activeTab === key && { borderBottomColor: colors.primary }]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(key as any);
            }}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === key ? colors.primary : colors.mutedForeground,
                  fontWeight: activeTab === key ? "700" : "600",
                },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" ? (
          <LearningTabs module={activeModule} />
        ) : (
          <View style={styles.moduleList}>
            {lessons.map((mod, idx) => {
              const { isCompleted, isCurrent, isLocked } = getModuleState(mod, idx);

              return (
                <Pressable
                  key={mod.id}
                  style={[
                    styles.modItem,
                    {
                      backgroundColor: isCurrent ? colors.accent : colors.card,
                      borderColor: isCompleted ? "#10B981" : isCurrent ? colors.primary : colors.border,
                      borderWidth: isCompleted || isCurrent ? 2 : 1,
                      opacity: isLocked ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => !isLocked && handleModuleSelect(mod.id)}
                  disabled={isLocked}
                >
                  <View
                    style={[
                      styles.modNum,
                      {
                        backgroundColor: isCompleted ? "#DCFCE7" : isCurrent ? colors.accent : colors.muted,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Feather name="check" size={14} color="#10B981" />
                    ) : isLocked ? (
                      <Feather name="lock" size={14} color={colors.mutedForeground} />
                    ) : isCurrent ? (
                      <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />
                    ) : (
                      <Text style={[styles.modNumText, { color: colors.mutedForeground }]}>{idx + 1}</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.modTitle,
                        {
                          color: isCurrent ? colors.primary : isCompleted ? "#10B981" : colors.foreground,
                          fontWeight: isCurrent || isCompleted ? "700" : "600",
                        },
                      ]}
                    >
                      {mod.title}
                    </Text>
                    <Text style={[styles.modDuration, { color: colors.mutedForeground }]}>{mod.duration}</Text>
                  </View>

                  <Feather
                    name={isCompleted ? "check-circle" : isCurrent ? "play-circle" : isLocked ? "lock" : "circle"}
                    size={18}
                    color={
                      isCompleted ? "#10B981" : isCurrent ? colors.primary : isLocked ? colors.mutedForeground : colors.border
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={[styles.navButtons, { borderTopColor: colors.border }]}>
          <Pressable
            style={[
              styles.navBtn,
              styles.navBtnPrev,
              { backgroundColor: colors.muted, opacity: getPreviousModule() ? 1 : 0.5 },
            ]}
            onPress={handlePreviousLesson}
            disabled={!getPreviousModule()}
          >
            <Feather name="chevron-left" size={18} color={colors.foreground} />
            <Text style={[styles.navBtnText, { color: colors.foreground }]}>Previous</Text>
          </Pressable>

          <Pressable
            style={[
              styles.navBtn,
              styles.navBtnNext,
              { backgroundColor: colors.primary, opacity: getNextModule() ? 1 : 0.5 },
            ]}
            onPress={handleNextLessonNav}
            disabled={!getNextModule()}
          >
            <Text style={[styles.navBtnText, { color: "#FFF" }]}>Next Lesson</Text>
            <Feather name="chevron-right" size={18} color="#FFF" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Resume Modal - PHASE 3 */}
      <ResumeModal
        visible={showResumeModal}
        resumeTime={resumeFromTime}
        onResume={handleResumeVideo}
        onStartOver={handleStartOver}
        onClose={() => setShowResumeModal(false)}
      />

      {/* Lesson Complete Modal - PHASE 4 */}
      <LessonCompleteModal
        visible={showCompleteModal}
        lessonTitle={activeModule.title}
        hasNextLesson={!!getNextModule()}
        onReplay={handleReplayLesson}
        onNextLesson={handleNextLesson}
        onClose={() => setShowCompleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  watchLaterBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", textAlign: "center" },
  
  // Compact Course Header
  courseHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 6,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statItemInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statTextInline: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 12,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  progressBarText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 32,
  },

  // Video wrapper - 25% screen height
  videoWrapper: {
    width: "100%",
    maxHeight: 220,
  },
  expiredBanner: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  expiredTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
    textAlign: "center",
  },
  expiredSub: {
    fontSize: 13,
    color: "#991B1B",
    textAlign: "center",
  },
  renewBtn: {
    marginTop: 8,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  renewBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Mark Complete Button
  actionButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  markCompleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  markCompleteBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 14 },
  
  // Professional Lesson List
  moduleList: { padding: 16, gap: 10 },
  modItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  modNum: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modNumText: { fontSize: 13, fontWeight: "700" },
  currentDot: { width: 8, height: 8, borderRadius: 4 },
  modTitle: { fontSize: 14, fontWeight: "600", lineHeight: 18 },
  modDuration: { fontSize: 12, marginTop: 3 },

  // Navigation Buttons
  navButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  navBtnPrev: {},
  navBtnNext: {},
  navBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});