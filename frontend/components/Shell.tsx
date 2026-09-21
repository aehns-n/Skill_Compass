"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  LayoutDashboard,
  Network,
  Crosshair,
  Route,
  BookOpen,
  TrendingUp,
  Compass,
  ChevronRight,
  Sparkles,
  Award,
  RotateCcw,
} from "lucide-react";
import { usePrototype } from "@/context/PrototypeContext";
import { DemoNavigator } from "@/components/DemoNavigator";

const navItems = [
  { href: "/dashboard", label: "Competency Dashboard", icon: LayoutDashboard },
  { href: "/graph", label: "Competency Graph", icon: Network },
  { href: "/gaps", label: "Skill Gap Analysis", icon: Crosshair },
  { href: "/learning", label: "Learning Roadmap", icon: Route },
  { href: "/learn/module", label: "Learning Material", icon: BookOpen },
  { href: "/progress", label: "Progress & Growth", icon: TrendingUp },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm ring-1 ring-brand-500/30">
        <Compass className="h-5 w-5" />
      </span>
      {!compact && (
        <div className="flex flex-col">
          <span className="text-base font-black tracking-tight text-ink-900">
            SkillCompass
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">
            Competency Intelligence
          </span>
        </div>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, learnerName, pythonAfter, diagnosticDone, reset } = usePrototype();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-ink-200 px-5">
        <Logo />
      </div>

      <div className="px-3 pt-4">
        <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-ink-400">
          Workflow Navigation
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 font-semibold text-brand-700 shadow-xs ring-1 ring-brand-200/60"
                  : "text-ink-600 hover:bg-ink-100/70 hover:text-ink-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition ${
                  active ? "text-brand-600" : "text-ink-400 group-hover:text-ink-700"
                }`}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Target Role & Learner Profile Card */}
      <div className="border-t border-ink-200 bg-ink-50/50 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 ring-2 ring-white">
            {learnerName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink-900">{learnerName}</p>
            <p className="truncate text-[11px] text-ink-500 font-medium">{role?.title ?? "Statistical Officer"}</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-ink-200 bg-white p-2.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-ink-500">Python Status:</span>
            <span className="font-bold tabular-nums text-ink-900">
              {pythonAfter != null ? (
                <span className="text-emerald-700 font-bold">{pythonAfter}% (+38)</span>
              ) : diagnosticDone ? (
                <span className="text-red-600 font-bold">34% (Gap 41)</span>
              ) : (
                <span className="text-ink-400">Not assessed</span>
              )}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-ink-400">
            <span>Benchmark:</span>
            <span className="font-semibold text-ink-600">≥ 75% required</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-1 text-[11px]">
          <Link
            href="/onboarding"
            className="font-medium text-brand-700 hover:underline"
          >
            Change Role
          </Link>
          <button
            onClick={reset}
            className="flex items-center gap-1 font-medium text-ink-500 hover:text-ink-800"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopNavbar({ title, breadcrumb }: { title: string; breadcrumb?: string[] }) {
  const { role, diagnosticDone, pythonAfter } = usePrototype();

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="font-medium text-ink-500 hover:text-ink-800">
          SkillCompass
        </Link>
        {breadcrumb?.map((b) => (
          <React.Fragment key={b}>
            <ChevronRight className="h-3.5 w-3.5 text-ink-400 shrink-0" />
            <span className="font-semibold text-ink-900">{b}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-ink-600 font-medium">
            Active Role: <strong className="text-ink-900">{role?.title ?? "Statistical Officer"}</strong>
          </span>
        </div>

        <span className="lg:hidden">
          <Logo compact />
        </span>
      </div>
    </header>
  );
}

export function Shell({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <DemoNavigator />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar title={title} breadcrumb={breadcrumb} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-2xl font-black tracking-tight text-ink-900">{title}</h1>
            </div>
            <div className="animate-fade-up">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

