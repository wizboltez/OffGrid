import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "providers/AppProviders";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata = {
  title: "Leave Management",
  description: "Portfolio-grade leave management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
