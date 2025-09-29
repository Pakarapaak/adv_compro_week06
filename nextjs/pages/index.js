import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/Home"); // redirect to additem page
  }, [router]);

  return null; // no UI
}