import { AppButton } from "@/app/components/ui/app-button";

type AdminHeaderProps = {
  onLogout: () => void;
};

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="border-b border-violet-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-tight text-[#171326]">Practice Arena Admin</p>
          <p className="text-xs text-slate-500">Users, sessions, feedback, and task content</p>
        </div>
        <AppButton type="button" variant="secondary" onClick={onLogout}>
          Log out
        </AppButton>
      </div>
    </header>
  );
}
