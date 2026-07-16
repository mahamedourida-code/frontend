"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, CreditCard, LifeBuoy, LogOut, Settings } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BillingSeal, CreditStack } from "@/components/BillingGlyphs"

type AccountMenuUser = {
  id?: string | null
  email?: string | null
  user_metadata?: {
    avatar_url?: string | null
    full_name?: string | null
    name?: string | null
  }
} | null

type AccountMenuProps = {
  user?: AccountMenuUser
  planLabel: string
  credits: number | null
  billingLoading?: boolean
}

function displayName(user: AccountMenuUser | undefined) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Account"
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "A"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

export function AccountMenu({ user, planLabel, credits, billingLoading }: AccountMenuProps) {
  const router = useRouter()
  const name = displayName(user)
  const email = user?.email || ""
  const avatarUrl = user?.user_metadata?.avatar_url || undefined

  const handleSignOut = async () => {
    const { signOut } = await import("@/lib/auth-helpers")
    try {
      await signOut()
    } finally {
      router.replace("/")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="ax-interactive inline-flex size-9 items-center justify-center rounded-full border border-white/16 bg-white/[0.08] hover:bg-white/[0.14] data-[state=open]:ring-2 data-[state=open]:ring-white/30"
        >
          <Avatar className="size-7">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-[var(--brand-green)] text-[11px] font-semibold text-[var(--brand-green-fg)]">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-lg border-[var(--workspace-border)] bg-white p-1.5 text-[var(--workspace-ink)] shadow-[0_16px_44px_rgba(15,23,42,0.14)]"
      >
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="size-8">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-[var(--brand-green)] text-[11px] font-semibold text-[var(--brand-green-fg)]">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">{name}</p>
            <p className="truncate text-[11px] text-[var(--workspace-muted)]" title={email}>{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 px-1.5 pb-2">
          <span className="inline-flex h-7 min-w-0 items-center justify-center gap-1 rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-2 text-[11px] font-semibold">
            <BillingSeal className="size-3.5 text-black" />
            <span className="truncate">{billingLoading ? "Plan" : planLabel}</span>
          </span>
          <span className="inline-flex h-7 min-w-0 items-center justify-center gap-1 rounded-full border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-2 text-[11px] font-semibold tabular-nums">
            <CreditStack className="size-3.5 text-black" />
            {typeof credits === "number" ? credits.toLocaleString() : billingLoading ? "..." : "-"}
          </span>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="h-9 gap-2 rounded-md px-2 text-[13px]">
          <Link href="/dashboard/settings"><Settings className="size-4 text-black" />Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="h-9 gap-2 rounded-md px-2 text-[13px]">
          <Link href="/dashboard/settings?section=billing"><CreditCard className="size-4 text-black" />Billing</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="h-9 gap-2 rounded-md px-2 text-[13px]">
          <Link href="/dashboard/guide"><BookOpen className="size-4 text-black" />Workspace guide</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="h-9 gap-2 rounded-md px-2 text-[13px]">
          <Link href="/contact"><LifeBuoy className="size-4 text-black" />Support</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="h-9 gap-2 rounded-md px-2 text-[13px]"
          onSelect={(event) => {
            event.preventDefault()
            void handleSignOut()
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
