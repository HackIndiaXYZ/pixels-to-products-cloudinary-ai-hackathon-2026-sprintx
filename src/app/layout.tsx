import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "InvariantLens — Test what your AI sees", description: "Find where image optimization changes stable AI outputs. Built with Cloudinary." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
