'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function Course({
  course,
  currentUser,
}) {
  const queryClient = useQueryClient();
  const isAuthor = currentUser?.id === course.user_id;

  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const isLiked = course.liked_by_current_user;
      const res = await authFetch(`/courses/${course.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });
      if (!res.ok) throw new Error('Like failed');
      return res.status === 204 ? null : res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      const previousCourses = queryClient.getQueryData(['courses']);
      queryClient.setQueryData(['courses'], (old = []) => 
        old.map(c => c.id === course.id ? { ...c, liked_by_current_user: !c.liked_by_current_user } : c)
      );
      return { previousCourses };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['courses'], context.previousCourses);
      toast.error(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });

  const { mutate: buyCourse, isPending: isBuying } = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/courses/${course.id}/purchase`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Purchase failed');
      }
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      const previousCourses = queryClient.getQueryData(['courses']);
      queryClient.setQueryData(['courses'], (old = []) => 
        old.map(c => c.id === course.id ? { ...c, purchased_by_current_user: true } : c)
      );
      return { previousCourses };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['courses'], context.previousCourses);
      toast.error(err.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/courses/${course.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Removed');
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <article className=\"bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-500 hover:border-black group flex flex-col h-full\">
      <div className=\"aspect-video w-full overflow-hidden rounded-2xl bg-gray-50 mb-6 relative group-hover:shadow-inner transition-all\">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className=\"w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105\"
          />
        ) : (
          <div className=\"w-full h-full flex items-center justify-center text-gray-300 text-[10px] uppercase tracking-widest\">No Image Available</div>
        )}
      </div>

      <div className=\"flex-grow space-y-4\">
        <div className=\"flex justify-between items-start gap-2\">
          <h2 className=\"text-xl font-semibold text-black leading-tight group-hover:text-indigo-600 transition-colors duration-300\">
            {course.title}
          </h2>
          <span className=\"text-sm font-mono text-gray-400\">${course.price}</span>
        </div>

        <p className=\"text-gray-500 text-sm leading-relaxed line-clamp-2\">
          {course.description}
        </p>

        <div className=\"flex items-center justify-between py-4 border-y border-gray-50 text-[10px] uppercase tracking-tighter text-gray-400\">
          <div className=\"flex items-center gap-2\">
            <span>Author:</span> <span className=\"text-gray-700 font-medium\">{course.author?.name || 'Unknown'}</span>
          </div>
          <div className=\"flex items-center gap-2\">
            <span>Likes:</span> <span className=\"text-gray-700 font-medium\">{course.likes_count}</span>
          </div>
        </div>

        <div className=\"grid grid-cols-2 gap-3 mt-auto pt-2\">
          <button
            onClick={() => toggleLike()}
            disabled={isLiking}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
              course.liked_by_current_user 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-black hover:text-black'
            }`}
          >
            {course.liked_by_current_user ? 'Liked' : 'Like'}
          </button>

          <button
            onClick={() => buyCourse()}
            disabled={isBuying || course.purchased_by_current_user}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
              course.purchased_by_current_user
                ? 'bg-gray-50 text-gray-300 border-gray-50 cursor-default'
                : 'bg-white text-black border-black hover:bg-black hover:text-white'
            }`}
          >
            {course.purchased_by_current_user ? 'Owned' : 'Purchase'}
          </button>

          {isAuthor && (
            <button
              onClick={() => deleteCourse()}
              disabled={isDeleting}
              className=\"col-span-2 py-2 text-[10px] font-medium text-gray-300 hover:text-red-500 transition-colors uppercase tracking-widest\"
            >
              Delete Course
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
