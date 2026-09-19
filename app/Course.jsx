'use client';

import { useState } from 'react';
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
      if (!res.ok) throw new Error('Failed to update like');
      return res.status === 204 ? null : res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(course.liked_by_current_user ? 'Like removed' : 'Course liked!');
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: buyCourse, isPending: isBuying } = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/courses/${course.id}/purchase`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Purchase failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course purchased successfully!');
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: deleteCourse, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/courses/${course.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course removed');
    },
    onError: (err) => toast.error(err.message),
  });

  const isProcessing = isLiking || isBuying || isDeleting;

  return (
    <article className=\"bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col\">
      {course.image_url && (
        <div className=\"aspect-video w-full overflow-hidden bg-gray-200\">
          <img
            src={course.image_url}
            alt={course.title}
            className=\"w-full h-full object-cover hover:scale-105 transition-transform duration-500\"
          />
        </div>
      )}

      <div className=\"p-5 flex flex-col flex-grow\">
        <div className=\"flex justify-between items-start mb-2\">
          <h2 className=\"text-xl font-bold text-gray-900 line-clamp-1\">
            {course.title}
          </h2>
          <span className=\"bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full\">
            ${course.price}
          </span>
        </div>

        <p className=\"text-gray-600 text-sm line-clamp-3 mb-4 flex-grow\">
          {course.description}
        </p>

        <div className=\"flex items-center justify-between text-xs text-gray-500 mb-6 py-3 border-t border-b border-gray-50\">
          <div className=\"flex items-center gap-1\">
            <span className=\"font-medium\">Author:</span> {course.author?.name || 'Unknown'}
          </div>
          <div className=\"flex items-center gap-1\">
            <span className=\"font-medium\">Likes:</span> {course.likes_count}
          </div>
        </div>

        <div className=\"grid grid-cols-2 gap-3\">
          <button
            type=\"button\"
            onClick={() => toggleLike()}
            disabled={isProcessing}
            className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              course.liked_by_current_user 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {course.liked_by_current_user ? '❤️ Unlike' : '🤍 Like'}
          </button>

          <button
            type=\"button\"
            onClick={() => buyCourse()}
            disabled={isProcessing || course.purchased_by_current_user}
            className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              course.purchased_by_current_user
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
            }`}
          >
            {course.purchased_by_current_user ? '✅ Owned' : '🛒 Buy'}
          </button>

          {isAuthor && (
            <button
              type=\"button\"
              onClick={() => deleteCourse()}
              disabled={isProcessing}
              className=\"col-span-2 py-2 px-4 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-200 border border-transparent hover:border-red-100\"
            >
              Delete Course
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
