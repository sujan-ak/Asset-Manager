import { COURSES } from '@/data/mockData';
import type { Course, Module } from '@/data/mockData';

/**
 * Get course by ID
 * TODO: Replace mockData lookup with Supabase query
 * when courses table is ready. Function signature
 * should remain unchanged for callers.
 */
export function getCourseById(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

/**
 * Get modules for a specific course
 * TODO: Replace mockData lookup with Supabase query
 * when courses table is ready. Function signature
 * should remain unchanged for callers.
 */
export function getCourseModules(courseId: string): Module[] {
  const course = COURSES.find((c) => c.id === courseId);
  return course?.modules || [];
}
