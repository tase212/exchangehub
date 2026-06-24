'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTranslation } from '@/i18n/useTranslation'

interface BankCard {
  id: string; cardLast4: string; cardholder: string; expiryMonth: number; expiryYear: number; brand: string; bankName: string | null; isDefault: boolean
}

interface BankAccount {
  id: string; accountLast4: string; bankName: string; accountHolder: string; country: string; currency: string; isDefault: boolean; routingCode: string | null
}

export default function PaymentMethodsPage({ params }: { params: { locale: string } }) {
  const { t, locale } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<'cards' | 'accounts'>('cards')
  const [cards, setCards] = useState<BankCard[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [showAddCard, setShowAddCard] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [loading, setLoading] = useState(true)

  const [cardForm, setCardForm] = useState({ cardNumber: '', cardholder: '', expiryMonth: '', expiryYear: '', bankName: '' })
  const [accountForm, setAccountForm] = useState({ accountNumber: '', routingCode: '', bankName: '', accountHolder: '', country: '', currency: 'USD' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push(`/${locale}/login`); return }
    if (isAuthenticated) fetchData()
  }, [isAuthenticated, isLoading])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cardRes, accRes] = await Promise.all([fetch('/api/cards'), fetch('/api/accounts')])
      const cardData = await cardRes.json()
      const accData = await accRes.json()
      setCards(cardData.cards || [])
      setAccounts(accData.accounts || [])
    } catch {} finally { setLoading(false) }
  }

  const handleAddCard = async () => {
    setFormError(''); setSubmitting(true)
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCards([data.card, ...cards])
      setShowAddCard(false)
      setCardForm({ cardNumber: '', cardholder: '', expiryMonth: '', expiryYear: '', bankName: '' })
    } catch (err: any) { setFormError(err.message) } finally { setSubmitting(false) }
  }

  const handleAddAccount = async () => {
    setFormError(''); setSubmitting(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAccounts([data.account, ...accounts])
      setShowAddAccount(false)
      setAccountForm({ accountNumber: '', routingCode: '', bankName: '', accountHolder: '', country: '', currency: 'USD' })
    } catch (err: any) { setFormError(err.message) } finally { setSubmitting(false) }
  }

  const handleDeleteCard = async (id: string) => {
    await fetch(`/api/cards?id=${id}`, { method: 'DELETE' })
    setCards(cards.filter((c) => c.id !== id))
  }

  const handleDeleteAccount = async (id: string) => {
    await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' })
    setAccounts(accounts.filter((a) => a.id !== id))
  }

  const brandIcon = (brand: string) => {
    if (brand === 'VISA') return '💳'
    if (brand === 'MASTERCARD') return '💳'
    if (brand === 'AMEX') return '💳'
    return '💳'
  }

  if (isLoading || loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>
  if (!isAuthenticated) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 max-w-xs">
        <button onClick={() => setTab('cards')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${tab === 'cards' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>{t('cards.title')}</button>
        <button onClick={() => setTab('accounts')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${tab === 'accounts' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>{t('accounts.title')}</button>
      </div>

      {tab === 'cards' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('cards.title')}</h2>
            <button onClick={() => { setShowAddCard(!showAddCard); setFormError('') }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">{t('cards.add')}</button>
          </div>

          {showAddCard && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              {formError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">{t('form.cardNumber')}</label><input value={cardForm.cardNumber} onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="4242 4242 4242 4242" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.cardholder')}</label><input value={cardForm.cardholder} onChange={(e) => setCardForm({ ...cardForm, cardholder: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.bankName')}</label><input value={cardForm.bankName} onChange={(e) => setCardForm({ ...cardForm, bankName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.expiryMonth')}</label><select value={cardForm.expiryMonth} onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"><option value="">MM</option>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.expiryYear')}</label><select value={cardForm.expiryYear} onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"><option value="">YYYY</option>{Array.from({ length: 10 }, (_, i) => <option key={i} value={2024 + i}>{2024 + i}</option>)}</select></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAddCard(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">{t('btn.cancel')}</button>
                <button onClick={handleAddCard} disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{submitting ? '...' : t('btn.add')}</button>
              </div>
            </div>
          )}

          {cards.length === 0 && !showAddCard ? (
            <div className="text-center py-12 text-gray-400"><p>{t('cards.empty')}</p></div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <div key={card.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{brandIcon(card.brand)}</div>
                    <div>
                      <div className="font-medium">{card.brand} {t('cards.visa') ? `•••• ${card.cardLast4}` : `•••• ${card.cardLast4}`}</div>
                      <div className="text-sm text-gray-500">{card.cardholder} · {t('cards.expiry')} {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {card.isDefault && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{t('cards.default')}</span>}
                    <button onClick={() => handleDeleteCard(card.id)} className="text-red-500 hover:text-red-700 text-sm">{t('cards.delete')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'accounts' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('accounts.title')}</h2>
            <button onClick={() => { setShowAddAccount(!showAddAccount); setFormError('') }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">{t('accounts.add')}</button>
          </div>

          {showAddAccount && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              {formError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">{t('form.accountNumber')}</label><input value={accountForm.accountNumber} onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.bankName')}</label><input value={accountForm.bankName} onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.accountHolder')}</label><input value={accountForm.accountHolder} onChange={(e) => setAccountForm({ ...accountForm, accountHolder: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.routingCode')}</label><input value={accountForm.routingCode} onChange={(e) => setAccountForm({ ...accountForm, routingCode: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.country')}</label><input value={accountForm.country} onChange={(e) => setAccountForm({ ...accountForm, country: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="US" /></div>
                <div><label className="block text-sm font-medium mb-1">{t('form.currency')}</label><select value={accountForm.currency} onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"><option value="USD">USD</option><option value="CNY">CNY</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="HKD">HKD</option></select></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAddAccount(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">{t('btn.cancel')}</button>
                <button onClick={handleAddAccount} disabled={submitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{submitting ? '...' : t('btn.add')}</button>
              </div>
            </div>
          )}

          {accounts.length === 0 && !showAddAccount ? (
            <div className="text-center py-12 text-gray-400"><p>{t('accounts.empty')}</p></div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">🏦</div>
                    <div>
                      <div className="font-medium">{acc.bankName} {t('accounts.last4')} {acc.accountLast4}</div>
                      <div className="text-sm text-gray-500">{acc.accountHolder} · {acc.currency} · {acc.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {acc.isDefault && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{t('cards.default')}</span>}
                    <button onClick={() => handleDeleteAccount(acc.id)} className="text-red-500 hover:text-red-700 text-sm">{t('accounts.delete')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
