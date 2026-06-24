'use client'

interface StatusStep {
  label: string
  key: string
}

interface StatusTimelineProps {
  steps: StatusStep[]
  currentStatus: string
}

export function StatusTimeline({ steps, currentStatus }: StatusTimelineProps) {
  const currentIdx = steps.findIndex((s) => s.key === currentStatus)
  const isRejected = currentStatus === 'REJECTED'

  return (
    <div className="flex items-center justify-between relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
      <div className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500" style={{ width: `${Math.max(0, (currentIdx / (steps.length - 1)) * 100)}%` }} />
      {steps.map((step, i) => {
        const isComplete = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={step.key} className="relative flex flex-col items-center z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
              isRejected && isCurrent ? 'bg-red-500 border-red-500 text-white' :
              isComplete ? 'bg-blue-600 border-blue-600 text-white' :
              isCurrent ? 'bg-white border-blue-600 text-blue-600' :
              'bg-white border-gray-300 text-gray-400'
            }`}>
              {isComplete ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-2 whitespace-nowrap ${
              isCurrent ? 'text-blue-600 font-medium' : isComplete ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
