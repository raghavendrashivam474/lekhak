// src/components/layout/TopNav.tsx

"use client";

import { useRouter } from "next/navigation";
import { Search, LogOut } from "lucide-react";
import { signOut } from "@/services/auth";

export default function TopNav() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="h-14 bg-[#1A2333] border-b border-[#2A3A52] flex items-center justify-between px-6">

      <div className="flex items-center gap-2 bg-[#0F1623] border border-[#2A3A52] rounded-lg px-3 py-2 w-64">
        <Search size={14} className="text-[#4A5A6A]" />
        <span className="text-sm text-[#4A5A6A]">Search...</span>
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-sm text-[#8A9BB0] hover:text-[#F5ECD7] transition-colors"
      >
        <LogOut size={16} />
        Sign out
      </button>

    </header>
  );
}