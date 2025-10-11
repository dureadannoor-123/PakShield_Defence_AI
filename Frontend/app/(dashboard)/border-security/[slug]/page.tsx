"use client"

import { notFound } from "next/navigation"
import { getModule } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts"
import { MapGrid } from "@/components/widgets/map-grid"
import { useAppConfig, resolveEndpoint } from "@/lib/config"
import { ActivityLog } from "@/components/widgets/activity-log"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

const domain: DomainKey = "border-security"

function mockBorder(n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    risk: Math.max(0, Math.round(15 + Math.sin(i / 4) * 8 + Math.random() * 5 - 2)),
  }))
}

export default function BorderModulePage({ params }: { params: { slug: string } }) {
  const { config } = useAppConfig()
  const mod = getModule(domain, params.slug)
  if (!mod) return notFound()
  const endpoint = resolveEndpoint(config, mod.endpointKey)
  const data = mockBorder()

  const sourceLabel =
    params.slug === "vehicle-anpr" ? "Border ANPR" : params.slug === "drone-detection" ? "Drone Detection" : undefined

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-lg border p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,_color-mix(in_oklch,var(--color-primary)_8%,transparent)_0%,_transparent_70%)]" />
        <div className="relative">
          <h2 className="text-2xl font-semibold">{mod.title}</h2>
          <p className="text-sm text-muted-foreground">{mod.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">Endpoint: {endpoint}</p>
        </div>
      </section>

      <Tabs defaultValue="analytics">
        <TabsList className="mb-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="live">Live Test</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Border Risk Index</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="risk"
                      stroke="var(--color-chart-5)"
                      fill="var(--color-chart-5)"
                      fillOpacity={0.25}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <MapGrid />
          </section>
        </TabsContent>

        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Live Testing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button className="btn-cyber hover-glow">Start Live</Button>
              <Button variant="outline" className="btn-cyber bg-transparent">
                Stop
              </Button>
              <p className="text-xs text-muted-foreground">Simulated; wire to FastAPI stream.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Image/Video</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept="image/*,video/*"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">Results will render with simulated overlays.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <ActivityLog sources={sourceLabel ? [sourceLabel] : []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
