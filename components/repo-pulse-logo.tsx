import { cn } from "@/lib/utils"

export function RepoPulseLogo({ className }: { className?: string }) {
  return (
    <span className={cn("repo-pulse-logo", className)} aria-label="RepoPulse">
      <svg
        aria-hidden="true"
        className="repo-pulse-logo-mark"
        viewBox="0 0 48 32"
      >
        <path d="M2 17h9l4-13 7 26 6-19 4 6h14" />
      </svg>
      <span>Repo</span>
      <span className="repo-pulse-logo-accent">Pulse</span>
    </span>
  )
}
