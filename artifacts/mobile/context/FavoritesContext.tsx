import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContextSupabase";
import {
  FavoriteCourse,
  WatchLaterLesson,
  FavoritesStorage,
} from "@/lib/favoritesStorage";

interface FavoritesContextType {
  favoriteCourses: FavoriteCourse[];
  watchLaterLessons: WatchLaterLesson[];
  isFavoriteCourse: (courseId: string) => boolean;
  isInWatchLater: (lessonId: string) => boolean;
  toggleFavoriteCourse: (course: {
    id: string;
    title: string;
    thumbnail: any;
    category: string;
    price: number;
    isFree: boolean;
  }) => Promise<void>;
  toggleWatchLater: (lesson: {
    courseId: string;
    moduleId: string;
    lessonId: string;
    courseTitle: string;
    lessonTitle: string;
    courseThumbnail: any;
  }) => Promise<void>;
  removeFavoriteCourse: (courseId: string) => Promise<void>;
  removeFromWatchLater: (lessonId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteCourses, setFavoriteCourses] = useState<FavoriteCourse[]>([]);
  const [watchLaterLessons, setWatchLaterLessons] = useState<WatchLaterLesson[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadAllFavorites();
    } else {
      setFavoriteCourses([]);
      setWatchLaterLessons([]);
    }
  }, [user?.id]);

  async function loadAllFavorites() {
    if (!user?.id) return;

    try {
      const [courses, lessons] = await Promise.all([
        FavoritesStorage.loadFavoriteCourses(user.id),
        FavoritesStorage.loadWatchLater(user.id),
      ]);
      setFavoriteCourses(courses);
      setWatchLaterLessons(lessons);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }

  function isFavoriteCourse(courseId: string): boolean {
    return favoriteCourses.some((c) => c.courseId === courseId);
  }

  function isInWatchLater(lessonId: string): boolean {
    return watchLaterLessons.some((l) => l.lessonId === lessonId);
  }

  async function toggleFavoriteCourse(course: {
    id: string;
    title: string;
    thumbnail: any;
    category: string;
    price: number;
    isFree: boolean;
  }): Promise<void> {
    if (!user?.id) return;

    const existingIndex = favoriteCourses.findIndex(
      (c) => c.courseId === course.id
    );

    let updatedCourses: FavoriteCourse[];

    if (existingIndex >= 0) {
      updatedCourses = favoriteCourses.filter(
        (c) => c.courseId !== course.id
      );
    } else {
      const newFavorite: FavoriteCourse = {
        courseId: course.id,
        courseTitle: course.title,
        courseThumbnail: course.thumbnail,
        category: course.category,
        price: course.price,
        isFree: course.isFree,
        savedAt: new Date().toISOString(),
      };
      updatedCourses = [newFavorite, ...favoriteCourses];
    }

    setFavoriteCourses(updatedCourses);
    await FavoritesStorage.saveFavoriteCourses(user.id, updatedCourses);
  }

  async function toggleWatchLater(lesson: {
    courseId: string;
    moduleId: string;
    lessonId: string;
    courseTitle: string;
    lessonTitle: string;
    courseThumbnail: any;
  }): Promise<void> {
    if (!user?.id) return;

    const existingIndex = watchLaterLessons.findIndex(
      (l) => l.lessonId === lesson.lessonId
    );

    let updatedLessons: WatchLaterLesson[];

    if (existingIndex >= 0) {
      updatedLessons = watchLaterLessons.filter(
        (l) => l.lessonId !== lesson.lessonId
      );
    } else {
      const newLesson: WatchLaterLesson = {
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        lessonId: lesson.lessonId,
        courseTitle: lesson.courseTitle,
        lessonTitle: lesson.lessonTitle,
        courseThumbnail: lesson.courseThumbnail,
        savedAt: new Date().toISOString(),
      };
      updatedLessons = [newLesson, ...watchLaterLessons];
    }

    setWatchLaterLessons(updatedLessons);
    await FavoritesStorage.saveWatchLater(user.id, updatedLessons);
  }

  async function removeFavoriteCourse(courseId: string): Promise<void> {
    if (!user?.id) return;

    const updatedCourses = favoriteCourses.filter(
      (c) => c.courseId !== courseId
    );
    setFavoriteCourses(updatedCourses);
    await FavoritesStorage.saveFavoriteCourses(user.id, updatedCourses);
  }

  async function removeFromWatchLater(lessonId: string): Promise<void> {
    if (!user?.id) return;

    const updatedLessons = watchLaterLessons.filter(
      (l) => l.lessonId !== lessonId
    );
    setWatchLaterLessons(updatedLessons);
    await FavoritesStorage.saveWatchLater(user.id, updatedLessons);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoriteCourses,
        watchLaterLessons,
        isFavoriteCourse,
        isInWatchLater,
        toggleFavoriteCourse,
        toggleWatchLater,
        removeFavoriteCourse,
        removeFromWatchLater,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
