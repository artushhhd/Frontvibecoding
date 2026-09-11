'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddCourse from './addCourse';
import Course from './Course';
import { authFetch, getToken } from '@/lib/api';

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      if (!getToken()) {
        router.replace('/login');
        return;
      }

      try {
        const [profileResponse, coursesResponse] = await Promise.all([
          authFetch('/profile'),
          authFetch('/courses'),
        ]);

        if (!profileResponse.ok) {
          router.replace('/login');
          return;
        }

        const profileData = await profileResponse.json();

        if (!coursesResponse.ok) {
          const data = await coursesResponse.json();
          throw new Error(data.message || 'Courses could not be loaded.');
        }

        const coursesData = await coursesResponse.json();

        if (!cancelled) {
          setUser(profileData.user);
          setCourses(coursesData.courses);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || 'Network error.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const replaceCourse = (updatedCourse) => {
    setCourses((current) =>
      current.map((course) => (course.id === updatedCourse.id ? updatedCourse : course))
    );
  };

  return (
    <main>
      <h1>Courses</h1>

      {loading && <p>Loading courses...</p>}
      {error && <p>{error}</p>}

      {!loading && user && (
        <>
          <AddCourse onCreated={(course) => setCourses((current) => [course, ...current])} />

          <section>
            <h2>All courses</h2>
            {courses.length === 0 ? (
              <p>No courses yet.</p>
            ) : (
              courses.map((course) => (
                <Course
                  key={course.id}
                  course={course}
                  currentUser={user}
                  onCourseChange={replaceCourse}
                  onDeleted={(courseId) =>
                    setCourses((current) => current.filter((course) => course.id !== courseId))
                  }
                />
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}
