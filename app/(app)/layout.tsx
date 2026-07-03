import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { PageTransition } from "@/components/page-transition";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-dvh w-full flex-1">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-6 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
