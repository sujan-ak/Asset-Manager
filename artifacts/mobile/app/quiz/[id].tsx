import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QUIZZES } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const quiz = QUIZZES.find((q) => q.id === id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit ?? 600);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishQuiz([...answers]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  if (!quiz) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 24 }}>Quiz not found.</Text>
      </View>
    );
  }

  const question = quiz.questions[currentIndex];
  const progress = (currentIndex / quiz.questions.length) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function selectOption(idx: number) {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === question.correctIndex) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }

  function next() {
    const newAnswers = [...answers, selectedOption ?? -1];
    if (currentIndex < quiz!.questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      clearInterval(timerRef.current!);
      finishQuiz(newAnswers);
    }
  }

  function finishQuiz(finalAnswers: number[]) {
    const score = finalAnswers.reduce((s, ans, i) => (ans === quiz!.questions[i].correctIndex ? s + 1 : s), 0);
    router.replace({
      pathname: "/quiz/result",
      params: { quizId: quiz!.id, score: score.toString(), total: quiz!.questions.length.toString() },
    });
  }

  const optionColors = (idx: number) => {
    if (selectedOption === null) {
      return { bg: colors.card, border: colors.border, text: colors.foreground };
    }
    if (idx === question.correctIndex) {
      return { bg: "#DCFCE7", border: "#16A34A", text: "#15803D" };
    }
    if (idx === selectedOption) {
      return { bg: "#FEE2E2", border: "#DC2626", text: "#DC2626" };
    }
    return { bg: colors.card, border: colors.border, text: colors.mutedForeground };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {currentIndex + 1} / {quiz.questions.length}
        </Text>
        <View style={[styles.timer, { backgroundColor: timeLeft < 60 ? "#FEE2E2" : colors.accent }]}>
          <Feather name="clock" size={12} color={timeLeft < 60 ? "#DC2626" : colors.primary} />
          <Text style={[styles.timerText, { color: timeLeft < 60 ? "#DC2626" : colors.primary }]}>
            {mins}:{secs.toString().padStart(2, "0")}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <Animated.View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: colors.primary }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <Text style={[styles.questionNum, { color: colors.mutedForeground }]}>Question {currentIndex + 1}</Text>
          <Text style={[styles.question, { color: colors.foreground }]}>{question.question}</Text>

          <View style={styles.options}>
            {question.options.map((opt, idx) => {
              const oc = optionColors(idx);
              return (
                <Pressable
                  key={idx}
                  style={[styles.option, { backgroundColor: oc.bg, borderColor: oc.border }]}
                  onPress={() => selectOption(idx)}
                  disabled={selectedOption !== null}
                >
                  <View style={[styles.optionLetter, { backgroundColor: oc.border }]}>
                    <Text style={[styles.optionLetterText, { color: "#FFF" }]}>
                      {["A", "B", "C", "D"][idx]}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: oc.text, flex: 1 }]}>{opt}</Text>
                  {selectedOption !== null && idx === question.correctIndex && (
                    <Feather name="check-circle" size={18} color="#16A34A" />
                  )}
                  {selectedOption === idx && idx !== question.correctIndex && (
                    <Feather name="x-circle" size={18} color="#DC2626" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {selectedOption !== null && (
            <View style={[styles.explanationBox, { backgroundColor: colors.accent }]}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.explanationText, { color: colors.primary, flex: 1 }]}>
                {question.explanation}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Next button */}
      {selectedOption !== null && (
        <View
          style={[
            styles.bottomBtn,
            { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 20 : insets.bottom + 8 },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.nextBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={next}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </Pressable>
        </View>
      )}
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
  headerTitle: { fontSize: 16, fontWeight: "700" },
  timer: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  timerText: { fontSize: 13, fontWeight: "600" },
  progressTrack: { height: 4 },
  progressFill: { height: 4 },
  content: { padding: 20 },
  questionNum: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  question: { fontSize: 20, fontWeight: "700", lineHeight: 28, marginBottom: 24 },
  options: { gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  optionLetter: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  optionLetterText: { fontSize: 13, fontWeight: "700" },
  optionText: { fontSize: 15, lineHeight: 20 },
  explanationBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "flex-start",
  },
  explanationText: { fontSize: 13, lineHeight: 18 },
  bottomBtn: { padding: 16, borderTopWidth: 1 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});
