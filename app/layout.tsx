import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/features/store/Provider";
import { ToastContainer } from "react-toastify";
import Header from "@/components/commoncompoents/Header";
import Footer from "@/components/commoncompoents/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tizaraa E-commerce",
  description: "Browse our wide selection of quality products",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Tizaraa E-commerce",
    description: "Browse our wide selection of quality products",
    images: "/og-image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tizaraa E-commerce",
    description: "Browse our wide selection of quality products",
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ToastContainer />
          <Header />
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
