import { adminTabs, type AdminTab } from "@/app/admin/components/admin-page-helpers";

type AdminTabsProps = {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
};

export function AdminTabs({ activeTab, onChange }: AdminTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Admin panel sections"
      className="flex gap-2 overflow-x-auto rounded-full border border-violet-200 bg-white p-1 shadow-[0_16px_40px_-34px_rgba(76,29,149,0.35)]"
    >
      {adminTabs.map((tab) => {
        const active = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
              active
                ? "bg-violet-900 text-white shadow-[0_14px_30px_-24px_rgba(76,29,149,0.9)]"
                : "text-violet-700 hover:bg-violet-50 hover:text-violet-950"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
