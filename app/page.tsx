import type { Metadata } from "next";

import ChatPageClient from "@/components/ChatPageClient";

export const metadata: Metadata = {
  title: "ScrapeSmart AI — Website Q&A Chatbot",
  description:
    "Paste any website URL and ask questions. ScrapeSmart AI reads the page and answers with concise, helpful responses.",
};

export default function Page() {
  return <ChatPageClient />;
}
