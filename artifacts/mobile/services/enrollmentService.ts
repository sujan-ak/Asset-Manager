import { supabase } from '@/lib/supabase';

export async function enrollInCourse(userId: string, courseId: string, isFree: boolean) {
  const { error } = await supabase.from('enrollments').upsert(
    {
      user_id: userId,
      course_id: courseId,
      payment_status: isFree ? 'completed' : 'pending',
    },
    { onConflict: 'user_id,course_id' },
  );
  if (error) throw error;
}

export async function fetchEnrolledCourses(userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(
      'course_id, enrolled_at, completed_at, courses(id, title, category, level, thumbnail_url, is_free, price, slug)',
    )
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();
  return !!data;
}
