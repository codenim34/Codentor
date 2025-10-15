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
    icon: "/favicon.ico",
  },
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
          <meta property="og:type" content={metadata.openGraph.type} />
          <meta property="og:url" content={metadata.openGraph.url} />
          <meta property="og:title" content={metadata.openGraph.title} />
          <meta
            property="og:description"
            content={metadata.openGraph.description}
          />
          <meta property="og:image" content={metadata.openGraph.image} />
        </head>
        <body className={`${kanit.className} bg-black`}>
          {/* Retain ClientLayout to manage conditional Sidebar rendering */}
          <ClientLayout>
            <main className="bg-gradient-to-br from-black via-green-950 to-black min-h-screen">
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
