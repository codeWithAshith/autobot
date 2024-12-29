"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingComponent from "@/components/Loading.component";

const LoginPage = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/");
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "loading") {
    return <LoadingComponent />;
  }

  return (
    sessionStatus !== "authenticated" && (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <button
          className="bg-black text-white py-2 w-96 rounded hover:bg-gray-800"
          onClick={() =>
            signIn("google", { callbackUrl: "http://localhost:3000/" })
          }
        >
          Sign in with Google
        </button>
      </div>
    )
  );
};

export default LoginPage;
