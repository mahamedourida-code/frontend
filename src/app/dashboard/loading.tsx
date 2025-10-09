export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-primary/30 border-t-transparent rounded-full animate-spin animation-delay-150" />
        </div>
        <p className="text-muted-foreground text-sm">Loading dashboard...</p>
      </div>
    </div>
  )
}
