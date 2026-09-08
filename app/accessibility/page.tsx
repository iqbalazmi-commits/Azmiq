import type { Metadata } from "next";
import { EditorialPage } from "@/components/shop/EditorialPage";
import { CONTENT } from "@/lib/content";

const PAGE = CONTENT["accessibility"];

export const metadata: Metadata = {
  title: PAGE.title,
  description: PAGE.description,
  alternates: { canonical: "/accessibility" },
};

export default function Page() {
  return <EditorialPage page={PAGE} path="/accessibility" />;
}
