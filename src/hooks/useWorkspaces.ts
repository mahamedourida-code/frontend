"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export type Workspace = {
  id: string
  owner_user_id: string
  name: string
  created_at: string
  updated_at: string
}

type WorkspaceUser = {
  id?: string | null
  email?: string | null
  user_metadata?: {
    full_name?: string | null
    name?: string | null
  }
} | null

function initialWorkspaceName(user: WorkspaceUser) {
  const source = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "My"
  const firstName = source.trim().split(/\s+/)[0]
  return `${firstName}'s workspace`
}

export function useWorkspaces(user: WorkspaceUser) {
  const supabase = useMemo(() => createClient(), [])
  const userId = user?.id || null
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [error, setError] = useState<string | null>(null)

  const persistActiveWorkspace = useCallback(async (workspace: Workspace) => {
    if (!userId) return

    const { error: preferenceError } = await supabase
      .from("workspace_preferences")
      .upsert({
        user_id: userId,
        active_workspace_id: workspace.id,
        updated_at: new Date().toISOString(),
      })

    if (preferenceError) throw preferenceError
    setActiveWorkspace(workspace)
  }, [supabase, userId])

  const refresh = useCallback(async () => {
    if (!userId) {
      setWorkspaces([])
      setActiveWorkspace(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data: workspaceRows, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: true })

      if (workspaceError) throw workspaceError

      let records = (workspaceRows || []) as Workspace[]
      if (!records.length) {
        const { data: created, error: createError } = await supabase
          .from("workspaces")
          .insert({
            owner_user_id: userId,
            name: initialWorkspaceName(user),
            updated_at: new Date().toISOString(),
          })
          .select("*")
          .single()

        if (createError?.code === "23505") {
          const { data: existing, error: existingError } = await supabase
            .from("workspaces")
            .select("*")
            .order("created_at", { ascending: true })

          if (existingError) throw existingError
          records = (existing || []) as Workspace[]
        } else {
          if (createError) throw createError
          records = [created as Workspace]
        }
      }

      setWorkspaces(records)

      const { data: preference } = await supabase
        .from("workspace_preferences")
        .select("active_workspace_id")
        .eq("user_id", userId)
        .maybeSingle()

      const selected = records.find((workspace) => workspace.id === preference?.active_workspace_id) || records[0]
      await persistActiveWorkspace(selected)
    } catch {
      setError("Workspaces are unavailable right now.")
    } finally {
      setIsLoading(false)
    }
  }, [persistActiveWorkspace, supabase, user, userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createWorkspace = useCallback(async (name: string) => {
    if (!userId) return null

    const cleanName = name.trim()
    const { data, error: createError } = await supabase
      .from("workspaces")
      .insert({
        owner_user_id: userId,
        name: cleanName,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single()

    if (createError) {
      setError(createError.code === "23505" ? "A workspace with this name already exists." : "Could not create workspace.")
      return null
    }

    const workspace = data as Workspace
    setWorkspaces((current) => [...current, workspace])
    await persistActiveWorkspace(workspace)
    setError(null)
    return workspace
  }, [persistActiveWorkspace, supabase, userId])

  return {
    workspaces,
    activeWorkspace,
    isLoading,
    error,
    createWorkspace,
    selectWorkspace: persistActiveWorkspace,
  }
}
