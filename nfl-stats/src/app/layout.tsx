import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/Auth.context';
import { MessageProvider } from '@/contexts/Message.context';
import { GoogleAnalytics } from '@next/third-parties/google';
import Footer from '@/components/footer.component';
import './globals.css'
const inter = Inter({ subsets: ['latin'] })

import Navbar from '../components/nav/navbar.component'

export const metadata: Metadata = {
  title: 'End Zone Edge',
  description: 'NFL Stats and Analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + ' text-black' + ' min-w-[1200px]'}>
        <AuthProvider>
          <MessageProvider>
            <Navbar></Navbar>
            {children}
            <Footer></Footer>
          </MessageProvider>
        </AuthProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID ? 
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      : null}
    </html>
  )
}
