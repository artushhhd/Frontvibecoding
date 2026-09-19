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

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!getToken()) throw new Error('No token');
      const res = await authFetch('/profile');
      if (!res.ok) throw new Error('Session expired');
      return res.json();
    },
    retry: false,
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await authFetch('/courses');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      return data.courses;
    },
    enabled: !!profileData,
  });

  if (profileLoading || coursesLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-screen bg-[#fafafa]\">
        <div className=\"flex flex-col items-center gap-3\">
          <div className=\"w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin\" />
          <p className=\"text-xs font-medium text-gray-400 tracking-widest uppercase\">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <main className=\"max-w-6xl mx-auto px-6 py-16 space-y-20 bg-[#fafafa] min-h-screen font-sans\">
      <header className=\"flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12\">
        <div className=\"space-y-3\">
          <h1 className=\"text-6xl font-bold tracking-tighter text-black\">Library</h1>
          <p className=\"text-gray-400 font-light text-lg\">Curated knowledge for the modern era.</p>
        </div>
        <div className=\"flex items-center gap-3 px-5 py-2 bg-white border border-gray-100 rounded-full shadow-sm">
          <div className=\"w-2 h-2 bg-green-500 rounded-full animate-pulse\" />
          <span className=\"text-xs font-medium text-gray-600\">{profileData?.user?.name}</span>
        </div>
      </header>

      <section className=\"grid grid-cols-1 lg:grid-cols-3 gap-16\">
        <div className=\"lg:col-span-1">
          <div className=\"sticky top-8 space-y-8">
            <div className=\"bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <h3 className=\"text-xs font-bold uppercase tracking-widest text-gray-400 mb-6\">Publish Course</h3>
              <AddCourse 
                onCreated={() => {
                  queryClient.invalidateQueries({ queryKey: ['courses'] });
                  toast.success('Course published');
                }} 
              />
            </div>
            <div className=\"p-8 bg-black rounded-3xl text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <p className=\"text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2\">Your Balance</p>
              <p className=\"text-4xl font-light tracking-tight\">${profileData?.user?.balance || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className=\"lg:col-span-2 space-y-12\">
          <div className=\"flex items-center gap-6">
            <h2 className=\"text-2xl font-medium text-black\">Available Modules</h2>
            <div className=\"h-px flex-grow bg-gray-200\" />
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-10\">
            {coursesData?.length === 0 ? (
              <div className=\"col-span-full py-24 text-center border border-dashed border-gray-200 rounded-3xl bg-white\">
                <p className=\"text-gray-400 font-light\">The library is currently empty.</p>
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
                    toast.success('Removed from library');
                  }}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
