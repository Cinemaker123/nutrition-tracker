import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights - Nutrition Tracker",
  description: "AI-powered recipe suggestions and nutrition analysis",
};

export default function InsightsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white py-8 px-4 transition-colors">
      <div className="max-w-4xl mx-auto pt-8">
        {children}
      </div>
    </div>
  );
}
