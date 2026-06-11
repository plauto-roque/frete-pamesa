import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-60">
          <Header />
          <main className="flex-1 overflow-auto pt-16">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
