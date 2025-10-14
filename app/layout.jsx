import { ClerkProvider } from "@clerk/nextjs";
import { light } from "@clerk/themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Kanit } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientLayout from "./components/ClientLayout";
import "./globals.css";
import AccessibilityFloatingIcon from './components/AccessibilityFloatingIcon';
const kanit = Kanit({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Codentor - Master Code. Build Future.",
  description: "Your all-in-one platform to learn, practice, and excel in programming. Join a community of developers building the future of Bangladesh's tech ecosystem.",
  openGraph: {
    type: "website",
    url: "https://codentor.vercel.app",
    title: "Codentor - Master Code. Build Future.",
    description: "Your all-in-one platform to learn, practice, and excel in programming. Join a community of developers building the future of Bangladesh's tech ecosystem.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Codentor - Master Code. Build Future.",
    description: "Your all-in-one platform to learn, practice, and excel in programming.",
    images: ["/hero.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: light,
      }}
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
          <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
          <link rel="manifest" href="/site.webmanifest?v=2" />
          <meta name="theme-color" content="#10b981" />
          <meta property="og:type" content={metadata.openGraph.type} />
          <meta property="og:url" content={metadata.openGraph.url} />
          <meta property="og:title" content={metadata.openGraph.title} />
          <meta
            property="og:description"
            content={metadata.openGraph.description}
          />
        </head>
        <body className={kanit.className}>
          {/* Retain ClientLayout to manage conditional Sidebar rendering */}
          <ClientLayout>
            <main>
              {/* Keep the new background styling from the incoming changes */}
              <div className="flex items-start justify-center min-h-screen min-w-full">
                <div className="w-full h-full">{children}</div>
              </div>
            </main>
          </ClientLayout>
          <AccessibilityFloatingIcon />
          <ToastContainer />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
