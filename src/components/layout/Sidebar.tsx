"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/fretes", label: "Fretes", icon: "local_shipping" },
  { href: "/clientes", label: "Clientes", icon: "groups" },
  { href: "/motoristas", label: "Motoristas", icon: "badge" },
  { href: "/cidades", label: "Cidades", icon: "location_city" },
  { href: "/relatorios", label: "Relatórios", icon: "analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 h-screen bg-surface-container fixed left-0 top-0 z-20">
      <div className="px-6 py-5 mb-2">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-metrica.svg"
            alt="Métrica"
            width={36}
            height={36}
            className="rounded-lg shrink-0"
          />
          <div>
            <h1 className="text-base font-bold text-on-surface tracking-tight leading-tight">Frete PAMESA</h1>
            <p className="text-xs text-on-surface-variant opacity-70">Logística Integrada</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {nav.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-sm transition-colors group",
                active
                  ? "text-primary font-semibold border-r-2 border-primary bg-surface-container-highest"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined msym-lg shrink-0 transition-colors",
                  active ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                )}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-outline-variant">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors group"
        >
          <span className="material-symbols-outlined msym-lg shrink-0 group-hover:text-destructive transition-colors">
            logout
          </span>
          Sair
        </button>
      </div>
    </aside>
  );
}
