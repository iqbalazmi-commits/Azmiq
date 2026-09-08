import type { Metadata } from "next";
import { EditorialPage } from "@/components/shop/EditorialPage";
import { CONTENT } from "@/lib/content";

const PAGE = CONTENT["about"];

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <EditorialPage page={PAGE} path="/about" />;
}
