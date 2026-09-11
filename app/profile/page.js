import Profile from "./profile";


export const metadata = {
  title: 'profile',
};

export default function ProfilePage() {
  return (
    <main style={{ padding: '2rem' }}>
        <Profile/>
    </main>
  );
}