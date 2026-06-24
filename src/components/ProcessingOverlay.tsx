'use client'

import { useState, useEffect } from 'react'

interface ProcessingStep {
  label: string
  duration: number
}

interface ProcessingOverlayProps {
  steps: ProcessingStep[]
  onComplete?: () => void
  onFail?: () => void
}

export function ProcessingOverlay({ steps, onComplete, onFail }: ProcessingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

  useEffect(() => {
    if (currentStep >= steps.length) {
      setIsDone(true)
      onComplete?.()
      return
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), steps[currentStep].duration)
    return () => clearTimeout(timer)
  }, [currentStep, steps, onComplete])

  if (isFailed) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-xl font-semibold mb-2">处理失败</h3>
          <p className="text-gray-500 mb-6">请稍后重试或联系客服</p>
          <button onClick={onFail} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            返回
          </button>
        </div>
      </div>
    )
  }

  if (isDone) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                i < currentStep ? 'bg-green-500 text-white' : i === currentStep ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-200 text-gray-400'
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SuccessOverlay({ referenceNo, onAction, actionLabel }: { referenceNo: string; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">处理完成</h3>
        <p className="text-gray-500 text-sm mb-1">交易参考号</p>
        <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg mb-6">{referenceNo}</p>
        {onAction && (
          <button onClick={onAction} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 w-full">
            {actionLabel || '返回'}
          </button>
        )}
      </div>
    </div>
  )
}
