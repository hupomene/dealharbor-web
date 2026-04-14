import Sidebar from "@/components/app/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}