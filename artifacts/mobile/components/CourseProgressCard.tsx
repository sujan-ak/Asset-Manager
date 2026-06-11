import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";
import { CourseWithProgress } from "@/lib/progressAnalytics";

interface CourseProgressCardProps {
  course: CourseWithProgress;
}

export function CourseProgressCard({ course }: CourseProgressCardProps) {
  const colors = useColors();
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: course.progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [course.progress]);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/course/${course.courseId}`);
  };

  const handleContinue = async (e: any) => {
    e.stopPropagation();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/course/${course.courseId}`);
  };

  const getStatusInfo = () => {
    if (course.progress === 100) {
      return {
        label: "Completed ✓",
        color: "#10B981",
        bgColor: "#DCFCE7",
        icon: "check-circle",
        ctaLabel: "Review",
      };
    }
    if (course.progress > 0) {
      return {
        label: "Continue",
        color: "#3B82F6",
        bgColor: "#DBEAFE",
        icon: "play-circle",
        ctaLabel: "Continue",
      };
    }
    return {
      label: "Start Now",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      icon: "play",
      ctaLabel: "Start Now",
    };
  };

  const status = getStatusInfo();
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${course.courseTitle} by ${course.instructor}. ${course.progress}% complete. ${course.completedModules} of ${course.totalModules} lessons completed. Status: ${status.label}`}
      accessibilityHint="Double tap to open course details"
    >
      <View style={styles.header}>
        <Image
          source={course.thumbnail}
          style={styles.thumbnail}
          accessible={false}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {course.courseTitle}
          </Text>
          <Text style={[styles.instructor, { color: colors.mutedForeground }]} numberOfLines={1}>
            {course.instructor}
          </Text>
        </View>
      </View>

      {/* Progress Bar Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text
            style={[styles.progressText, { color: colors.primary }]}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Progress: ${course.progress} percent`}
          >
            {course.progress}%
          </Text>
          <Text style={[styles.lessonsText, { color: colors.mutedForeground }]}>
            {course.completedModules} of {course.totalModules} lessons
          </Text>
        </View>
        <View
          style={[styles.progressBarBg, { backgroundColor: colors.muted }]}
          accessible={true}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: course.progress,
            text: `${course.progress}% complete`,
          }}
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
                backgroundColor: colors.primary,
                minWidth: course.progress > 0 ? 8 : 0,
              },
            ]}
          />
        </View>
      </View>

      {/* Footer with Status Badge and CTA */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Pressable
            style={[styles.statusBadge, { backgroundColor: status.bgColor }]}
            onPress={course.progress < 100 ? handleContinue : undefined}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Status: ${status.label}`}
            accessibilityHint={course.progress < 100 ? "Double tap to continue course" : undefined}
          >
            <Feather name={status.icon as any} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </Pressable>
          <View style={styles.timeInfo}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
              {formatLastAccessed(course.lastAccessedAt)}
            </Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleContinue}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={status.ctaLabel}
          accessibilityHint="Double tap to continue learning"
        >
          <Text style={styles.ctaText}>{status.ctaLabel}</Text>
          <Feather name="arrow-right" size={14} color="#FFF" />
        </Pressable>
      </View>
    </Pressable>
  );
}

function formatLastAccessed(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    minHeight: 48,
  },
  header: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 4,
  },
  instructor: {
    fontSize: 13,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "800",
  },
  lessonsText: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  footerLeft: {
    flex: 1,
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    minHeight: 32,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 12,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 48,
    minWidth: 110,
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
