import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HugHigh',
  description: '高校生向け非認知能力可視化アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
