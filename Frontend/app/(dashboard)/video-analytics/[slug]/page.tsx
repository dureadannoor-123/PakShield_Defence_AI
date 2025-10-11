"use client"

import { notFound } from "next/navigation"
import { getModule } from "@/lib/modules"
import type { DomainKey } from "@/lib/modules"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts"
import { useAppConfig, resolveEndpoint } from "@/lib/config"
import { ActivityLog } from "@/components/widgets/activity-log"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { use, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

const domain: DomainKey = "video-analytics"

type FaceRecognitionRun = {
  id: string
  timestamp: Date
  type: "live" | "upload"
  filename?: string
  mediaType: "image" | "video"
  payload: any
  inputUrl?: string
  outputUrl?: string
}

type AnomalyDetectionRun = {
  id: string
  timestamp: Date
  type: "live" | "upload"
  filename?: string
  mediaType: "image" | "video"
  payload: any
  inputUrl?: string
  outputUrl?: string
}

type FaceUploadResultsProps = {
  uploadUrl: string | null
  uploadType: "image" | "video" | null
  processedMediaUrl: string | null
  faceResult: any | null
}

function FaceUploadResults({ uploadUrl, uploadType, processedMediaUrl, faceResult }: FaceUploadResultsProps) {
  if (!uploadUrl && !processedMediaUrl) {
    return (
      <div className="text-center p-8 rounded-md border border-dashed">
        <div className="text-sm text-muted-foreground">
          Select an image or video file to start face recognition analysis
        </div>
        <div className="text-xs text-muted-foreground mt-1">Supported formats: JPG, PNG, MP4, MOV, AVI</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {uploadUrl && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Original Upload:</div>
          <div className="rounded-md border overflow-hidden">
            {uploadType === "video" ? (
              <video src={uploadUrl} controls className="w-full h-64 object-contain bg-black/5" />
            ) : (
              <img src={uploadUrl} alt="Original upload" className="w-full h-64 object-contain bg-black/5" />
            )}
          </div>
        </div>
      )}

      {processedMediaUrl && (
        <div className="space-y-3">
          {faceResult?.summary && (
            <div
              className={`p-3 rounded-lg text-center font-bold text-sm ${
                (faceResult.summary.authorized_count || 0) > 0 &&
                faceResult.summary.authorized_count === faceResult.summary.faces_detected
                  ? "bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/40 dark:text-green-200"
                  : "bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/40 dark:text-red-200"
              }`}
            >
              {(faceResult.summary.authorized_count || 0) > 0 &&
              faceResult.summary.authorized_count === faceResult.summary.faces_detected
                ? "🟢 ALL PERSONS AUTHORIZED - ACCESS GRANTED"
                : "🔴 UNAUTHORIZED PERSON DETECTED - ACCESS DENIED"}
            </div>
          )}

          <div className="text-sm font-medium text-foreground">
            Face Recognition Result:
            {faceResult?.summary && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({faceResult.summary.faces_detected || 0} faces detected)
              </span>
            )}
          </div>

          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              {faceResult?.media_type === "video" ? (
                <video
                  src={processedMediaUrl}
                  controls
                  className="rounded-md border-2 border-gray-300 object-cover shadow-sm"
                  style={{ width: "100px", height: "130px" }}
                />
              ) : (
                <img
                  src={processedMediaUrl}
                  alt="Face recognition result with bounding boxes"
                  className="rounded-md border-2 border-gray-300 object-cover shadow-sm"
                  style={{ width: "100px", height: "130px" }}
                />
              )}
              <div className="mt-1 text-xs text-center text-muted-foreground">Processed Result</div>
            </div>

            <div className="flex-1 min-w-0">
              {faceResult?.summary && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                    <div className="p-3 rounded-md border bg-primary/5">
                      <div className="font-medium text-primary">Total Faces</div>
                      <div className="text-lg font-semibold">{faceResult.summary.faces_detected || 0}</div>
                    </div>
                    <div className="p-3 rounded-md border bg-green-500/10">
                      <div className="font-medium text-green-600">Authorized</div>
                      <div className="text-lg font-semibold text-green-600">{faceResult.summary.authorized_count || 0}</div>
                    </div>
                    <div className="p-3 rounded-md border bg-red-500/10">
                      <div className="font-medium text-red-600">Unauthorized</div>
                      <div className="text-lg font-semibold text-red-600">{(faceResult.summary.faces_detected || 0) - (faceResult.summary.authorized_count || 0)}</div>
                    </div>
                  </div>

                  {faceResult.summary.detections && faceResult.summary.detections.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">Authorization Status:</div>
                      <div className="space-y-2">
                        {faceResult.summary.detections.map((detection, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-md border flex items-center justify-between ${
                              detection.authorized
                                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {detection.label === "Unknown" ? "Unknown Person" : detection.label}
                              </div>
                              {detection.distance !== null && (
                                <div className="text-xs text-muted-foreground">
                                  Recognition Distance: {detection.distance.toFixed(2)}
                                </div>
                              )}
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                detection.authorized
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                              }`}
                            >
                              {detection.authorized ? "✓ AUTHORIZED" : "✗ DENIED"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-lg border-2 border-dashed space-y-3">
                    <div className="text-center">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                          (faceResult.summary.authorized_count || 0) > 0 &&
                          faceResult.summary.authorized_count === faceResult.summary.faces_detected
                            ? "bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-600"
                            : "bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-600"
                        }`}
                      >
                        {(faceResult.summary.authorized_count || 0) > 0 &&
                        faceResult.summary.authorized_count === faceResult.summary.faces_detected
                          ? "🟢 ACCESS GRANTED"
                          : "🔴 ACCESS DENIED"}
                      </div>
                    </div>

                    <div className="text-xs text-center text-muted-foreground">
                      {faceResult.summary.authorized_count || 0} of {faceResult.summary.faces_detected || 0} faces authorized
                    </div>

                    {faceResult.summary.detections && faceResult.summary.detections.length > 0 && (
                      <div className="space-y-1">
                        {faceResult.summary.detections.map((detection, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded text-xs text-center font-medium ${
                              detection.authorized
                                ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
                            }`}
                          >
                            {detection.authorized
                              ? `✓ ${detection.label} - Access Granted`
                              : "✗ Unknown Person - Access Denied"}
                            {detection.distance !== null && (
                              <span className="ml-2 opacity-70">(Distance: {detection.distance.toFixed(2)})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function mockMotion(n = 36) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    motion: Math.max(0, Math.round(40 + Math.sin(i / 3) * 15 + Math.random() * 10 - 5)),
  }))
}

export default function VideoModulePage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams =
    typeof (params as Promise<{ slug: string }>)?.then === "function"
      ? use(params as Promise<{ slug: string }>)
      : (params as { slug: string })
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const anomalyFileInputRef = useRef<HTMLInputElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null)

  // Face recognition specific states
  const [faceLoading, setFaceLoading] = useState(false)
  const [faceError, setFaceError] = useState<string | null>(null)
  const [faceResult, setFaceResult] = useState<any | null>(null)
  const [faceRuns, setFaceRuns] = useState<FaceRecognitionRun[]>([])
  const [processedMediaUrl, setProcessedMediaUrl] = useState<string | null>(null)

        <TabsContent value="upload">
          {isFaceRecognition ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload for Face Recognition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    onChange={handleFaceRecognitionUpload}
                  />
                  {faceLoading && (
                    <div className="flex items-center justify-center p-4 rounded-md border border-dashed">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <div className="text-xs text-muted-foreground">Processing file for face recognition...</div>
                      </div>
                    </div>
                  )}
                  {faceError && (
                    <div className="p-3 rounded-md border border-destructive/20 bg-destructive/10">
                      <div className="text-xs text-destructive font-medium">Error:</div>
                      <div className="text-xs text-destructive">{faceError}</div>
                    </div>
                  )}
                </div>
                <FaceUploadResults
                  uploadUrl={uploadUrl}
                  uploadType={uploadType}
                  processedMediaUrl={processedMediaUrl}
                  faceResult={faceResult}
                />
              </CardContent>
            </Card>
          ) : isAnomalyDetection ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload for Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <input
                    ref={anomalyFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    onChange={handleAnomalyUpload}
                  />
                  {anomalyLoading && (
                    <div className="flex items-center justify-center p-4 rounded-md border border-dashed">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <div className="text-xs text-muted-foreground">Processing file for anomaly detection...</div>
                      </div>
                    </div>
                  )}
                  {anomalyError && (
                    <div className="p-3 rounded-md border border-destructive/20 bg-destructive/10">
                      <div className="text-xs text-destructive font-medium">Error:</div>
                      <div className="text-xs text-destructive">{anomalyError}</div>
                    </div>
                  )}
                </div>
                {(anomalyUploadUrl || anomalyProcessedMediaUrl) ? (
                  <div className="space-y-4">
                    {anomalyUploadUrl && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-foreground">Original Upload:</div>
                        <div className="rounded-md border overflow-hidden">
                          {anomalyUploadType === "video" ? (
                            <video src={anomalyUploadUrl} controls className="w-full max-w-md object-contain bg-black/5" />
                          ) : (
                            <img src={anomalyUploadUrl} alt="Original upload" className="w-full max-w-md object-contain bg-black/5" />
                          )}
                        </div>
                      </div>
                    )}
                    {anomalyProcessedMediaUrl && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-foreground">Anomaly Detection Result:</div>
                        <div className="rounded-md border overflow-hidden">
                          {anomalyUploadType === "video" ? (
                            <video src={anomalyProcessedMediaUrl} controls className="w-full max-w-md object-contain bg-black/5" />
                          ) : (
                            <img src={anomalyProcessedMediaUrl} alt="Anomaly detection result" className="w-full max-w-md object-contain bg-black/5" />
                          )}
                        </div>
                        {anomalyResult && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2 rounded-sm border bg-primary/5 text-center">
                                <div className="font-medium text-primary">Anomalies</div>
                                <div className="text-sm font-semibold">{anomalyResult.anomalies_detected ?? 0}</div>
                              </div>
                              <div className="p-2 rounded-sm border bg-yellow-500/10 text-center">
                                <div className="font-medium text-yellow-600">Labels</div>
                                <div className="text-sm font-semibold text-yellow-600">{anomalyResult.anomaly_labels ? anomalyResult.anomaly_labels.join(", ") : "None"}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 rounded-md border border-dashed">
                    <div className="text-sm text-muted-foreground">Select an image or video file to analyze anomalies.</div>
                    <div className="text-xs text-muted-foreground mt-1">Supported formats: JPG, PNG, MP4, MOV, AVI</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Image/Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const url = URL.createObjectURL(f)
                    setUploadUrl((prev) => {
                      if (prev && prev !== url) URL.revokeObjectURL(prev)
                      return url
                    })
                    setUploadType(f.type.startsWith("video/") ? "video" : "image")
                  }}
                />
                {uploadUrl && (
                  <div className="mt-3">
                    {uploadType === "video" ? (
                      <video src={uploadUrl} controls className="w-full rounded-md border object-contain" />
                    ) : (
                      <img
                        src={uploadUrl || "/placeholder.svg"}
                        alt="Uploaded preview"
                        className="w-full rounded-md border object-cover"
                      />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Preview shown locally. Wire to FastAPI for inference.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        faces_detected: Math.floor(Math.random() * 5) + 1,
        known_faces: Math.floor(Math.random() * 3),
        unknown_faces: Math.floor(Math.random() * 2),
      }
      
      setFaceResult(mockResult)
      setFaceRuns((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date(),
          type: "live",
          mediaType: "video",
          payload: mockResult,
        },
        ...prev,
      ])
      setFaceLoading(false)
    }, 3000)
  }

  const latestFaceRun = faceRuns[0] ?? null
  const latestFacePayload = latestFaceRun?.payload ?? null

  const summarizedFaceRuns = useMemo(() => {
    return faceRuns.map((run) => {
      const summary = run.payload?.summary ?? {}
      const facesDetected = summary.faces_detected ?? run.payload?.faces_detected ?? 0
      const knownFaces = summary.known_faces ?? run.payload?.known_faces ?? 0
      const unknownFaces = summary.unknown_faces ?? run.payload?.unknown_faces ?? 0
      
      return {
        id: run.id,
        timestamp: run.timestamp,
        type: run.type,
        filename: run.filename,
        mediaType: run.mediaType,
        facesDetected,
        knownFaces,
        unknownFaces,
        message: run.payload?.message ?? null,
      }
    })
  }, [faceRuns])

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

      <Tabs defaultValue={isFaceRecognition ? "config" : "analysis"}>
        <TabsList className="mb-2">
          {isFaceRecognition && <TabsTrigger value="config">Configuration</TabsTrigger>}
          <TabsTrigger value="analysis">Live Analysis</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          {isFaceRecognition && <TabsTrigger value="results">Results</TabsTrigger>}
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {isFaceRecognition && (
          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Face Recognition Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-xs text-muted-foreground">Detection Threshold</span>
                    <input
                      className="rounded-md border bg-background px-3 py-2"
                      type="range"
                      min={0}
                      max={100}
                      defaultValue={75}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-muted-foreground">Recognition Confidence</span>
                    <input
                      className="rounded-md border bg-background px-3 py-2"
                      type="range"
                      min={0}
                      max={100}
                      defaultValue={80}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="btn-cyber hover-glow"
                    onClick={handleFaceLiveAnalysis}
                    disabled={faceLoading}
                  >
                    {faceLoading ? "Analyzing…" : "Live Analyze"}
                  </Button>
                  <Button
                    variant="outline"
                    className="btn-cyber bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={faceLoading}
                  >
                    {faceLoading ? "Processing…" : "Upload File"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFaceRecognitionUpload}
                    className="hidden"
                  />
                </div>
                {faceError && (
                  <div className="p-3 rounded-md border border-destructive/20 bg-destructive/10">
                    <div className="text-xs text-destructive font-medium">Error:</div>
                    <div className="text-xs text-destructive">{faceError}</div>
                  </div>
                )}
                {faceLoading && (
                  <div className="flex items-center justify-center p-4 rounded-md border border-dashed">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <div className="text-xs text-muted-foreground">Processing face recognition...</div>
                    </div>
                  </div>
                )}
                {(uploadUrl || processedMediaUrl) && (
                  <div className="space-y-4">
                    {uploadUrl && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-foreground">Original Upload:</div>
                        <div className="rounded-md border overflow-hidden">
                          {uploadType === "video" ? (
                            <video src={uploadUrl} controls className="w-full max-w-md object-contain bg-black/5" />
                          ) : (
                            <img src={uploadUrl} alt="Original upload" className="w-full max-w-md object-contain bg-black/5" />
                          )}
                        </div>
                      </div>
                    )}
                    {processedMediaUrl && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-foreground">
                          Face Recognition Result:
                          {faceResult?.summary && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({faceResult.summary.faces_detected || 0} faces detected)
                            </span>
                          )}
                        </div>
                        <div className="rounded-md border overflow-hidden">
                          {uploadType === "video" ? (
                            <video src={processedMediaUrl} controls className="w-full max-w-md object-contain bg-black/5" />
                          ) : (
                            <img src={processedMediaUrl} alt="Face recognition result" className="w-full max-w-md object-contain bg-black/5" />
                          )}
                        </div>
                        {faceResult?.summary && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="p-2 rounded-sm border bg-primary/5 text-center">
                                <div className="font-medium text-primary">Total</div>
                                <div className="text-sm font-semibold">{faceResult.summary.faces_detected || 0}</div>
                              </div>
                              <div className="p-2 rounded-sm border bg-green-500/10 text-center">
                                <div className="font-medium text-green-600">Authorized</div>
                                <div className="text-sm font-semibold text-green-600">{faceResult.summary.authorized_count || 0}</div>
                              </div>
                              <div className="p-2 rounded-sm border bg-red-500/10 text-center">
                                <div className="font-medium text-red-600">Denied</div>
                                <div className="text-sm font-semibold text-red-600">{(faceResult.summary.faces_detected || 0) - (faceResult.summary.authorized_count || 0)}</div>
                              </div>
                            </div>
                            
                            {/* Authorization Messages */}
                            {faceResult.summary.detections && faceResult.summary.detections.length > 0 && (
                              <div className="space-y-1">
                                {faceResult.summary.detections.map((detection, idx) => (
                                  <div key={idx} className={`p-2 rounded text-xs font-medium ${
                                    detection.authorized 
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                  }`}>
                                    {detection.authorized 
                                      ? `✓ Access GRANTED for ${detection.label}` 
                                      : `✗ Access DENIED - Unknown person detected`
                                    }
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {faceResult?.type === "live" && (
                  <div className="rounded-md border p-3 text-xs space-y-3">
                    <div className="font-medium text-foreground">Live Analysis Results</div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <div className="rounded-sm border p-2">
                        Faces: <span className="text-primary">{faceResult.faces_detected ?? "N/A"}</span>
                      </div>
                      <div className="rounded-sm border p-2">
                        Known: <span className="text-green-400">{faceResult.known_faces ?? "N/A"}</span>
                      </div>
                      <div className="rounded-sm border p-2">
                        Unknown: <span className="text-yellow-400">{faceResult.unknown_faces ?? "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="analysis">
          {isAnomalyDetection ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Anomaly Detection - Live Analyze</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="btn-cyber hover-glow" onClick={handleAnomalyLiveAnalysis} disabled={anomalyLoading}>
                  {anomalyLoading ? "Analyzing…" : "Live Analyze"}
                </Button>
                {anomalyError && (
                  <div className="p-3 rounded-md border border-destructive/20 bg-destructive/10">
                    <div className="text-xs text-destructive font-medium">Error:</div>
                    <div className="text-xs text-destructive">{anomalyError}</div>
                  </div>
                )}
                {anomalyLoading && (
                  <div className="flex items-center justify-center p-4 rounded-md border border-dashed">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <div className="text-xs text-muted-foreground">Processing anomaly detection...</div>
                    </div>
                  </div>
                )}
                {anomalyResult && (
                  <div className="space-y-3">
                    <div className="rounded-md border p-3">
                      <div className="font-medium text-foreground">Live Anomaly Detection Results</div>
                      <div className="mt-1 text-muted-foreground">{anomalyResult.message}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Anomalies Detected: {anomalyResult.anomalies_detected ?? "N/A"}
                        {anomalyResult.anomaly_labels && ` • Labels: ${anomalyResult.anomaly_labels.join(", ")}`}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Camera</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="relative overflow-hidden rounded-md border">
                    <video ref={videoRef} className="block h-72 w-full bg-black/60 object-contain" muted playsInline />
                    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
                  </div>
                  <div className="flex gap-2">
                    {!streaming ? (
                      <Button onClick={startCamera} className="btn-cyber hover-glow">
                        Start Camera
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={stopCamera} className="btn-cyber bg-transparent">
                        Stop
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Model Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="t" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="motion"
                        stroke="var(--color-chart-4)"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{isFaceRecognition ? "Upload for Face Recognition" : "Upload Image/Video"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  onChange={isFaceRecognition ? handleFaceRecognitionUpload : (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const url = URL.createObjectURL(f)
                    setUploadUrl((prev) => {
                      if (prev && prev !== url) URL.revokeObjectURL(prev)
                      return url
                    })
                    setUploadType(f.type.startsWith("video/") ? "video" : "image")
                  }}
                />
                
                {isFaceRecognition && faceLoading && (
                  <div className="flex items-center justify-center p-4 rounded-md border border-dashed">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <div className="text-xs text-muted-foreground">Processing file for face recognition...</div>
                    </div>
                  </div>
                )}
                
                {isFaceRecognition && faceError && (
                  <div className="p-3 rounded-md border border-destructive/20 bg-destructive/10">
                    <div className="text-xs text-destructive font-medium">Error:</div>
                    <div className="text-xs text-destructive">{faceError}</div>
                  </div>
                )}
              </div>

              {isFaceRecognition ? (
                // Face Recognition Mode - Show original and processed side by side
                <div className="space-y-4">
                  {uploadUrl && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-foreground">Original Upload:</div>
                      <div className="rounded-md border overflow-hidden">
                        {uploadType === "video" ? (
                          <video src={uploadUrl} controls className="w-full h-64 object-contain bg-black/5" />
                        ) : (
                          <img
                            src={uploadUrl}
                            alt="Original upload"
                            className="w-full h-64 object-contain bg-black/5"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {processedMediaUrl && (
                    <div className="space-y-3">
                      {/* Authorization Status Banner */}
                      {faceResult?.summary && (
                        <div className={`p-3 rounded-lg text-center font-bold text-sm ${
                          (faceResult.summary.authorized_count || 0) > 0 && 
                          (faceResult.summary.authorized_count === faceResult.summary.faces_detected)
                            ? "bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/40 dark:text-green-200"
                            : "bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/40 dark:text-red-200"
                        }`}>
                          {(faceResult.summary.authorized_count || 0) > 0 && 
                           (faceResult.summary.authorized_count === faceResult.summary.faces_detected)
                            ? "🟢 ALL PERSONS AUTHORIZED - ACCESS GRANTED"
                            : "🔴 UNAUTHORIZED PERSON DETECTED - ACCESS DENIED"
                          }
                        </div>
                      )}
                      
                      <div className="text-sm font-medium text-foreground">
                        Face Recognition Result:
                        {faceResult?.summary && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({faceResult.summary.faces_detected || 0} faces detected)
                          </span>
                        )}
                      </div>
                      <div className="flex gap-6 items-start">
                        {/* Left side - Passport size processed image */}
                        <div className="flex-shrink-0">
                          {faceResult?.media_type === "video" ? (
                            <video 
                              src={processedMediaUrl} 
                              controls 
                              className="rounded-md border-2 border-gray-300 object-cover shadow-sm"
                              style={{ width: '100px', height: '130px' }}
                            />
                          ) : (
                            <img
                              src={processedMediaUrl}
                              alt="Face recognition result with bounding boxes"
                              className="rounded-md border-2 border-gray-300 object-cover shadow-sm"
                              style={{ width: '100px', height: '130px' }}
                            />
                          )}
                          <div className="mt-1 text-xs text-center text-muted-foreground">
                            Processed Result
                          </div>
                        </div>
                        
                        {/* Right side - Results */}
                        <div className="flex-1 min-w-0">
                          {faceResult?.summary && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                                <div className="p-3 rounded-md border bg-primary/5">
                                  <div className="font-medium text-primary">Total Faces</div>
                                  <div className="text-lg font-semibold">{faceResult.summary.faces_detected || 0}</div>
                                </div>
                                <div className="p-3 rounded-md border bg-green-500/10">
                                  <div className="font-medium text-green-600">Authorized</div>
                                  <div className="text-lg font-semibold text-green-600">{faceResult.summary.authorized_count || 0}</div>
                                </div>
                                <div className="p-3 rounded-md border bg-red-500/10">
                                  <div className="font-medium text-red-600">Unauthorized</div>
                                  <div className="text-lg font-semibold text-red-600">{(faceResult.summary.faces_detected || 0) - (faceResult.summary.authorized_count || 0)}</div>
                                </div>
                              </div>

                              {faceResult.summary.detections && faceResult.summary.detections.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-foreground">Authorization Status:</div>
                                  <div className="space-y-2">
                                    {faceResult.summary.detections.map((detection, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-3 rounded-md border flex items-center justify-between ${
                                          detection.authorized
                                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                        }`}
                                      >
                                        <div className="space-y-1">
                                          <div className="font-medium text-sm">
                                            {detection.label === "Unknown" ? "Unknown Person" : detection.label}
                                          </div>
                                          {detection.distance !== null && (
                                            <div className="text-xs text-muted-foreground">
                                              Recognition Distance: {detection.distance.toFixed(2)}
                                            </div>
                                          )}
                                        </div>
                                        <div
                                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            detection.authorized
                                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                          }`}
                                        >
                                          {detection.authorized ? "✓ AUTHORIZED" : "✗ DENIED"}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="p-4 rounded-lg border-2 border-dashed space-y-3">
                                <div className="text-center">
                                  <div
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                                      (faceResult.summary.authorized_count || 0) > 0 &&
                                      faceResult.summary.authorized_count === faceResult.summary.faces_detected
                                        ? "bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-600"
                                        : "bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-600"
                                    }`}
                                  >
                                    {(faceResult.summary.authorized_count || 0) > 0 &&
                                    faceResult.summary.authorized_count === faceResult.summary.faces_detected
                                      ? "🟢 ACCESS GRANTED"
                                      : "🔴 ACCESS DENIED"}
                                  </div>
                                </div>

                                <div className="text-xs text-center text-muted-foreground">
                                  {faceResult.summary.authorized_count || 0} of {faceResult.summary.faces_detected || 0} faces authorized
                                </div>

                                {faceResult.summary.detections && faceResult.summary.detections.length > 0 && (
                                  <div className="space-y-1">
                                    {faceResult.summary.detections.map((detection, idx) => (
                                      <div
                                        key={idx}
                                        className={`p-2 rounded text-xs text-center font-medium ${
                                          detection.authorized
                                            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
                                            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
                                        }`}
                                      >
                                        {detection.authorized
                                          ? `✓ ${detection.label} - Access Granted`
                                          : "✗ Unknown Person - Access Denied"}
                                        {detection.distance !== null && (
                                          <span className="ml-2 opacity-70">(Distance: {detection.distance.toFixed(2)})</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!uploadUrl && !processedMediaUrl && (
                    <div className="text-center p-8 rounded-md border border-dashed">
                      <div className="text-sm text-muted-foreground">
                        Select an image or video file to start face recognition analysis
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Supported formats: JPG, PNG, MP4, MOV, AVI
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Regular Upload Mode (non-face recognition)
                uploadUrl && (
                  <div className="mt-3">
                    {uploadType === "video" ? (
                      <video src={uploadUrl} controls className="w-full rounded-md border object-contain" />
                    ) : (
                      <img
                        src={uploadUrl || "/placeholder.svg"}
                        alt="Uploaded preview"
                        className="w-full rounded-md border object-cover"
                      />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Preview shown locally. Wire to FastAPI for inference.
                    </p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isFaceRecognition && (
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Face Recognition Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {latestFaceRun ? (
                  <div className="space-y-3 text-xs">
                    <div className="rounded-md border p-3">
                      <div className="font-medium text-foreground">
                        Last run: {latestFaceRun.timestamp.toLocaleString()}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Type: {latestFaceRun.type === "live" ? "Live Analysis" : "File Upload"}
                        {latestFaceRun.filename && ` • File: ${latestFaceRun.filename}`}
                        {latestFaceRun.mediaType && ` • Media: ${latestFaceRun.mediaType}`}
                      </div>
                      {latestFacePayload?.message && (
                        <div className="mt-1 text-muted-foreground">{latestFacePayload.message}</div>
                      )}
                    </div>
                    {latestFaceRun.type === "live" ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-md border p-3">
                          <div className="font-medium text-foreground">Faces Detected</div>
                          <div className="text-lg text-primary">{latestFacePayload?.faces_detected ?? "N/A"}</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="font-medium text-foreground">Known Faces</div>
                          <div className="text-lg text-green-400">{latestFacePayload?.known_faces ?? "N/A"}</div>
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="font-medium text-foreground">Unknown Faces</div>
                          <div className="text-lg text-yellow-400">{latestFacePayload?.unknown_faces ?? "N/A"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-md border p-3">
                            <div className="font-medium text-foreground">Status</div>
                            <div className="text-lg text-primary">{latestFacePayload?.status ?? "N/A"}</div>
                          </div>
                          <div className="rounded-md border p-3">
                            <div className="font-medium text-foreground">Media Type</div>
                            <div className="text-lg text-primary">{latestFaceRun.mediaType ?? "N/A"}</div>
                          </div>
                        </div>
                        {latestFaceRun.outputUrl && (
                          <div className="space-y-2">
                            <div className="font-medium text-foreground">Processed Result:</div>
                            <div className="flex gap-6 items-start">
                              {/* Left side - Passport size image */}
                              <div className="flex-shrink-0">
                                {latestFaceRun.mediaType === "video" ? (
                                  <video 
                                    src={latestFaceRun.outputUrl} 
                                    controls 
                                    className="rounded-md border-2 border-gray-300 object-cover shadow-sm"
                                    style={{ width: '100px', height: '130px' }}
                                  />
                                ) : (
                                  <img 
                                    src={latestFaceRun.outputUrl} 
                                    alt="Face recognition result" 
                                    className="rounded-md border-2 border-gray-300 object-cover shadow-sm"
                                    style={{ width: '100px', height: '130px' }}
                                  />
                                )}
                                <div className="mt-1 text-xs text-center text-muted-foreground">
                                  Processed Result
                                </div>
                              </div>
                              
                              {/* Right side - Results */}
                              <div className="flex-1 space-y-3 min-w-0">
                                {/* Authorization Status Banner */}
                                {latestFacePayload?.summary && (
                                  <div className={`p-3 rounded-lg text-center font-bold text-sm ${
                                    (latestFacePayload.summary.authorized_count || 0) > 0 && 
                                    (latestFacePayload.summary.authorized_count === latestFacePayload.summary.faces_detected)
                                      ? "bg-green-100 text-green-800 border-2 border-green-300 dark:bg-green-900/40 dark:text-green-200"
                                      : "bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/40 dark:text-red-200"
                                  }`}>
                                    {(latestFacePayload.summary.authorized_count || 0) > 0 && 
                                     (latestFacePayload.summary.authorized_count === latestFacePayload.summary.faces_detected)
                                      ? "🟢 ACCESS GRANTED"
                                      : "🔴 ACCESS DENIED"
                                    }
                                  </div>
                                )}
                                
                                {/* Statistics */}
                                {latestFacePayload?.summary && (
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="p-2 rounded border bg-primary/5 text-center">
                                      <div className="font-medium text-primary">Total</div>
                                      <div className="text-sm font-semibold">{latestFacePayload.summary.faces_detected || 0}</div>
                                    </div>
                                    <div className="p-2 rounded border bg-green-500/10 text-center">
                                      <div className="font-medium text-green-600">Authorized</div>
                                      <div className="text-sm font-semibold text-green-600">{latestFacePayload.summary.authorized_count || 0}</div>
                                    </div>
                                    <div className="p-2 rounded border bg-red-500/10 text-center">
                                      <div className="font-medium text-red-600">Denied</div>
                                      <div className="text-sm font-semibold text-red-600">{(latestFacePayload.summary.faces_detected || 0) - (latestFacePayload.summary.authorized_count || 0)}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Individual Detection Results */}
                                {latestFacePayload?.summary?.detections && latestFacePayload.summary.detections.length > 0 && (
                                  <div className="space-y-1">
                                    {latestFacePayload.summary.detections.map((detection, idx) => (
                                      <div key={idx} className={`p-2 rounded text-xs font-medium ${
                                        detection.authorized 
                                          ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700" 
                                          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
                                      }`}>
                                        {detection.authorized 
                                          ? `✓ ${detection.label} - Access Granted` 
                                          : `✗ Unknown Person - Access Denied`
                                        }
                                        {detection.distance !== null && (
                                          <span className="ml-2 opacity-70">
                                            (Distance: {detection.distance.toFixed(2)})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {latestFacePayload?.summary && (
                          <div className="rounded-md border bg-muted/40 p-3 text-[11px]">
                            <div className="font-medium mb-2">Analysis Summary:</div>
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(latestFacePayload.summary, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Run live analysis or upload files to populate recent results.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="metrics">
          <ActivityLog sources={sourceLabel ? [sourceLabel] : []} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {isFaceRecognition ? (
                summarizedFaceRuns.length > 0 ? (
                  summarizedFaceRuns.map((run) => (
                    <div key={run.id} className="rounded-md border p-3">
                      <div className="font-medium text-foreground">
                        {run.timestamp.toLocaleString()}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Type: {run.type === "live" ? "Live Analysis" : "File Upload"}
                        {run.filename && ` • File: ${run.filename}`}
                        {run.mediaType && ` • Media: ${run.mediaType}`}
                      </div>
                      <div className="mt-2 text-muted-foreground">
                        {run.type === "live" ? (
                          `${run.facesDetected} faces detected • ${run.knownFaces} known • ${run.unknownFaces} unknown`
                        ) : (
                          `Analysis completed • ${run.message ?? "Face recognition processed"}`
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No history yet. Run face recognition analysis to build a timeline.</p>
                )
              ) : (
                <p className="text-muted-foreground">Placeholder historical results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
