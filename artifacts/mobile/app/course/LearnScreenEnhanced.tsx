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
  const [activeTab, setActiveTab] = useState<"content" | "resources">("content");
  const [activeModuleId, setActiveModuleId] = useState(moduleId ?? course?.modules[0]?.id);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [resumeFromTime, setResumeFromTime] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>Course not found.</Text>
      </View>
    );
  }

  // Calculate course progress
  const enrolledCourseProgress = getCourseProgress(courseId);
  const completedModules = enrolledCourseProgress
    ? Object.values(enrolledCourseProgress.modules).filter((m) => m.isCompleted).length
    : 0;

  React.useEffect(() => {
    if (course.isPurchased) {
      enrollCourse(courseId);
    }
  }, [courseId]);

  // Check for resume modal when module changes
  useEffect(() => {
    const moduleProgress = getModuleProgress(courseId, activeModuleId);
    if (activeModuleId && moduleProgress?.videoProgress.currentTime > 30) {
      setResumeFromTime(moduleProgress.videoProgress.currentTime);
      setShowResumeModal(true);
    }
  }, [activeModuleId]);

  const activeModule = course.modules.find((m) => m.id === activeModuleId) ?? course.modules[0];
  const moduleProgress = getModuleProgress(courseId, activeModule.id);
  const initialTime = moduleProgress?.videoProgress.currentTime || 0;

  const handleProgressUpdate = async (currentTime: number, duration: number) => {
    await updateVideoProgress(courseId, activeModule.id, currentTime, duration, activeModule.videoUrl);
  };

  const handleVideoComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCompleteModal(true);
  };

  const handleResumeVideo = () => {
    setShowResumeModal(false);
    // Video will resume from existing progress automatically
  };

  const handleStartOver = () => {
    setShowResumeModal(false);
    // Reset progress and start from beginning
    updateVideoProgress(courseId, activeModule.id, 0, 0, activeModule.videoUrl);
  };

  const handleReplayLesson = () => {
    setShowCompleteModal(false);
    updateVideoProgress(courseId, activeModule.id, 0, 0, activeModule.videoUrl);
  };

  const handleNextLesson = () => {
    setShowCompleteModal(false);
    const currentIndex = course.modules.findIndex(m => m.id === activeModule.id);
    const nextModule = course.modules[currentIndex + 1];
    if (nextModule) {
      setActiveModuleId(nextModule.id);
    }
  };

  const getNextModule = () => {
    const currentIndex = course.modules.findIndex(m => m.id === activeModule.id);
    return course.modules[currentIndex + 1];
  };

  const handleModuleSelect = async (moduleId: string) => {
    await Haptics.selectionAsync();
    setActiveModuleId(moduleId);
  };

  const getModuleState = (module: any, index: number) => {
    const modProgress = getModuleProgress(courseId, module.id);
    const isCompleted = modProgress?.isCompleted || false;
    const isCurrent = activeModuleId === module.id;
    const isStarted = modProgress?.isStarted || false;
    
    // Simple locking logic: can access if previous is completed or is first
    const previousModule = course.modules[index - 1];
    const canAccess = index === 0 || 
      (previousModule && getModuleProgress(courseId, previousModule.id)?.isCompleted);
    
    const isLocked = !canAccess;
    
    return { isCompleted, isCurrent, isStarted, isLocked };
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
          {course.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Course Header */}
      <View style={[styles.courseHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.courseInfo}>
          <Text style={[styles.courseName, { color: colors.foreground }]} numberOfLines={1}>
            {course.title}
          </Text>
          <Text style={[styles.instructorName, { color: colors.mutedForeground }]}>
            By {course.instructor}
          </Text>
        </View>
        
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.primary }]}>
            {Math.round((enrolledCourseProgress?.progress || 0))}% Complete
          </Text>
          <Text style={[styles.lessonsCount, { color: colors.mutedForeground }]}>
            {completedModules} of {course.modules.length} lessons
          </Text>
        </View>
      </View>

      {/* Video player area */}
      <VideoPlayerEnhanced
        videoUrl={activeModule.videoUrl}
        initialTime={showResumeModal ? 0 : initialTime}
        onProgressUpdate={handleProgressUpdate}
        onComplete={handleVideoComplete}
        onLoadingStateChange={setIsVideoLoading}
      />

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {([["content", "Lessons"], ["resources", "Overview"]] as const).map(([tab, label]) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.mutedForeground },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Learning Content */}
      {activeTab === "content" ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
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
                      opacity: isLocked ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => !isLocked && handleModuleSelect(mod.id)}
                  disabled={isLocked}
                >
                  <View style={[
                    styles.modNum, 
                    { 
                      backgroundColor: isCompleted ? "#DCFCE7" : isCurrent ? colors.accent : colors.muted 
                    }
                  ]}>
                    {isCompleted ? (
                      <Feather name="check" size={13} color="#10B981" />
                    ) : isLocked ? (
                      <Feather name="lock" size={13} color={colors.mutedForeground} />
                    ) : isCurrent ? (
                      <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />
                    ) : (
                      <Text style={[styles.modNumText, { color: colors.mutedForeground }]}>{idx + 1}</Text>
                    )}
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.modTitle, 
                      { 
                        color: isCurrent ? colors.primary : isCompleted ? "#10B981" : colors.foreground,
                        fontWeight: isCurrent ? "700" : isCompleted ? "600" : "600"
                      }
                    ]}>
                      {mod.title}
                    </Text>
                    <Text style={[styles.modDuration, { color: colors.mutedForeground }]}>
                      {mod.duration}
                    </Text>
                  </View>
                  
                  <Feather
                    name={
                      isCompleted ? "check-circle" : 
                      isCurrent ? "play-circle" : 
                      isLocked ? "lock" : "circle"
                    }
                    size={18}
                    color={
                      isCompleted ? "#10B981" : 
                      isCurrent ? colors.primary : 
                      isLocked ? colors.mutedForeground : colors.border
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <LearningTabs module={activeModule} />
      )}

      {/* Resume Modal */}
      <ResumeModal
        visible={showResumeModal}
        resumeTime={resumeFromTime}
        onResume={handleResumeVideo}
        onStartOver={handleStartOver}
        onClose={() => setShowResumeModal(false)}
      />

      {/* Lesson Complete Modal */}
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
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700", textAlign: "center" },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 13,
  },
  progressInfo: {
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  lessonsCount: {
    fontSize: 12,
  },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 14, fontWeight: "600" },
  moduleList: { padding: 16, gap: 8 },
  modItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  modNum: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  modNumText: { fontSize: 12, fontWeight: "700" },
  currentDot: { width: 8, height: 8, borderRadius: 4 },
  modTitle: { fontSize: 13, fontWeight: "600" },
  modDuration: { fontSize: 11, marginTop: 2 },
});