import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Course } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { useProgress } from "@/context/ProgressContext";

interface CourseCardProps {
  course: Course;
  horizontal?: boolean;
}

export function CourseCard({ course, horizontal = false }: CourseCardProps) {
  const colors = useColors();
  const { getCourseProgress } = useProgress();
  const courseProgress = getCourseProgress(course.id);
  const isEnrolled = !!courseProgress;
  const progress = courseProgress?.progress || 0;

  if (horizontal) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.horizontalCard,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })}
      >
        <Image source={course.thumbnail} style={styles.horizontalThumbnail} />
        <View style={styles.horizontalContent}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{course.category}</Text>
          </View>
          <Text style={[styles.horizontalTitle, { color: colors.foreground }]} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={[styles.instructor, { color: colors.mutedForeground }]}>{course.instructor}</Text>
          <View style={styles.metaRow}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}> {course.rating}</Text>
            <Text style={[styles.metaDot, { color: colors.border }]}> · </Text>
            <Feather name="book" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}> {course.lessons} lessons</Text>
          </View>
          {isEnrolled && progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` as any, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{progress}%</Text>
            </View>
          )}
        </View>
        <View style={styles.priceCol}>
          {course.isFree ? (
            <Text style={styles.freeText}>Free</Text>
          ) : (
            <Text style={[styles.priceText, { color: colors.foreground }]}>₹{course.price}</Text>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })}
    >
      <Image source={course.thumbnail} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{course.category}</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={[styles.instructor, { color: colors.mutedForeground }]}>{course.instructor}</Text>
        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.mutedForeground }]}> {course.rating}</Text>
          </View>
          {course.isFree ? (
            <Text style={styles.freeText}>Free</Text>
          ) : (
            <Text style={[styles.priceText, { color: colors.foreground }]}>₹{course.price}</Text>
          )}
        </View>
        {isEnrolled && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` as any, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{progress}%</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
    gap: 6,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    minHeight: 40,
    flexShrink: 1,
  },
  instructor: {
    fontSize: 11,
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 11,
  },
  freeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
    flexShrink: 0,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
  },
  // Horizontal card
  horizontalCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalThumbnail: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    gap: 2,
  },
  horizontalTitle: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
  },
  metaDot: {
    fontSize: 11,
  },
  priceCol: {
    paddingRight: 12,
    justifyContent: "center",
    flexShrink: 0,
    minWidth: 80,
  },
});
