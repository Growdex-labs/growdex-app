"use client";

import React, { useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { DashboardHeader } from "../../components/dashboard-header";

const permissionsData = [
  {
    category: "Admin Management",
    actions: [
      { name: "Edit Billing", admin: true, editor: false, viewer: false },
      {
        name: "Change subscription",
        admin: false,
        editor: false,
        viewer: false,
      },
      { name: "Manage Users", admin: false, editor: false, viewer: false },
      { name: "Create Campaigns", admin: false, editor: false, viewer: false },
      { name: "View Reports", admin: false, editor: false, viewer: false },
      { name: "Publish Campaigns", admin: false, editor: false, viewer: false },
    ],
  },
  {
    category: "Campaign Management",
    actions: [
      { name: "Publish Campaigns", admin: false, editor: false, viewer: false },
      { name: "Publish Campaigns", admin: false, editor: false, viewer: false },
      { name: "Publish Campaigns", admin: false, editor: false, viewer: false },
      { name: "Publish Campaigns", admin: false, editor: false, viewer: false },
    ],
  },
  {
    category: "Ads Management",
    actions: [
      { name: "Publish Campaigns", admin: false, editor: false, viewer: false },
      { name: "Publish Campaigns", admin: false, editor: false, viewer: false },
    ],
  },
];

const teamMembersData = [
  {
    id: 1,
    name: "Emma Ebuka",
    email: "emmaebuaka@email.com",
    initials: "EE",
    role: "Editor",
    status: "Active",
  },
  {
    id: 2,
    name: "Charles Oyogo",
    email: "emmaebuaka@email.com",
    initials: "CO",
    role: "Viewer",
    status: "Active",
  },
  {
    id: 3,
    name: "Emma Ebuka",
    email: "emmaebuaka@email.com",
    initials: "EE",
    role: "Editor",
    status: "Active",
  },
];

const pendingInvitesData = [
  {
    id: 1,
    email: "pending@example.com",
    role: "Editor",
    status: "Pending",
  },
  {
    id: 2,
    email: "another@example.com",
    role: "Viewer",
    status: "Pending",
  },
];

export default function ManagePermissionsPage() {
  const [activeTab, setActiveTab] = useState("userRole");
  const [permissions, setPermissions] = useState(permissionsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState(teamMembersData);
  const [pendingInvites, setPendingInvites] = useState(pendingInvitesData);
  const [accessLevel, setAccessLevel] = useState("Anyone with link");
  const [shareLink, setShareLink] = useState(
    "https://www.mindyourbusiness.com"
  );

  const handleCheckboxChange = (
    categoryIndex: number,
    actionIndex: number,
    role: "admin" | "editor" | "viewer"
  ) => {
    const newPermissions = [...permissions];
    newPermissions[categoryIndex].actions[actionIndex][role] =
      !newPermissions[categoryIndex].actions[actionIndex][role];
    setPermissions(newPermissions);
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  const handleRemoveMember = (memberId: number) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
  };

  const handleResendInvite = (inviteId: number) => {
    alert("Invite resent!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar - Desktop Only */}
        <div className="hidden md:block">
          <SettingsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Header */}
          <SettingsHeader />

          {/* manage permissions content */}
          <div className="p-4 md:p-6">
            {/* User Role Tabs */}
            <div className="my-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center w-full p-1 rounded-lg bg-slate-200">
                <button
                  onClick={() => setActiveTab("userRole")}
                  className={`w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center transition-colors ${
                    activeTab === "userRole"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm">User Role</span>
                  <div
                    className={`py-1 px-2 rounded-full  flex items-center justify-center text-xs font-semibold ${
                      activeTab === "userRole"
                        ? "bg-white text-gray-900"
                        : "bg-khaki-300 text-slate-100"
                    }`}
                  >
                    <span>20</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("teamMembers")}
                  className={`w-full h-full rounded-lg p-1 justify-center flex gap-2 items-center transition-colors ${
                    activeTab === "teamMembers"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm">Team Members</span>
                  <div
                    className={`py-1 px-2 rounded-full  flex items-center justify-center text-xs font-semibold ${
                      activeTab === "teamMembers"
                        ? "bg-white text-gray-900"
                        : "bg-khaki-300 text-slate-100"
                    }`}
                  >
                    <span>20</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("pendingInvites")}
                  className={`w-full h-full rounded-lg p-1 hidden  justify-center sm:flex gap-2 items-center transition-colors ${
                    activeTab === "pendingInvites"
                      ? "bg-khaki-200 shadow-sm"
                      : "bg-transparent"
                  }`}
                >
                  <span className="text-sm">Pending Invites</span>
                  <div
                    className={`py-1 px-2 rounded-full  flex items-center justify-center text-xs font-semibold ${
                      activeTab === "pendingInvites"
                        ? "bg-white text-gray-900"
                        : "bg-khaki-300 text-slate-100"
                    }`}
                  >
                    <span>20</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-khaki-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-khaki-300 transition-colors ml-auto mb-4 flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-lg">+</span> Invite Members
              </button>

              {/* User Role Tab Content */}
              {activeTab === "userRole" && (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full border-collapse">
                        {/* Table Header */}
                        <thead>
                          <tr className="bg-khaki-50">
                            <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200">
                              Actions
                            </th>
                            <th className="text-center py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[70px] md:min-w-[100px]">
                              Admin
                            </th>
                            <th className="text-center py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[70px] md:min-w-[100px]">
                              Editor
                            </th>
                            <th className="text-center py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-700 border-b border-gray-200 min-w-[70px] md:min-w-[100px]">
                              Viewer
                            </th>
                          </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                          {permissions.map((category, categoryIndex) => (
                            <React.Fragment key={categoryIndex}>
                              {/* Category Header */}
                              <tr>
                                <td
                                  colSpan={4}
                                  className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-gray-900 bg-gray-50 border-b border-gray-200"
                                >
                                  {category.category}
                                </td>
                              </tr>

                              {/* Category Actions */}
                              {category.actions.map((action, actionIndex) => (
                                <tr
                                  key={actionIndex}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700 border-b border-gray-200">
                                    {action.name}
                                  </td>
                                  <td className="text-center py-2 md:py-3 px-2 md:px-4 border-b border-gray-200">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={action.admin}
                                        onChange={() =>
                                          handleCheckboxChange(
                                            categoryIndex,
                                            actionIndex,
                                            "admin"
                                          )
                                        }
                                        style={{ accentColor: "#ffe95c" }}
                                        className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-khaki-300 focus:ring-2 cursor-pointer"
                                      />
                                    </label>
                                  </td>
                                  <td className="text-center py-2 md:py-3 px-2 md:px-4 border-b border-gray-200">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={action.editor}
                                        onChange={() =>
                                          handleCheckboxChange(
                                            categoryIndex,
                                            actionIndex,
                                            "editor"
                                          )
                                        }
                                        style={{ accentColor: "#ffe95c" }}
                                        className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-khaki-400 focus:ring-2 cursor-pointer"
                                      />
                                    </label>
                                  </td>
                                  <td className="text-center py-2 md:py-3 px-2 md:px-4 border-b border-gray-200">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={action.viewer}
                                        onChange={() =>
                                          handleCheckboxChange(
                                            categoryIndex,
                                            actionIndex,
                                            "viewer"
                                          )
                                        }
                                        style={{ accentColor: "#ffe95c" }}
                                        className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-khaki-400 focus:ring-2 cursor-pointer"
                                      />
                                    </label>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members Tab Content */}
              {activeTab === "teamMembers" && (
                <div className="bg-white rounded-lg overflow-hidden ">
                  {/* Header */}
                  <div className="bg-khaki-200/50 rounded-lg px-4 py-2 mb-4 grid grid-cols-4 gap-2 md:gap-4">
                    <div className="text-xs ml-2 md:text-sm  font-semibold text-gray-700">
                      Name
                    </div>
                    <div className="text-xs md:text-sm ml-2 sm:ml-0 font-semibold text-gray-700">
                      Role
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-700">
                      Status
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-700">
                      Action
                    </div>
                  </div>

                  {/* Items */}
                  <div className="">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="px-4 py-3 rounded-lg bg-gray-100 mb-4 hover:bg-gray-50 transition-colors grid grid-cols-4 gap-2 md:gap-4 items-center"
                      >
                        <div className="text-xs md:text-sm text-gray-700">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-6 md:w-8 h-6 md:h-8 hidden bg-gray-300 rounded-full sm:flex items-center justify-center text-xs font-semibold text-gray-700">
                              {member.initials}
                            </div>
                            <span className="truncate">{member.name}</span>
                          </div>
                        </div>
                        <div className="text-xs md:text-sm ml-2 sm:ml-0 text-gray-700">
                          {member.role}
                        </div>
                        <div className="text-xs md:text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {member.status}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm">
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="px-2 md:px-3 py-1 md:bg-red-100 text-red-700 md:hover:bg-red-200 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center justify-center md:justify-start gap-1"
                          >
                            <span className="hidden md:inline">Remove</span>
                            <span className="md:hidden text-lg leading-none">
                              ⋯
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Invites Tab Content */}
              {activeTab === "pendingInvites" && (
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  {/* Header */}
                  <div className="bg-khaki-200 rounded-t-lg px-4 py-3 grid grid-cols-4 gap-2 md:gap-4">
                    <div className="text-xs md:text-sm font-semibold text-gray-700">
                      Email
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-700">
                      Role
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-700">
                      Status
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-gray-700">
                      Action
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-200">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors grid grid-cols-4 gap-2 md:gap-4 items-center"
                      >
                        <div className="text-xs md:text-sm text-gray-700 truncate">
                          {invite.email}
                        </div>
                        <div className="text-xs md:text-sm text-gray-700">
                          {invite.role}
                        </div>
                        <div className="text-xs md:text-sm">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            {invite.status}
                          </span>
                        </div>
                        <div className="text-xs md:text-sm">
                          <button
                            onClick={() => handleResendInvite(invite.id)}
                            className="px-2 md:px-3 py-1 md:bg-red-100 text-red-700 md:hover:bg-red-200 rounded text-xs font-medium transition-colors whitespace-nowrap flex items-center justify-center md:justify-start gap-1"
                          >
                            <span className="hidden md:inline">
                              Resend Invite
                            </span>
                            <span className="md:hidden text-lg leading-none">
                              ⋯
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Members Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-800/40 bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[500px] overflow-y-auto hide-scrollbar">
            {/* Modal Header */}
            <div>
              <h2 className="p-2 text-center bg-slate-100 font-bold text-gray-900 mb-2">
                Invite Members to Collaborate
              </h2>
              <p className="text-sm text-center mb-2 text-gray-600">
                Members can edit, view or manage project.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 ">
              {/* Link to Share Section */}
              <div className="bg-khaki-200/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Link to share
                    </h3>
                    <p className="text-xs text-gray-600">
                      Anyone with the link can access
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={accessLevel}
                      onChange={(e) => setAccessLevel(e.target.value)}
                      className="flex-1 px-3 py-2 border bg-white border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-khaki-400"
                    >
                      <option>Anyone with link</option>
                      <option>Specific people</option>
                      <option>Restricted</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm text-slate-500 bg-transparent focus:outline-none focus:ring-2 focus:ring-khaki-300"
                    />
                    <button className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-sm text-sm font-medium transition-colors whitespace-nowrap">
                      Send Invite
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Members Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Account Members
                  </h3>
                  <button
                    onClick={handleCopyLink}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    Copy link
                  </button>
                </div>

                {/* Members List */}
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between "
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
                          {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value)
                        }
                        className="px-3 py-1 rounded-sm text-xs focus:outline-none ml-2"
                      >
                        <option>Owner</option>
                        <option>Edit</option>
                        <option>Viewer</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-900 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
