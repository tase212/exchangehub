'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'
import { ProcessingOverlay, SuccessOverlay } from '@/components/ProcessingOverlay'

interface Wallet { id: string; currency: string; balance: number; frozenBalance: number }
interface BankAccount { id: string; accountLast4: string; bankName: string; accountHolder: string; currency: string; isDefault: boolean }

export default function WithdrawPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [currency, setCurrency] = useState('USD')
  const [amount, setAmount] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [refNo, setRefNo] = useState('')
  const [fee, setFee] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [kycStatus, setKycStatus] = useState('')

  const CURRENCY_FLAGS: Record<string, string> = { CNY: '🇨🇳', HKD: '🇭🇰', USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧' }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push(`/${locale}/login`); return }
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, isLoading])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [walletRes, accRes, kycRes] = await Promise.all([fetch('/api/wallets'), fetch('/api/accounts'), fetch('/api/kyc')])
      const walletData = await walletRes.json()
      const accData = await accRes.json()
      const kycData = await kycRes.json()
      setWallets(walletData.wallets || [])
      setAccounts(accData.accounts || [])
      setKycStatus(kycData.kycStatus || 'PENDING')
      if (accData.accounts?.length > 0) setSelectedAccount(accData.accounts[0].id)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0
    setFee(Math.max(numAmount * 0.005, numAmount > 0 ? 1 : 0))
  }, [amount])

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return
    setProcessing(true); setError('')
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, currency, bankAccountId: selectedAccount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRefNo(data.transaction.referenceNo)
      setTimeout(() => { setProcessing(false); setSuccess(true) }, 8000)
    } catch (err: any) { setProcessing(false); setError(err.message) }
  }

  if (isLoading || loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>
  if (!isAuthenticated) return null

  if (kycStatus !== 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">{t('error.kyc_required')}</h2>
          <button onClick={() => router.push(`/${locale}/kyc`)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 mt-4">{t('nav.kyc')}</button>
        </div>
      </div>
    )
  }

  if (success) {
    return <SuccessOverlay referenceNo={refNo} onAction={() => router.push(`/${locale}/dashboard`)} actionLabel={t('btn.backToDashboard')} />
  }

  if (processing) {
    return <ProcessingOverlay steps={[
      { label: t('processing.steps.freezing'), duration: 2500 },
      { label: t('processing.steps.processing'), duration: 3000 },
      { label: t('processing.steps.transferring'), duration: 2500 },
    ]} />
  }

  const numAmount = parseFloat(amount) || 0
  const wallet = wallets.find((w) => w.currency === currency)
  const available = wallet ? wallet.balance - wallet.frozenBalance : 0
  const netAmount = numAmount - fee

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-gray-500 mb-8">{t('subtitle')}</p>

      <div className="flex items-center justify-between mb-8">
        {[t('step.amount'), t('step.method'), t('step.review')].map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
            <span className={`ml-2 text-sm hidden md:inline ${i === step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{label}</span>
            {i < 2 && <div className={`w-8 md:w-16 h-0.5 mx-2 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      {step === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">{t('amount.label')}</h2>
          <div className="mb-4">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-lg font-medium">
              {wallets.filter((w) => w.balance > w.frozenBalance).map((w) => <option key={w.currency} value={w.currency}>{CURRENCY_FLAGS[w.currency]} {w.currency}</option>)}
            </select>
          </div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('amount.placeholder')} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-2xl font-mono mb-3" />
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{t('amount.available')}</span>
            <span className="font-mono">{available.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</span>
          </div>
          {numAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 mt-4">
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('amount.fee')}</span><span className="font-mono">{fee.toFixed(2)} {currency}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">{t('amount.feeRate')}</span></div>
              <div className="flex justify-between font-semibold"><span>{t('amount.net')}</span><span className="font-mono text-green-600">{netAmount.toFixed(2)} {currency}</span></div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button onClick={() => setStep(1)} disabled={!numAmount || numAmount <= 0 || numAmount > available} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{t('btn.next')}</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">{t('method.title')}</h2>
          {accounts.length === 0 ? (
            <div className="text-center py-8"><p className="text-gray-500 mb-4">{t('method.empty')}</p>
              <button onClick={() => router.push(`/${locale}/payment-methods`)} className="text-blue-600 hover:underline">{t('method.add')}</button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => (
                <label key={acc.id} className={`block p-4 rounded-xl border-2 cursor-pointer transition ${selectedAccount === acc.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="account" value={acc.id} checked={selectedAccount === acc.id} onChange={() => setSelectedAccount(acc.id)} className="text-blue-600" />
                    <span className="text-lg">🏦</span>
                    <div><div className="font-medium">{acc.bankName} •••• {acc.accountLast4}</div><div className="text-sm text-gray-500">{acc.accountHolder} · {acc.currency}</div></div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(0)} className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50">{t('btn.back')}</button>
            <button onClick={() => setStep(2)} disabled={!selectedAccount} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{t('btn.next')}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold mb-6">{t('review.title')}</h2>
          <div className="bg-gray-50 rounded-xl p-6 space-y-4 mb-6">
            <div className="flex justify-between"><span className="text-gray-500">{t('review.amount')}</span><span className="font-mono font-semibold text-lg">{CURRENCY_FLAGS[currency]} {numAmount.toLocaleString()} {currency}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{t('review.fee')}</span><span className="font-mono">{fee.toFixed(2)} {currency}</span></div>
            <div className="border-t pt-4 flex justify-between"><span className="font-semibold">{t('review.net')}</span><span className="font-mono font-bold text-xl text-green-600">{CURRENCY_FLAGS[currency]} {netAmount.toFixed(2)} {currency}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{t('review.method')}</span><span className="font-medium">🏦 {accounts.find((a) => a.id === selectedAccount)?.bankName} •••• {accounts.find((a) => a.id === selectedAccount)?.accountLast4}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">{t('review.estimated')}</span><span className="font-medium">{t('review.estimatedTime')}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50">{t('btn.back')}</button>
            <button onClick={handleWithdraw} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">{t('btn.confirm')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
