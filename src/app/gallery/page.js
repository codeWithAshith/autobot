"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import GalleryComponent from "@/components/Gallery.component";
import LoadingComponent from "@/components/Loading.component";

const GalleryPage = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  if (sessionStatus === "loading") {
    return <LoadingComponent />;
  }

  return (
    <main className="flex h-full flex-col items-center justify-between p-8">
      <GalleryComponent />
    </main>
  );
};

export default GalleryPage;
