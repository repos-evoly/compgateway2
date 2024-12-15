import { notFound } from "next/navigation";

export default function CatchAllPage() {
  notFound(); // Trigger the `not-found.tsx` for all unmatched routes
}
