import { AuthPanel } from "./auth-panel";
import { AuthVisualPanel } from "./auth-visual-panel";

export function AuthPageShell() {
  return (
    <main className="grid min-h-screen bg-[#eef3fa] text-slate-950 lg:grid-cols-2">
      <AuthVisualPanel />
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <AuthPanel />
      </section>
    </main>
  );
}
