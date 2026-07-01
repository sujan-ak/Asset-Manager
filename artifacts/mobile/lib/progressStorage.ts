import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from './supabase';

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  totalTimeSpent: number;
  modules: {
    [moduleId: string]: ModuleProgress;
  };
}

export interface ModuleProgress {
  moduleId: string;
  isCompleted: boolean;
  isStarted: boolean;
  videoProgress: VideoProgress;
  lastAccessedAt: string;
  completedAt?: string;
  timeSpent: number;
}

export interface VideoProgress {
  videoUrl: string;
  currentTime: number;
  duration: number;
  watchedPercentage: number;
  isCompleted: boolean;
  lastWatchedAt: string;
}

export interface WatchlistItem {
  courseId: string;
  moduleId: string;
  courseTitle: string;
  moduleTitle: string;
  courseThumbnail: any;
  lastWatchedAt: string;
  videoProgress: VideoProgress;
  courseProgress: number;
}

const STORAGE_KEYS = {
  courseProgress: (userId: string, courseId: string) =>
    `@progress:user:${userId}:course:${courseId}`,
  watchlist: (userId: string) => `@progress:user:${userId}:watchlist`,
};

export const ProgressStorage = {
  async saveCourseProgress(
    progress: UserCourseProgress
  ): Promise<void> {
    try {
      const key = STORAGE_KEYS.courseProgress(progress.userId, progress.courseId);
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save course progress:", error);
    }
  },

  async loadCourseProgress(
    userId: string,
    courseId: string
  ): Promise<UserCourseProgress | null> {
    try {
      const key = STORAGE_KEYS.courseProgress(userId, courseId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load course progress:", error);
      return null;
    }
  },

  async loadAllCourseProgress(
    userId: string
  ): Promise<UserCourseProgress[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter((key) =>
        key.startsWith(`@progress:user:${userId}:course:`)
      );
      const progressData = await AsyncStorage.multiGet(progressKeys);
      return progressData
        .map(([_, value]) => (value ? JSON.parse(value) : null))
        .filter(Boolean) as UserCourseProgress[];
    } catch (error) {
      console.error("Failed to load all course progress:", error);
      return [];
    }
  },

  async saveWatchlist(
    userId: string,
    watchlist: WatchlistItem[]
  ): Promise<void> {
    try {
      const key = STORAGE_KEYS.watchlist(userId);
      await AsyncStorage.setItem(key, JSON.stringify(watchlist));
    } catch (error) {
      console.error("Failed to save watchlist:", error);
    }
  },

  async loadWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const key = STORAGE_KEYS.watchlist(userId);
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      return [];
    }
  },

  async clearProgress(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter((key) =>
        key.startsWith(`@progress:user:${userId}`)
      );
      await AsyncStorage.multiRemove(userKeys);
    } catch (error) {
      console.error("Failed to clear progress:", error);
    }
  },
};

export async function markLessonComplete(userId: string, courseId: string, lessonId: string) {
  const { error } = await supabase.from('lesson_progress').upsert(
    {
      user_id: userId,
      lesson_id: Number(lessonId),
      course_id: courseId,
      is_completed: true,
      watch_percentage: 100,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  );
  if (error) throw error;
}

export async function upsertLessonProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  currentTimeSecs: number,
  watchPercentage: number,
) {
  const { error } = await supabase.from('lesson_progress').upsert(
    {
      user_id: userId,
      lesson_id: Number(lessonId),
      course_id: courseId,
      current_time_secs: Math.floor(currentTimeSecs),
      watch_percentage: Math.round(watchPercentage),
      time_spent_secs: Math.floor(currentTimeSecs),
      is_completed: watchPercentage >= 90,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  );
  if (error) console.error('[progress] upsert error', error);
}

export async function fetchCourseProgress(userId: string, courseId: string) {
  const { data: modules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);
  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length === 0) return { completed: 0, total: 0, percentage: 0 };

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return { completed: 0, total: 0, percentage: 0 };

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, is_completed')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  const completed = (progress ?? []).filter((p) => p.is_completed).length;
  const total = lessonIds.length;
  return { completed, total, percentage: total ? Math.round((completed / total) * 100) : 0 };
}

export async function fetchCourseLessonsProgress(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, current_time_secs, watch_percentage, is_completed')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) throw error;
  return data ?? [];
}

