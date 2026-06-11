import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: string;
  variant?: "default" | "warning" | "danger";
}

export function KpiCard({ title, value, sub, icon, variant = "default" }: KpiCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <p className="text-sm text-on-surface-variant">{title}</p>
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            variant === "danger" ? "bg-red-500/10" :
            variant === "warning" ? "bg-tertiary/10" :
            "bg-primary-container"
          )}
        >
          <span
            className={cn(
              "material-symbols-outlined msym-lg",
              variant === "danger" ? "text-red-400" :
              variant === "warning" ? "text-tertiary" :
              "text-primary"
            )}
          >
            {icon}
          </span>
        </div>
      </div>
      <div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            variant === "danger" ? "text-red-400" :
            variant === "warning" ? "text-tertiary" :
            "text-on-surface"
          )}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs text-on-surface-variant mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}
