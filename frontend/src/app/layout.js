import "./globals.css";
import { AppProviders } from "providers/AppProviders";

export const metadata = {
  title: "Leave Management",
  description: "Portfolio-grade leave management application",
};

export default function RootLayout({ children }) {
  const fontVars = {
    "--font-manrope": '"Segoe UI", "Poppins", "Noto Sans", sans-serif',
    "--font-space": '"Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif',
  };

  return (
    <html lang="en" style={fontVars}>
      <body style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
