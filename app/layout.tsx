import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Script
        src="https://kit.fontawesome.com/306539fa0b.js"
      />

    </html>
  );
}

export const metadata = {
  title: "Simon's page",
  description: 'Welcome to my corner of the internet!',
  charset: 'utf-8',
  icons: {
    icon: '/favicon.ico',
  }
};

