# Frontvibecoding

> Previous version of the Course Platform frontend.  
> The actively maintained version is now available in **[junior-frontend-app](https://github.com/artushhhd/junior-frontend-app)**.

This repository contains the earlier Next.js implementation of the course platform frontend. It is preserved as part of the project's development history.

## backend 
> backend  **[bacendVibeCoding](https://github.com/artushhhd/BackVibeCoding)**

## Project Overview

The application provides a frontend for a Laravel course marketplace API.

It includes:

- Authentication
- Course browsing
- Course creation
- Course interactions
- User profile
- Centralized API communication

The current version extends this foundation with a more complete application structure and administration interface.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework / App Router |
| React 19 | UI |
| JavaScript | Application code |
| Fetch API | Backend communication |
| CSS | Styling |

## Implemented Features

### Authentication

- Registration
- Login
- Token persistence in `localStorage`
- Authenticated API requests
- Logout handling
- Automatic token cleanup after `401 Unauthorized`

### Course Platform

- Course feed
- Course creation with image upload
- Like / unlike
- Purchase action
- Author-only course deletion
- Profile page

### API Integration

All requests are centralized through `lib/api.js`.

The API helper is responsible for:

- Bearer token attachment
- Request headers
- API URL configuration
- Authentication error handling

The backend URL is configured through an environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Project Structure

```text
app/
├── page.js
├── Course.jsx
├── addCourse.jsx
├── TopBar.jsx
├── login/
├── register/
├── profile/
└── layout.js

lib/
└── api.js
```

## Backend

This frontend was built to work with the previous Laravel API:

**[BackVibeCoding](https://github.com/artushhhd/BackVibeCoding)**

For the current full-stack version, use:

**[junior-frontend-app](https://github.com/artushhhd/junior-frontend-app)**

with:

**[junior-backend-api](https://github.com/artushhhd/junior-backend-api)**

## Installation

```bash
git clone https://github.com/artushhhd/Frontvibecoding.git
cd Frontvibecoding

npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

The application runs by default at:

```text
http://localhost:3000
```

The Laravel backend must be running at the configured API URL.

## Project History

This repository represents an earlier stage of the frontend.

It is intentionally preserved to show the progression of the project from a basic course marketplace client to the current full-stack implementation.

For the actively maintained version, see **[junior-frontend-app](https://github.com/artushhhd/junior-frontend-app)**.
