"use client"

import { useCallback, useEffect, useState } from "react"
import { workspaceApi, type WorkspaceRecord } from "@/lib/api-client"

export type Workspace = WorkspaceRecord

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
  const userId = user?.id || null
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [error, setError] = useState<string | null>(null)

  const persistActiveWorkspace = useCallback(async (workspace: Workspace) => {
    if (!userId) return
    const selected = await workspaceApi.select(workspace.id)
    setActiveWorkspace(selected)
  }, [userId])

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
      const response = await workspaceApi.list()
      let records = response.workspaces
      if (!records.length) {
        records = [await workspaceApi.create(initialWorkspaceName(user))]
      }

      setWorkspaces(records)
      const selected = records.find((workspace) => workspace.id === response.active_workspace_id) || records[0]
      setActiveWorkspace(selected)
    } catch {
      setError("Workspaces are unavailable right now.")
    } finally {
      setIsLoading(false)
    }
  }, [user, userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createWorkspace = useCallback(async (name: string) => {
    if (!userId) return null

    const cleanName = name.trim()
    try {
      const workspace = await workspaceApi.create(cleanName)
      setWorkspaces((current) => [...current, workspace])
      setActiveWorkspace(workspace)
      setError(null)
      return workspace
    } catch {
      setError("Could not create workspace.")
      return null
    }
  }, [userId])

  return {
    workspaces,
    activeWorkspace,
    isLoading,
    error,
    createWorkspace,
    selectWorkspace: persistActiveWorkspace,
  }
}
