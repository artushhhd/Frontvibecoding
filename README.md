# Frontvibecoding

Frontend for a course marketplace, built with Next.js App Router + React. Talks to the Laravel API here: [BackVibeCoding](https://github.com/artushhhd/BackVibeCoding).

## Stack

- Next.js 16 (App Router), React 19
- Plain CSS
- `lib/api.js` — small fetch wrapper that attaches the Bearer token and clears it on a 401

## What's implemented

- Register / login, token stored in `localStorage` via `lib/api.js`
- Top bar showing the logged-in user, hidden on `/login` and `/register`
- Course feed (`/`) — loads profile + courses in parallel, shows a create-course form to logged-in users
- Create a course with an image
- Like / unlike, buy a course — each action calls the API and merges the updated course back into local state (no full page refetch)
- Delete a course — only shown to the course's own author
- Profile page

## Structure

```
app/
├── page.js            # course feed (root route)
├── Course.jsx           # single course card — like/buy/delete
├── addCourse.jsx         # create course form
├── TopBar.jsx              # nav bar, fetches current user
├── login/                   # login page
├── register/                 # register page
├── profile/                    # profile page
└── layout.js
lib/
└── api.js               # token storage + authenticated fetch helper
```

## Connecting to the backend

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

All requests go through `authFetch()` in `lib/api.js`, so the token and headers are handled in one place instead of being repeated per page.

## Running locally

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Runs on `http://localhost:3000`. Needs the backend running too ([BackVibeCoding](https://github.com/yourname/BackVibeCoding)).

## Known gaps

- role is fetched (`user.role`) and checked in `TopBar.jsx`, but there's no page it actually gates yet
- no client-side form validation, relies on server error messages
- no automated tests yet
