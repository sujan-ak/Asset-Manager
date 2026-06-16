import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContextSupabase";
import {
  ModuleProgress,
  ProgressStorage,
  UserCourseProgress,
  VideoProgress,
  WatchlistItem,
} from "@/lib/progressStorage";
import { ProgressCalculator } from "@/lib/progressCalculator";
import * as courseDataProvider from "@/services/courseDataProvider";

interface ProgressContextType {
  courseProgress: Map<string, UserCourseProgress>;
  watchlist: WatchlistItem[];
  isLoading: boolean;
  getCourseProgress: (courseId: string) => UserCourseProgress | null;
  getModuleProgress: (courseId: string, moduleId: string) => ModuleProgress | null;
  updateVideoProgress: (
    courseId: string,
    moduleId: string,
    currentTime: number,
    duration: number,
    videoUrl: string
  ) => Promise<void>;
  completeModule: (courseId: string, moduleId: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  refreshWatchlist: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<Map<string, UserCourseProgress>>(
    new Map()
  );
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all progress on mount or user change
  useEffect(() => {
    if (user?.id) {
      loadAllProgress();
    } else {
      setCourseProgress(new Map());
      setWatchlist([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  async function loadAllProgress() {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const allProgress = await ProgressStorage.loadAllCourseProgress(user.id);
      const progressMap = new Map<string, UserCourseProgress>();
      allProgress.forEach((p) => progressMap.set(p.courseId, p));
      setCourseProgress(progressMap);

      const loadedWatchlist = await ProgressStorage.loadWatchlist(user.id);
      setWatchlist(loadedWatchlist);
    } catch (error) {
      console.error("Failed to load progress:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function getCourseProgress(courseId: string): UserCourseProgress | null {
    return courseProgress.get(courseId) || null;
  }

  function getModuleProgress(courseId: string, moduleId: string): ModuleProgress | null {
    const progress = courseProgress.get(courseId);
    return progress?.modules[moduleId] || null;
  }

  async function enrollCourse(courseId: string): Promise<void> {
    if (!user?.id) return;

    const existing = courseProgress.get(courseId);
    if (existing) return;

    const course = courseDataProvider.getCourseById(courseId);
    if (!course) return;

    const newProgress: UserCourseProgress = {
      userId: user.id,
      courseId,
      progress: 0,
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      totalTimeSpent: 0,
      modules: {},
    };

    // Initialize all modules
    course.modules.forEach((module) => {
      newProgress.modules[module.id] = {
        moduleId: module.id,
        isCompleted: false,
        isStarted: false,
        videoProgress: {
          videoUrl: module.videoUrl,
          currentTime: 0,
          duration: 0,
          watchedPercentage: 0,
          isCompleted: false,
          lastWatchedAt: new Date().toISOString(),
        },
        lastAccessedAt: new Date().toISOString(),
        timeSpent: 0,
      };
    });

    await ProgressStorage.saveCourseProgress(newProgress);
    setCourseProgress(new Map(courseProgress.set(courseId, newProgress)));
  }

  async function updateVideoProgress(
    courseId: string,
    moduleId: string,
    currentTime: number,
    duration: number,
    videoUrl: string
  ): Promise<void> {
    if (!user?.id) return;

    let progress = courseProgress.get(courseId);

    if (!progress) {
      await enrollCourse(courseId);
      progress = courseProgress.get(courseId);
      if (!progress) return;
    }

    const now = new Date().toISOString();
    const watchedPercentage = ProgressCalculator.calculateWatchedPercentage(
      currentTime,
      duration
    );
    const isCompleted = ProgressCalculator.isVideoCompleted(watchedPercentage);

    const videoProgress: VideoProgress = {
      videoUrl,
      currentTime,
      duration,
      watchedPercentage,
      isCompleted,
      lastWatchedAt: now,
    };

    const moduleProgress: ModuleProgress = {
      moduleId,
      isCompleted,
      isStarted: true,
      videoProgress,
      lastAccessedAt: now,
      completedAt: isCompleted ? now : undefined,
      timeSpent: progress.modules[moduleId]?.timeSpent || 0,
    };

    progress.modules[moduleId] = moduleProgress;
    progress.lastAccessedAt = now;
    progress.progress = ProgressCalculator.calculateCourseProgress(progress.modules);

    if (progress.progress === 100 && !progress.completedAt) {
      progress.completedAt = now;
    }

    await ProgressStorage.saveCourseProgress(progress);
    setCourseProgress(new Map(courseProgress.set(courseId, progress)));
    await updateWatchlist(courseId, moduleId, progress);
  }

  async function completeModule(courseId: string, moduleId: string): Promise<void> {
    if (!user?.id) return;

    const progress = courseProgress.get(courseId);
    if (!progress) return;

    const now = new Date().toISOString();
    const moduleProgress = progress.modules[moduleId];

    if (moduleProgress) {
      moduleProgress.isCompleted = true;
      moduleProgress.completedAt = now;
      moduleProgress.videoProgress.isCompleted = true;
      moduleProgress.videoProgress.watchedPercentage = 100;
    }

    progress.progress = ProgressCalculator.calculateCourseProgress(progress.modules);
    progress.lastAccessedAt = now;

    if (progress.progress === 100 && !progress.completedAt) {
      progress.completedAt = now;
    }

    await ProgressStorage.saveCourseProgress(progress);
    setCourseProgress(new Map(courseProgress.set(courseId, progress)));
    await updateWatchlist(courseId, moduleId, progress);
  }

  async function updateWatchlist(
    courseId: string,
    moduleId: string,
    progress: UserCourseProgress
  ): Promise<void> {
    if (!user?.id) return;

    const course = courseDataProvider.getCourseById(courseId);
    if (!course) return;

    const module = course.modules.find((m) => m.id === moduleId);
    if (!module) return;

    const moduleProgress = progress.modules[moduleId];
    if (!moduleProgress) return;

    const shouldShow = ProgressCalculator.shouldShowInContinueWatching(
      progress.progress,
      moduleProgress.isStarted
    );

    let updatedWatchlist = [...watchlist];

    if (shouldShow && !moduleProgress.isCompleted) {
      const existingIndex = updatedWatchlist.findIndex(
        (item) => item.courseId === courseId
      );

      const watchlistItem: WatchlistItem = {
        courseId,
        moduleId,
        courseTitle: course.title,
        moduleTitle: module.title,
        courseThumbnail: course.thumbnail,
        lastWatchedAt: moduleProgress.lastAccessedAt,
        videoProgress: moduleProgress.videoProgress,
        courseProgress: progress.progress,
      };

      if (existingIndex >= 0) {
        updatedWatchlist[existingIndex] = watchlistItem;
      } else {
        updatedWatchlist.push(watchlistItem);
      }
    } else {
      updatedWatchlist = updatedWatchlist.filter(
        (item) => item.courseId !== courseId
      );
    }

    updatedWatchlist.sort(
      (a, b) =>
        new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
    );

    updatedWatchlist = updatedWatchlist.slice(0, 10);

    setWatchlist(updatedWatchlist);
    await ProgressStorage.saveWatchlist(user.id, updatedWatchlist);
  }

  async function refreshWatchlist(): Promise<void> {
    if (!user?.id) return;
    const loadedWatchlist = await ProgressStorage.loadWatchlist(user.id);
    setWatchlist(loadedWatchlist);
  }

  return (
    <ProgressContext.Provider
      value={{
        courseProgress,
        watchlist,
        isLoading,
        getCourseProgress,
        getModuleProgress,
        updateVideoProgress,
        completeModule,
        enrollCourse,
        refreshWatchlist,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
