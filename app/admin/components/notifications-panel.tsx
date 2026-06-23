import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { dayOptions, type NotificationFormState } from "@/app/admin/components/admin-page-helpers";

type NotificationsPanelProps = {
  active: boolean;
  form: NotificationFormState;
  message: string | null;
  onChange: (updater: (current: NotificationFormState) => NotificationFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTest: () => void;
  onToggleDay: (day: number) => void;
  saving: boolean;
  testing: boolean;
};

export function NotificationsPanel({
  active,
  form,
  message,
  onChange,
  onSubmit,
  onTest,
  onToggleDay,
  saving,
  testing,
}: NotificationsPanelProps) {
  return (
    <section
      id="notifications-panel"
      role="tabpanel"
      aria-labelledby="notifications-tab"
      hidden={!active}
    >
      <SurfaceCard className="rounded-[1.5rem] p-5">
        <PageHeading title="Notifications" description="Control daily AI practice reminders for regular users." />
        <form className="mt-5 space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                key: "enabled" as const,
                label: "Daily reminders",
                helper: "Cron sends only when enabled.",
              },
              {
                key: "dryRun" as const,
                label: "Dry run",
                helper: "Generate logs without sending.",
              },
              {
                key: "aiEnabled" as const,
                label: "Gemini copy",
                helper: "Use AI personalization.",
              },
              {
                key: "fallbackEnabled" as const,
                label: "Fallback copy",
                helper: "Send deterministic copy if AI fails.",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex min-h-28 cursor-pointer flex-col justify-between rounded-2xl border border-violet-200 bg-white p-4 text-sm text-[#171326] transition-colors hover:bg-violet-50"
              >
                <span>
                  <span className="font-semibold">{item.label}</span>
                  <span className="mt-2 block text-xs leading-5 text-slate-500">{item.helper}</span>
                </span>
                <input
                  type="checkbox"
                  checked={form[item.key]}
                  onChange={(event) => onChange((current) => ({ ...current, [item.key]: event.target.checked }))}
                  className="mt-4 h-5 w-5 accent-violet-900"
                />
              </label>
            ))}
          </div>

          <FormField label="Active days" helperText="The cron still wakes daily; these days decide whether users get reminders.">
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => {
                const checked = form.activeDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => onToggleDay(day.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      checked
                        ? "bg-violet-900 text-white"
                        : "border border-violet-200 bg-white text-violet-800 hover:bg-violet-50"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-[0.45fr_1fr]">
            <FormField label="Max users per run" helperText="1-500 recipients per cron invocation.">
              <input
                min={1}
                max={500}
                type="number"
                value={form.maxUsersPerRun}
                onChange={(event) => onChange((current) => ({ ...current, maxUsersPerRun: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
            <FormField label="Subject template" helperText="Use {name} to personalize with nickname when available.">
              <input
                maxLength={160}
                value={form.subjectTemplate}
                onChange={(event) => onChange((current) => ({ ...current, subjectTemplate: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-3">
            <AppButton disabled={saving} type="submit">
              {saving ? "Saving..." : "Save notification settings"}
            </AppButton>
            <AppButton disabled={testing} type="button" variant="secondary" onClick={onTest}>
              {testing ? "Testing..." : "Send test to admin"}
            </AppButton>
          </div>
        </form>
        {message ? <InlineStatus message={message} variant="success" className="mt-5" /> : null}
      </SurfaceCard>
    </section>
  );
}
