import { I18nProvider } from '@/i18n/I18nProvider'
import { Navbar } from '@/components/Navbar'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <I18nProvider initialLocale={params.locale}>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </I18nProvider>
  )
}
