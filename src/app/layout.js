import "./globals.css";

import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";

import SessionProvider from "@/utils/SessionProvider";
import NavBarComponent from "@/components/NavBar.component";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Auto Bot",
  description: "Video generator",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <div className="h-screen w-screen flex flex-col">
            <NavBarComponent />
            <Toaster position="top-right" />
            <div className="flex-1 overflow-y-auto bg-slate-50">{children}</div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
