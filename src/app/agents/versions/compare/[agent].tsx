
'use client'

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export default function PromptCompare() {
  const { agent } = useParams() as { agent: string }
  const [versions, setVersions] = useState<any[]>([])
  const [left, setLeft] = useState("")
  const [right, setRight] = useState("")

  useEffect(() => {
    const fetchVersions = async () => {
      const { data } = await supabase
        .from("agent_prompt_versions")
        .select("*")
        .eq("agent_name", agent)
        .order("version", { ascending: false })
      setVersions(data || [])
    }
    fetchVersions()
  }, [agent])

  const leftVersion = versions.find((v) => v.id === left)
  const rightVersion = versions.find((v) => v.id === right)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🧠 Compare Prompts for {agent}</h1>
      <div className="flex gap-4 mb-4">
        <select onChange={e => setLeft(e.target.value)} className="border p-2 rounded w-full" value={left}>
          <option value="">Select Left Version</option>
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              v{v.version}
            </option>
          ))}
        </select>
        <select onChange={e => setRight(e.target.value)} className="border p-2 rounded w-full" value={right}>
          <option value="">Select Right Version</option>
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              v{v.version}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-semibold mb-2">Left Prompt</h2>
          <pre className="bg-muted p-2 rounded text-xs">{leftVersion?.prompt || "—"}</pre>
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-2">Right Prompt</h2>
          <pre className="bg-muted p-2 rounded text-xs">{rightVersion?.prompt || "—"}</pre>
        </div>
      </div>
    </div>
  )
}
