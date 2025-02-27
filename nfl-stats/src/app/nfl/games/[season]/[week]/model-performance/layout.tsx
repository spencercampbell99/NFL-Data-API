import AuthProtected from "@/middleware/Auth.middleware";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProtected>{children}</AuthProtected>;
}