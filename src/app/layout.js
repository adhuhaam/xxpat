import './globals.css';
import ServiceWorkerRegister from './sw-register';

export const metadata = {
  title: 'XPAT Verify',
  description: 'Work Permit Verification - Maldives',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'XPAT Verify',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f8f8fa',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
