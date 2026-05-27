import ProfilePage from "./profile_page";

export default async function StaffProfileRoute({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <ProfilePage username={username} />;
}
