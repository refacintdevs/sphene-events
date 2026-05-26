import { ThemeToggle } from "@/components/theme-toggle";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {children}
      </main>
    </div>
  );
}
