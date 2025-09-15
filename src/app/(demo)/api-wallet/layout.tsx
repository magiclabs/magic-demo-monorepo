import "../globals.css";
import SessionProviderComponent from "../../../providers/SessionProvider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProviderComponent>{children}</SessionProviderComponent>
  );
}
