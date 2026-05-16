export const metadata = {
  title: 'XPAT Employee Fetch',
  description: 'Employee verification app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
