'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api';

const initialFormData = {
  title: '',
  description: '',
  price: '',
  image: null,
};

export default function AddCourse({ onCreated }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.files ? event.target.files[0] : event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setMessage('');
    setIsSubmitting(true);

    try {
      const courseData = new FormData();
      courseData.append('title', formData.title);
      courseData.append('description', formData.description);
      courseData.append('price', formData.price);

      if (formData.image) {
        courseData.append('image', formData.image);
      }

      const response = await authFetch('/courses', {
        method: 'POST',
        body: courseData,
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || {});
        setMessage(data.message || 'Course could not be created.');
        return;
      }

      onCreated(data.course);
      setFormData(initialFormData);
      setMessage('Course created.');
    } catch {
      setMessage('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h2>Create course</h2>

      <div>
        <label htmlFor="course-title">Title</label>
        <input
          id="course-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <p>{errors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="course-description">Description</label>
        <textarea
          id="course-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <p>{errors.description[0]}</p>}
      </div>

      <div>
        <label htmlFor="course-price">Price</label>
        <input
          id="course-price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
        />
        {errors.price && <p>{errors.price[0]}</p>}
      </div>

      <div>
        <label htmlFor="course-image">Image</label>
        <input
          id="course-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          required
        />
        {errors.image && <p>{errors.image[0]}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create course'}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
