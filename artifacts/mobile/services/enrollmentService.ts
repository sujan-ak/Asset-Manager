import { supabase } from '@/lib/supabase';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: number;
  payment_status: string;
  enrolled_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

export async function enrollInCourse(userId: string, courseId: string, isFree: boolean) {
  const { error } = await supabase.from('enrollments').upsert(
    {
      user_id: userId,
      course_id: Number(courseId),
      payment_status: isFree ? 'completed' : 'pending',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    { onConflict: 'user_id,course_id' },
  );
  if (error) throw error;
}

export async function fetchEnrolledCourses(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(
      'course_id, enrolled_at, completed_at, expires_at, courses(id, title, category, level, thumbnail_url, is_free, price, slug)',
    )
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
  const { data } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id, payment_status, enrolled_at, completed_at, expires_at')
    .eq('user_id', userId)
    .eq('course_id', Number(courseId))
    .maybeSingle();
  return data ?? null;
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await getEnrollment(userId, courseId);
  return !!enrollment;
}

export function isExpired(enrollment: Enrollment | null): boolean {
  if (!enrollment) return false;
  if (!enrollment.expires_at) return false;
  return new Date(enrollment.expires_at) < new Date();
}
