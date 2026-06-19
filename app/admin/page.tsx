"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddTaskPanel } from "@/app/admin/components/add-task-panel";
import { AdminHeader } from "@/app/admin/components/admin-header";
import {
  initialNotificationForm,
  initialTaskForm,
  notificationFormFromSettings,
  notificationPayloadFromForm,
  taskPayloadFromForm,
  type AdminTab,
  type NotificationFormState,
  type TaskFormState,
} from "@/app/admin/components/admin-page-helpers";
import { AdminTabs } from "@/app/admin/components/admin-tabs";
import { NotificationsPanel } from "@/app/admin/components/notifications-panel";
import { TaskInventoryPanel } from "@/app/admin/components/task-inventory-panel";
import { UsersPanel } from "@/app/admin/components/users-panel";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { adminApiGet, adminApiPost } from "@/lib/client/admin-api-client";
import { clearAdminToken, getAdminToken } from "@/lib/client/admin-auth-storage";
import type {
  AdminPracticeTask,
  AdminUserDetail,
  AdminUserOverview,
  NotificationSettings,
  NotificationTestResponse,
} from "@/lib/client/types";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserOverview[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [tasks, setTasks] = useState<AdminPracticeTask[]>([]);
  const [taskForm, setTaskForm] = useState<TaskFormState>(initialTaskForm);
  const [notificationForm, setNotificationForm] = useState<NotificationFormState>(initialNotificationForm);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [testingNotifications, setTestingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskMessage, setTaskMessage] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const selectedOverview = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );
  const selectedUserDetail = selectedUser?.id === selectedUserId ? selectedUser : null;

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }

    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      const [usersResult, tasksResult, notificationResult] = await Promise.all([
        adminApiGet<AdminUserOverview[]>("/api/admin/users"),
        adminApiGet<AdminPracticeTask[]>("/api/admin/tasks"),
        adminApiGet<NotificationSettings>("/api/admin/notifications"),
      ]);

      if (!active) {
        return;
      }

      if (!usersResult.success) {
        setError(usersResult.error.message);
        setLoading(false);
        return;
      }

      if (!tasksResult.success) {
        setError(tasksResult.error.message);
        setLoading(false);
        return;
      }

      if (!notificationResult.success) {
        setError(notificationResult.error.message);
        setLoading(false);
        return;
      }

      setUsers(usersResult.data);
      setTasks(tasksResult.data);
      setNotificationForm(notificationFormFromSettings(notificationResult.data));
      setSelectedUserId(usersResult.data[0]?.id ?? null);
      setLoading(false);
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    let active = true;

    async function loadUserDetail() {
      setDetailLoading(true);
      const result = await adminApiGet<AdminUserDetail>(`/api/admin/users/${selectedUserId}`);

      if (!active) {
        return;
      }

      setDetailLoading(false);
      if (!result.success) {
        setError(result.error.message);
        setSelectedUser(null);
        return;
      }

      setSelectedUser(result.data);
    }

    void loadUserDetail();

    return () => {
      active = false;
    };
  }, [selectedUserId]);

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTaskMessage(null);
    setError(null);

    const payload = taskPayloadFromForm(taskForm);
    if (!payload) {
      setError("Task name, duration, and BPM must be valid.");
      return;
    }

    setSavingTask(true);
    const result = await adminApiPost<AdminPracticeTask>("/api/admin/tasks", payload);
    setSavingTask(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setTasks((current) => [result.data, ...current]);
    setTaskForm(initialTaskForm);
    setTaskMessage("Task added to the practice pool.");
  }

  async function handleSaveNotifications(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotificationMessage(null);
    setError(null);

    const payload = notificationPayloadFromForm(notificationForm);
    if (!payload) {
      setError("Notification settings must include at least one day, a subject, and 1-500 users per run.");
      return;
    }

    setSavingNotifications(true);
    const result = await adminApiPost<NotificationSettings>("/api/admin/notifications", payload);
    setSavingNotifications(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setNotificationForm(notificationFormFromSettings(result.data));
    setNotificationMessage("Notification settings saved.");
  }

  async function handleSendNotificationTest() {
    setNotificationMessage(null);
    setError(null);
    setTestingNotifications(true);

    const result = await adminApiPost<NotificationTestResponse>("/api/admin/notifications/test", {});
    setTestingNotifications(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setNotificationMessage(
      result.data.sent
        ? "Test reminder email sent to the admin account."
        : `Dry run test generated: ${result.data.preview ?? "No preview returned."}`,
    );
  }

  function toggleNotificationDay(day: number) {
    setNotificationForm((current) => {
      const hasDay = current.activeDays.includes(day);
      return {
        ...current,
        activeDays: hasDay ? current.activeDays.filter((item) => item !== day) : [...current.activeDays, day].sort(),
      };
    });
  }

  function handleLogout() {
    clearAdminToken();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <PageShell width="7xl" fullHeight className="flex items-center justify-center">
        <InlineStatus message="Loading admin data..." variant="muted" />
      </PageShell>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#fbfaff]">
      <AdminHeader onLogout={handleLogout} />

      <PageShell width="7xl" className="space-y-6 py-6">
        <AdminTabs activeTab={activeTab} onChange={setActiveTab} />
        <UsersPanel
          active={activeTab === "users"}
          detailLoading={detailLoading}
          onSelectUser={setSelectedUserId}
          selectedOverview={selectedOverview}
          selectedUser={selectedUserDetail}
          selectedUserId={selectedUserId}
          users={users}
        />
        <TaskInventoryPanel active={activeTab === "taskInventory"} tasks={tasks} />
        <AddTaskPanel
          active={activeTab === "addTask"}
          form={taskForm}
          message={taskMessage}
          onChange={setTaskForm}
          onSubmit={handleCreateTask}
          saving={savingTask}
        />
        <NotificationsPanel
          active={activeTab === "notifications"}
          form={notificationForm}
          message={notificationMessage}
          onChange={setNotificationForm}
          onSubmit={handleSaveNotifications}
          onTest={handleSendNotificationTest}
          onToggleDay={toggleNotificationDay}
          saving={savingNotifications}
          testing={testingNotifications}
        />
        {error ? <InlineStatus message={error} variant="error" /> : null}
      </PageShell>
    </div>
  );
}
