"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PanelLayout } from "../components/panel-layout";
import { NotificationsSidebar } from "../components/notifications-sidebar";
import { DepositIcon, DepositIcon2 } from "@/components/svg";
const notificationsData = [
  {
    id: 1,
    message:
      '"Your campaign "Summer Promo" received feedback from AI Insights."',
    campaign: "Summer Promo",
    time: "30mins ago",
    type: "comments",
  },
  {
    id: 2,
    message: '"Tochukwu added a comment on "Q4 Budget Test."',
    campaign: "Q4 Budget Test",
    time: "2h ago",
    type: "comments",
  },
  {
    id: 3,
    message: '"Your campaign "Brand Awareness" got a new performance note."',
    campaign: "Brand Awareness",
    time: "5h ago",
    type: "comments",
  },
];

const tagsData = [
  {
    id: 1,
    message: '"#HolidayBoost tag was added to "Christmas Sale 2025."',
    campaign: "Christmas Sale 2025",
    time: "30mins ago",
    type: "tags",
  },
  {
    id: 2,
    message: '"#PausedCampaign tag removed from "Ad Set 4."',
    campaign: "Ad Set 4",
    time: "2h ago",
    type: "tags",
  },
];

const remindersData = [
  {
    id: 1,
    message: '"Check Meta Ads budget allocation."',
    status: "Completed",
    time: "Today",
    type: "reminders",
  },
  {
    id: 2,
    message: '"Launch Black Friday campaign."',
    status: "Upcoming",
    time: "Nov 15",
    type: "reminders",
  },
  {
    id: 3,
    message: '"Review TikTok Ad performance."',
    status: "Due in 2 days",
    time: "---",
    type: "reminders",
  },
];

