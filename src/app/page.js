"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import LoadingComponent from "@/components/Loading.component";
import VideoGenComponent from "@/components/VideoGen.component";

const Home = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession({
    required: false,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      router.replace("/login");
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "loading") {
    return <LoadingComponent />;
  }

  return (
    <main className="my-4">
      <VideoGenComponent />
    </main>
  );
};

export default Home;
