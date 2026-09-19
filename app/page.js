'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AddCourse from './addCourse';
import Course from './Course';
import { authFetch, getToken } from '@/lib/api';

export default function CoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Profile
  const { data: profileData, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!getToken()) throw new Error('No token found');
      const res = await authFetch('/profile');
      if (!res.ok) throw new Error('Session expired');
      return res.json();
    },
    retry: false,
    onError: () => router.replace('/login'),
  });

  // Fetch Courses
  const { data: coursesData, isLoading: coursesLoading, isError: coursesError } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await authFetch('/courses');
      if (!res.ok) throw new Error('Courses could not be loaded');
      const data = await res.json();
      return data.courses;
    },
    enabled: !!profileData,
  });

  if (profileLoading || coursesLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-screen\">
        <p className=\"text-lg font-medium text-gray-500 animate-pulse\">Loading your vibe...</p>
      </div>
    );
  }

  if (profileError || coursesError) {
    return (
      <div className=\"flex items-center justify-center min-h-screen\">
        <div className=\"text-center p-8 bg-red-50 rounded-lg border border-red-200\">
          <p className=\"text-red-600 font-semibold\">{profileError?.message || coursesError?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => router.replace('/login')}
            className=\"mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors\"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className=\"max-w-6xl mx-auto p-6 space-y la-8\">
      <div className=\"flex items-center justify-between mb-8\">
        <h1 className=\"text-4xl font-bold tracking-tight text-gray-900\">Course Library</h1>
        <div className=\"text-sm text-gray-500\">
          Welcome back, <span className=\"font-semibold text-gray-800\">{profileData?.user?.name}</span>
        </div>
      </div>

      <div className=\"bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <AddCourse 
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success('Course added successfully!');
          }} 
        />
      </div>

      <section className=\"space-y-6\">
        <h2 className=\"text-2xl font-semibold text-gray-800\">All available courses</h2>
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData?.length === 0 ? (
            <div className=\"col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className=\"text-gray-500\">No courses available yet. Be the first to add one!</p>
            </div>
          ) : (
            coursesData?.map((course) => (
              <Course
                key={course.id}
                course={course}
                currentUser={profileData?.user}
                onCourseChange={() => queryClient.invalidateQueries({ queryKey: ['courses'] })}
                onDeleted={() => {
                  queryClient.invalidateQueries({ queryKey: ['courses'] });
                  toast.success('Course deleted');
                }}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
