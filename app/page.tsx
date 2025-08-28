import {
  SignInButton,
  SignOutButton,
  UserInfo,
} from "./components/AuthButtons";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <UserInfo />
      <div className="flex gap-4 mt-4">
        <SignInButton />
        <SignOutButton />
      </div>
    </div>
  );
}
