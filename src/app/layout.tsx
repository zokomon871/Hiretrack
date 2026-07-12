import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from '@/components/theme-provider';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://hiretrack-app.vercel.app'),
  title: {
    default: "HireTrack | Modern Applicant Tracking System",
    template: "%s | HireTrack",
  },
  description: "A fast, beautifully designed applicant tracking system for modern B2B teams. Manage jobs, move candidates through the pipeline, and schedule interviews effortlessly.",
  openGraph: {
    title: "HireTrack | Modern Applicant Tracking System",
    description: "A fast, beautifully designed applicant tracking system for modern B2B teams.",
    url: "https://hiretrack-app.vercel.app",
    siteName: "HireTrack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireTrack | Modern Applicant Tracking System",
    description: "A fast, beautifully designed applicant tracking system for modern B2B teams.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
