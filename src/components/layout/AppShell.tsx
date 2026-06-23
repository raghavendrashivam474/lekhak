// src/components/layout/AppShell.tsx

import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0F1623]">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopNav />
        <main className="flex-1 p-6 text-[#F5ECD7]">
          {children}
        </main>
      </div>
    </div>
  );
}