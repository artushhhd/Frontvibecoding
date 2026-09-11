'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api';
import './Course.css';

export default function Course({
  course,
  currentUser,
  onCourseChange,
  onDeleted,
}) {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAuthor = currentUser?.id === course.user_id;

  const request = async (path, options, successMessage) => {
    setIsProcessing(true);
    setMessage('');

    try {
      const response = await authFetch(path, options);

      const data =
        response.status === 204
          ? null
          : await response.json();

      if (!response.ok) {
        setMessage(data?.message || 'Request failed.');
        return;
      }

      if (data?.course) {
        onCourseChange(data.course);
      }

      setMessage(successMessage);
    } catch {
      setMessage('Network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLike = () => {
    const isLiked = course.liked_by_current_user;

    return request(
      `/courses/${course.id}/like`,
      {
        method: isLiked ? 'DELETE' : 'POST',
      },
      isLiked ? 'Like removed.' : 'Course liked.'
    );
  };

  const handleBuy = () => {
    return request(
      `/courses/${course.id}/purchase`,
      {
        method: 'POST',
      },
      course.purchased_by_current_user
        ? 'Already purchased.'
        : 'Course purchased.'
    );
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    setMessage('');

    try {
      const response = await authFetch(
        `/courses/${course.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();

        setMessage(
          data?.message || 'Course cannot be deleted.'
        );

        return;
      }

      onDeleted(course.id);
    } catch {
      setMessage('Network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article className="course-card">

      {course.image_url && (
        <img
          src={course.image_url}
          alt={course.title}
          className="course-image"
        />
      )}

      <div className="course-content">

        <h2 className="course-title">
          {course.title}
        </h2>

        <p className="course-description">
          {course.description}
        </p>

        <div className="course-info">

          <p className="course-price">
            Price: {course.price}
          </p>

          <p className="course-author">
            Author: {course.author?.name || 'Unknown'}
          </p>

          <p className="course-likes">
            Likes: {course.likes_count}
          </p>

        </div>

        <div className="course-actions">

          <button
            type="button"
            onClick={handleLike}
            disabled={isProcessing}
            className="course-button like-button"
          >
            {course.liked_by_current_user
              ? 'Unlike'
              : 'Like'}
          </button>

          <button
            type="button"
            onClick={handleBuy}
            disabled={
              isProcessing ||
              course.purchased_by_current_user
            }
            className="course-button buy-button"
          >
            {course.purchased_by_current_user
              ? 'Purchased'
              : 'Buy'}
          </button>

          {isAuthor && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isProcessing}
              className="course-button delete-button"
            >
              Delete
            </button>
          )}

        </div>

        {message && (
          <p className="course-message">
            {message}
          </p>
        )}

      </div>
    </article>
  );
}

