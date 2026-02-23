import type { Metadata } from "next";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Rhetorica - Competitive Debate App",
  description: "Practice and compete in structured debates with AI-powered analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

