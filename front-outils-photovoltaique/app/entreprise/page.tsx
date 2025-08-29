// app/entreprise/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EntrepriseIndex() {
  const router = useRouter();
  useEffect(() => { router.replace("/entreprise/equipments"); }, [router]);
  return null;
}
