"use client";
import { Button } from "./ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button
      onClick={router.back}
      variant="outline"
      className="m-2 size-8 rounded-full"
    >
      <ArrowLeftIcon className="size-4" />
    </Button>
  );
}