const timeFilters = [
  { label: "Today", count: 20 },
  { label: "This Week", count: 20 },
  { label: "This Week", count: 20 },
  { label: "This Week", count: 20 },
  { label: "Last Month", count: 20 },
];

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("comments");
  const [activeTimeFilter, setActiveTimeFilter] = useState("today");
  const [notifications, setNotifications] = useState(notificationsData);
  const [tags, setTags] = useState(tagsData);
  const [reminders, setReminders] = useState(remindersData);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showCreateReminderModal, setShowCreateReminderModal] = useState(false);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const [newReminder, setNewReminder] = useState({
    title: "",
    assignTo: "",
    dueDate: "",
    remindDate: "",
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["comments", "tags", "reminders"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleClearAll = () => {
    setShowClearModal(true);
  };

  const confirmClearAll = () => {
    if (activeTab === "comments") {
      setNotifications([]);
    } else if (activeTab === "tags") {
      setTags([]);
    } else if (activeTab === "reminders") {
      setReminders([]);
    }
    setShowClearModal(false);
  };

  const handleMarkAllAsRead = () => {
    let items: any[] = [];
    if (activeTab === "comments") items = notifications;
    else if (activeTab === "tags") items = tags;
    else if (activeTab === "reminders") items = reminders;

    const allIds = new Set(items.map((n) => n.id));
    setReadNotifications(allIds);
  };

  const handleNotificationClick = (notificationId: number) => {
    setReadNotifications((prev) => new Set(prev).add(notificationId));
  };

  const handleCreateReminder = () => {
    setShowCreateReminderModal(true);
  };

  const handleSaveReminder = () => {
    if (newReminder.title.trim()) {
      const reminder = {
        id: reminders.length + 1,
        message: `"${newReminder.title}"`,
        status: "Upcoming",
        time: newReminder.dueDate,
        type: "reminders",
      };
      setReminders([...reminders, reminder]);
      setNewReminder({ title: "", assignTo: "", dueDate: "", remindDate: "" });
      setShowCreateReminderModal(false);
    }
  };

  const getCurrentData = () => {
    if (activeTab === "comments") return notifications;
    if (activeTab === "tags") return tags;
    if (activeTab === "reminders") return reminders;
    return [];
  };

  const getColumnHeaders = () => {
    if (activeTab === "comments") return ["Comments", "Campaign", "Time"];
    if (activeTab === "tags") return ["Tag Update", "Campaign", "Time"];
    if (activeTab === "reminders") return ["Reminder", "Status", "Time"];
    return [];
  };

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar - Desktop Only */}
        <div className="hidden md:block">
          <NotificationsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {/* Time Filters */}
            <div className="my-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center w-full p-1 rounded-lg bg-slate-200 overflow-x-auto pb-2 md:overflow-x-visible hide-scrollbar md:pb-0">
                {timeFilters.map((filter, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setActiveTimeFilter(
                        filter.label.toLowerCase().replace(/\s+/g, "")
                      )
                    }
                    className={`w-full h-full rounded-lg p-1 ml-2 justify-center flex gap-2 items-center transition-colors whitespace-nowrap ${
                      activeTimeFilter ===
                      filter.label.toLowerCase().replace(/\s+/g, "")
                        ? "bg-khaki-200 shadow-sm"
                        : "bg-transparent"
                    }`}
                  >
                    <span className="text-sm">{filter.label}</span>
                    <div
                      className={`py-1 px-2 rounded-full flex items-center justify-center text-xs font-semibold ${
                        activeTimeFilter ===
                        filter.label.toLowerCase().replace(/\s+/g, "")
                          ? "bg-white text-gray-900"
                          : "bg-khaki-300 text-slate-100"
                      }`}
                    >
                      <span>{filter.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 mb-6 flex-wrap justify-between">
              <div>
                {activeTab === "reminders" && (
                  <button
                    onClick={handleCreateReminder}
                    className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors flex items-center gap-2"
                  >
                    <span>+</span> Create Reminder
                  </button>
                )}
              </div>
              <div>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                >
                  Clear All Notifications
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 text-gray-900 text-sm font-medium  transition-colors underline underline-offset-2 decoration-khaki-200"
                >
                  Mark All as Read
                </button>
              </div>
            </div>

            {/* Notifications Table */}
            <div className="bg-white overflow-hidden">
              {/* Header */}
              <div className="bg-khaki-200/50 rounded-lg px-4 py-2 mb-4 grid grid-cols-4 sm:grid-cols-3 gap-4 text-xs md:text-sm font-semibold text-gray-700">
                {getColumnHeaders().map((header, index) => (
                  <div
                    key={index}
                    className={index > 0 ? "" : "col-span-2 sm:col-span-1"}
                  >
                    {header}
                  </div>
                ))}
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-200">
                {getCurrentData().length > 0 ? (
                  getCurrentData().map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item.id)}
                      className={`px-4 py-4 cursor-pointer transition-colors grid grid-cols-4 sm:grid-cols-3 gap-4 items-center text-xs md:text-sm ${
                        readNotifications.has(item.id)
                          ? "bg-white hover:bg-gray-50"
                          : "bg-gray-100 hover:bg-gray-150"
                      }`}
                    >
                      <div className="text-gray-700 line-clamp-4 sm:line-clamp-2 col-span-2 sm:col-span-1">
                        {item.message}
                      </div>
                      <div className="text-gray-700">
                        {activeTab === "reminders"
                          ? (item as any).status
                          : (item as any).campaign}
                      </div>
                      <div className="text-gray-600">{item.time}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No {activeTab}
                  </div>
                )}
              </div>
            </div>

            {/* Clear All Modal */}
            {showClearModal && (
              <div className="fixed inset-0 bg-slate-800/40 bg-opacity-20 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Clear All Notifications
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    Do you want to clear all notifications?
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowClearModal(false)}
                      className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 flex items-center gap-2 transition-colors"
                    >
                      <DepositIcon />
                      Cancel
                    </button>
                    <button
                      onClick={confirmClearAll}
                      className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 flex items-center gap-2 transition-colors"
                    >
                      <DepositIcon2 />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create Reminder Modal */}
            {showCreateReminderModal && (
              <div className="fixed inset-0 bg-slate-800/40 bg-opacity-20 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                  <h2 className="text-lg font-semibold text-center text-gray-900 mb-6">
                    Create New Reminder
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Reminder Title
                      </label>
                      <input
                        type="text"
                        value={newReminder.title}
                        onChange={(e) =>
                          setNewReminder({
                            ...newReminder,
                            title: e.target.value,
                          })
                        }
                        placeholder="Create metro ads budget allocation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Assign To
                      </label>
                      <input
                        type="text"
                        value={newReminder.assignTo}
                        onChange={(e) =>
                          setNewReminder({
                            ...newReminder,
                            assignTo: e.target.value,
                          })
                        }
                        placeholder="Editor"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={newReminder.dueDate}
                          onChange={(e) =>
                            setNewReminder({
                              ...newReminder,
                              dueDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Remind me on
                        </label>
                        <input
                          type="date"
                          value={newReminder.remindDate}
                          onChange={(e) =>
                            setNewReminder({
                              ...newReminder,
                              remindDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-khaki-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCreateReminderModal(false);
                        setNewReminder({
                          title: "",
                          assignTo: "",
                          dueDate: "",
                          remindDate: "",
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReminder}
                      className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <DepositIcon2 /> Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
