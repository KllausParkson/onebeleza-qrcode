"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, FolderOpen, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearActivity } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/qrcodes", label: "QR Codes", icon: QrCode, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    clearActivity();
    router.push("/auth");
  }

  return (
    <aside className="w-56 min-h-screen bg-[#2a2a2a] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <QrCode className="w-6 h-6 text-green-400" />
          <span className="text-white font-semibold text-sm">OneBeleza QrCode</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <input
          type="text"
          placeholder="Buscar QR Codes..."
          className="w-full text-xs bg-white/10 text-white placeholder:text-white/40 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-green-500/20 text-green-400"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 pb-1 px-3">
          <p className="text-xs text-white/30 uppercase tracking-wider">Pastas</p>
        </div>
        <Link
          href="/admin/qrcodes"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/10"
        >
          <FolderOpen className="w-4 h-4" />
          Sem pasta
        </Link>
      </nav>

      {/* Create button */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/admin/qrcodes/new"
          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Criar QR Code
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2.5 mx-3 mb-4 px-3 py-2 rounded-md text-sm text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    </aside>
  );
}
