import type { Metadata } from "next";
import { EditorialPage } from "@/components/shop/EditorialPage";
import { CONTENT } from "@/lib/content";

const PAGE = CONTENT["copper-care"];

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  alternates: { canonical: "/copper-care" },
};

export default function Page() {
  return <EditorialPage page={PAGE} path="/copper-care" />;
}
