"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const NavBarComponent = () => {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === "loading") {
    return <></>;
  }

  return (
    <div className="flex justify-between items-center w-full h-14 px-4 drop-shadow-md border-b">
      <p className="text-slate-900 cursor-pointer font-mono">
        <Link href="/">AutoBot</Link>
      </p>
      <div className="flex items-center gap-4 text-slate-500 cursor-pointer">
        {session && (
          <>
            <Link
              className={`navLink ${pathname === "/" ? "navLinkActive" : ""}`}
              href="/"
            >
              Home
            </Link>
            <Link
              className={`navLink ${
                pathname === "/gallery" ? "navLinkActive" : ""
              }`}
              href="/gallery"
            >
              Gallery
            </Link>
            <button
              className={`navLink`}
              onClick={() => {
                signOut();
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBarComponent;
