// src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Users,
  GitBranch,
  Clock,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { label: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard },
  { label: "Projects",    href: "/projects",    icon: FolderOpen      },
  { label: "Notes",       href: "/notes",       icon: FileText        },
  { label: "Characters",  href: "/characters",  icon: Users           },
  { label: "Connections", href: "/connections", icon: GitBranch       },
  { label: "Timeline",    href: "/timeline",    icon: Clock           },
  { label: "Settings",    href: "/settings",    icon: Settings        },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#1A2333] border-r border-[#2A3A52] flex flex-col">

      <div className="px-6 py-5 border-b border-[#2A3A52]">
        <span className="text-[#C9A84C] font-semibold text-lg tracking-wide">
          Lekhak
        </span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                      : "text-[#8A9BB0] hover:bg-[#2A3A52] hover:text-[#C8D6E5]"
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}