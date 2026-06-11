import { Feather } from "@expo/vector-icons";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoPlayerEnhanced } from "@/components/VideoPlayerEnhanced";
import { ResumeModal } from "@/components/ResumeModal";
import { LessonCompleteModal } from "@/components/LessonCompleteModal";
import { LearningTabs } from "@/components/LearningTabs";
import { COURSES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/context/ProgressContext";

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courseId, moduleId } = useLocalSearchParams<{ courseId: string; moduleId: string }>();
  const { getModuleProgress, updateVideoProgress, enrollCourse, getCourseProgress } = useProgress();
  const course = COURSES.find((c) => c.id === courseId);
  const [activeTab, setActiveTab] = useState<"overview" | "content">("overview");
  const [activeModuleId, setActiveModuleId] = useState(moduleId ?? course?.modules[0]?.id);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [resumeFromTime, setResumeFromTime] = useState(0);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>Course not found.</Text>
      </View>
    );
  }

  const courseProgress = getCourseProgress(courseId);
  const completedModules = courseProgress
    ? Object.values(courseProgress.modules).filter((m) => m.isCompleted).length
    : 0;
  const remainingModules = course.modules.length - completedModules;
  const progressPercentage = courseProgress?.progress || 0;

  React.useEffect(() => {
    if (course.isPurchased) {
      enrollCourse(courseId);
    }
  }, [courseId]);

  // Check for resume modal when module changes
  useEffect(() => {
    const moduleProgress = getModuleProgress(courseId, activeModuleId);
    const savedTime = moduleProgress?.videoProgress?.currentTime;
    if (activeModuleId && savedTime && savedTime > 30) {
      setResumeFromTime(savedTime);
      setShowResumeModal(true);
    }
  }, [activeModuleId]);

  const activeModule = course.modules.find((m) => m.id === activeModuleId) ?? course.modules[0];
  const moduleProgress = getModuleProgress(courseId, activeModule.id);
  const initialTime = showResumeModal ? 0 : (moduleProgress?.videoProgress?.currentTime ?? 0);

  const handleProgressUpdate = async (currentTime: number, duration: number) => {
    if (!courseId || !activeModule?.id) return;
    await updateVideoProgress(courseId, activeModule.id, currentTime, duration, activeModule.videoUrl);
  };

  const handleVideoComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCompleteModal(true);
  };

  const handleResumeVideo = () => {
    setShowResumeModal(false);
  };

  const handleStartOver = () => {
    setShowResumeModal(false);
    updateVideoProgress(courseId, activeModule.id, 0, 0, activeModule.videoUrl);
  };

  const handleReplayLesson = () => {
    setShowCompleteModal(false);
    updateVideoProgress(courseId, activeModule.id, 0, 0, activeModule.videoUrl);
  };

  const handleNextLesson = () => {
    setShowCompleteModal(false);
    const currentIndex = course.modules.findIndex((m) => m.id === activeModule.id);
    const nextModule = course.modules[currentIndex + 1];
    if (nextModule) {
      setActiveModuleId(nextModule.id);
    }
  };

  const getNextModule = () => {
    const currentIndex = course.modules.findIndex((m) => m.id === activeModule.id);
    return course.modules[currentIndex + 1];
  };

  const handleModuleSelect = async (moduleId: string) => {
    await Haptics.selectionAsync();
    setActiveModuleId(moduleId);
    setActiveTab("overview");
  };

  const getModuleState = (module: any, index: number) => {
    const modProgress = getModuleProgress(courseId, module.id);
    const isCompleted = modProgress?.isCompleted || false;
    const isCurrent = activeModuleId === module.id;
    
    // Sequential unlocking: can access if previous is completed or is first
    const previousModule = course.modules[index - 1];
    const canAccess = index === 0 || !previousModule || getModuleProgress(courseId, previousModule.id)?.isCompleted;
    const isLocked = !canAccess;
    
    return { isCompleted, isCurrent, isLocked };
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          Learning
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Course Header - PHASE 2 */}
      <View style={[styles.courseHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.courseHeaderTop}>
          <Text style={[styles.courseTitle, { color: colors.foreground }]} numberOfLines={1}>
            {course.title}
          </Text>
          <View style={[styles.progressBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.progressBadgeText, { color: colors.primary }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        </View>
        <View style={styles.courseHeaderBottom}>
          <View style={styles.statItem}>
            <Feather name="check-circle" size={14} color="#10B981" />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {completedModules} of {course.modules.length} completed
            </Text>
          </View>
          {remainingModules > 0 && (
            <View style={styles.statItem}>
              <Feather name="circle" size={14} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>
                {remainingModules} remaining
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Video Player - PHASE 1 */}
      <VideoPlayerEnhanced
        videoUrl={activeModule.videoUrl}
        initialTime={initialTime}
        onProgressUpdate={handleProgressUpdate}
        onComplete={handleVideoComplete}
      />

      {/* Tabs - PHASE 6 */}
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
                { color: activeTab === key ? colors.primary : colors.mutedForeground },
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
            {course.modules.map((mod, idx) => {
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
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", textAlign: "center" },
  
  // Course Header - PHASE 2
  courseHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  courseHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  courseTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  courseHeaderBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
  },

  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 14, fontWeight: "600" },
  
  // Professional Lesson List - PHASE 5
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
});