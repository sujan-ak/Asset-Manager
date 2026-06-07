import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoPlayer } from "@/components/VideoPlayer";
import { COURSES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/context/ProgressContext";

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { courseId, moduleId } = useLocalSearchParams<{ courseId: string; moduleId: string }>();
  const { getModuleProgress, updateVideoProgress, enrollCourse } = useProgress();
  const course = COURSES.find((c) => c.id === courseId);
  const [activeTab, setActiveTab] = useState<"content" | "resources">("content");
  const [activeModuleId, setActiveModuleId] = useState(moduleId ?? course?.modules[0]?.id);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>Course not found.</Text>
      </View>
    );
  }

  React.useEffect(() => {
    if (course.isPurchased) {
      enrollCourse(courseId);
    }
  }, [courseId]);

  const activeModule = course.modules.find((m) => m.id === activeModuleId) ?? course.modules[0];
  const moduleProgress = getModuleProgress(courseId, activeModule.id);
  const initialTime = moduleProgress?.videoProgress.currentTime || 0;

  const handleProgressUpdate = async (currentTime: number, duration: number) => {
    await updateVideoProgress(courseId, activeModule.id, currentTime, duration, activeModule.videoUrl);
  };

  const handleVideoComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

      {/* Video player area */}
      <VideoPlayer
        videoUrl={activeModule.videoUrl}
        initialTime={initialTime}
        onProgressUpdate={handleProgressUpdate}
        onComplete={handleVideoComplete}
      />

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["content", "resources"] as const).map((tab) => (
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "content" ? (
          <View style={styles.moduleList}>
            {course.modules.map((mod, idx) => {
              const modProgress = getModuleProgress(courseId, mod.id);
              const isCompleted = modProgress?.isCompleted || false;
              const isCurrent = activeModuleId === mod.id;

              return (
                <Pressable
                  key={mod.id}
                  style={[
                    styles.modItem,
                    {
                      backgroundColor: isCurrent ? colors.accent : colors.card,
                      borderColor: isCurrent ? colors.primary : colors.border,
                      borderWidth: isCurrent ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveModuleId(mod.id);
                  }}
                >
                  <View style={[styles.modNum, { backgroundColor: isCompleted ? "#DCFCE7" : colors.muted }]}>
                    {isCompleted ? (
                      <Feather name="check" size={13} color="#16A34A" />
                    ) : isCurrent ? (
                      <View style={[styles.currentDot, { backgroundColor: colors.primary }]} />
                    ) : (
                      <Text style={[styles.modNumText, { color: colors.mutedForeground }]}>{idx + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modTitle, { color: isCurrent ? colors.primary : colors.foreground, fontWeight: isCurrent ? "700" : "600" }]}>
                      {mod.title}
                    </Text>
                    <Text style={[styles.modDuration, { color: colors.mutedForeground }]}>{mod.duration}</Text>
                  </View>
                  <Feather
                    name={isCurrent ? "play-circle" : isCompleted ? "check-circle" : "circle"}
                    size={18}
                    color={isCurrent ? colors.primary : isCompleted ? "#16A34A" : colors.border}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.resources}>
            {activeModule.resources.length === 0 ? (
              <View style={styles.emptyResources}>
                <Feather name="file" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No resources for this module</Text>
              </View>
            ) : (
              activeModule.resources.map((res) => (
                <Pressable
                  key={res.id}
                  style={[styles.resItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.resIcon, { backgroundColor: colors.accent }]}>
                    <Feather name="file-text" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resTitle, { color: colors.foreground }]}>{res.title}</Text>
                    <Text style={[styles.resMeta, { color: colors.mutedForeground }]}>
                      {res.type.toUpperCase()} · {res.size}
                    </Text>
                  </View>
                  <Feather name="download" size={18} color={colors.primary} />
                </Pressable>
              ))
            )}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700", textAlign: "center" },
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
  resources: { padding: 16, gap: 10 },
  emptyResources: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 14 },
  resItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  resIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  resTitle: { fontSize: 14, fontWeight: "600" },
  resMeta: { fontSize: 12, marginTop: 2 },
});
