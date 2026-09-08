import type { Metadata } from "next";
import { EditorialPage } from "@/components/shop/EditorialPage";
import { CONTENT } from "@/lib/content";

const PAGE = CONTENT["fair-pricing"];

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  alternates: { canonical: "/fair-pricing" },
};

export default function Page() {
  return <EditorialPage page={PAGE} path="/fair-pricing" />;
}
