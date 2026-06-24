'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'
import { StatusTimeline } from '@/components/StatusTimeline'

const ID_TYPES = [
  { key: 'PASSPORT', label: 'type.passport', icon: '📘' },
  { key: 'NATIONAL_ID', label: 'type.national_id', icon: '🪪' },
  { key: 'DRIVERS_LICENSE', label: 'type.drivers_license', icon: '🚗' },
]

const KYC_STEPS = [
  { key: 'SUBMITTED', label: '已提交' },
  { key: 'UNDER_REVIEW', label: '审核中' },
  { key: 'APPROVED', label: '已通过' },
]

export default function KycPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [idType, setIdType] = useState('')
  const [idFront, setIdFront] = useState<string | null>(null)
  const [idBack, setIdBack] = useState<string | null>(null)
  const [selfie, setSelfie] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [kycStatus, setKycStatus] = useState<string>('PENDING')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push(`/${locale}/login`); return }
    if (isAuthenticated) fetchKycStatus()
  }, [isAuthenticated, isLoading])

  const fetchKycStatus = async () => {
    try {
      const res = await fetch('/api/kyc')
      const data = await res.json()
      setKycStatus(data.kycStatus || 'PENDING')
      if (data.submission) setStep(-1)
    } catch {} finally { setLoading(false) }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string | null) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('文件大小不能超过5MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setter(ev.target?.result as string)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleSubmit = async () => {
    if (!idType || !idFront || !selfie) { setError('请完成所有必填项'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idType, idFrontImage: idFront, idBackImage: idBack, selfieImage: selfie }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setKycStatus('SUBMITTED')
      setStep(-1)
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>
  if (!isAuthenticated) return null

  if (step === -1) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          {kycStatus === 'APPROVED' ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('approved.title')}</h1>
              <p className="text-gray-500 mb-6">{t('approved.hint')}</p>
              <button onClick={() => router.push(`/${locale}/dashboard`)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                {t('btn.back')}
              </button>
            </>
          ) : kycStatus === 'REJECTED' ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('rejected.title')}</h1>
              <p className="text-gray-500 mb-6">{t('rejected.hint')}</p>
              <button onClick={() => { setKycStatus('PENDING'); setStep(0); setIdType(''); setIdFront(null); setIdBack(null); setSelfie(null) }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                {t('btn.resubmit')}
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">{kycStatus === 'SUBMITTED' ? t('submitted.title') : t('pending.title')}</h1>
              <p className="text-gray-500 mb-6">{t('submitted.hint')}</p>
              <div className="max-w-md mx-auto mb-6">
                <StatusTimeline steps={KYC_STEPS} currentStatus={kycStatus} />
              </div>
              <button onClick={() => router.push(`/${locale}/dashboard`)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                {t('btn.back')}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-gray-500 mb-8">{t('subtitle')}</p>

      <div className="flex items-center justify-between mb-8">
        {[t('step.select'), t('step.front'), t('step.selfie'), t('step.review')].map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
            <span className={`ml-2 text-sm hidden md:inline ${i === step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{label}</span>
            {i < 3 && <div className={`w-8 md:w-16 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      {step === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">{t('step.select')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {ID_TYPES.map((type) => (
              <button key={type.key} onClick={() => { setIdType(type.key); setStep(1) }}
                className={`p-6 rounded-xl border-2 text-center hover:border-blue-600 transition ${idType === type.key ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="font-medium text-sm">{t(type.label)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">{t('upload.front')}</h2>
          <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition flex flex-col items-center justify-center">
            {idFront ? <img src={idFront} className="max-h-full object-contain rounded-lg" alt="ID Front" /> : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-sm text-gray-500">{t('upload.hint')}</span>
                <span className="text-xs text-gray-400">{t('upload.supported')}</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setIdFront)} />
          </label>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50">{t('btn.back')}</button>
            <button onClick={() => setStep(2)} disabled={!idFront} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{t('btn.next')}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">{t('upload.selfie')}</h2>
          <div className="text-center">
            <label className="block w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-400 transition flex flex-col items-center justify-center overflow-hidden">
              {selfie ? <img src={selfie} className="w-full h-full object-cover rounded-full" alt="Selfie" /> : (
                <>
                  <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="text-sm text-gray-500">{t('selfie.hint')}</span>
                </>
              )}
              <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => handleFileUpload(e, setSelfie)} />
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50">{t('btn.back')}</button>
            <button onClick={() => setStep(3)} disabled={!selfie} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{t('btn.next')}</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">{t('review.title')}</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div><p className="text-xs text-gray-500 mb-1">{t('review.front')}</p><img src={idFront!} className="w-full h-32 object-cover rounded-lg" alt="ID" /></div>
            <div><p className="text-xs text-gray-500 mb-1">{t('review.selfie')}</p><img src={selfie!} className="w-full h-32 object-cover rounded-lg" alt="Selfie" /></div>
            <div><p className="text-xs text-gray-500 mb-1">类型</p><p className="text-sm font-medium mt-2">{t(`type.${idType.toLowerCase()}`)}</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-50">{t('btn.back')}</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? '...' : t('btn.submit')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
