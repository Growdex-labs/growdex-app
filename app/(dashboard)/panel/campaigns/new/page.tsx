"use client";

import { useState } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { CampaignsSidebar } from "../../components/campaigns-sidebar";
import {
  ChevronDown,
  CircleArrowRight,
  Facebook,
  InstagramIcon,
  MoreVerticalIcon,
  Search,
  SparklesIcon,
  Users,
} from "lucide-react";
import { PluggedIcon, PluggedOutIcon } from "@/components/svg";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewCampaignPage() {
  const [progressTab, setProgressTab] = useState<number>(0);

  const progressTitles = [
    "Set campaign goal",
    "Choose platform",
    "Target audience",
    "Budget and schedule",
    "Creative setup",
  ];

  return (
    <PanelLayout>
      <div className="flex h-full">
        {/* Secondary Sidebar */}
        <CampaignsSidebar />

        {/* Main Content */}
        <div className="h-full flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Page Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              New Campaign
            </h1>

            {/* Progress Tabs */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 mt-1 p-4">
              {progressTitles.map((title, index) => (
                <button
                  key={index}
                  onClick={() => setProgressTab(index)}
                  className={`px-2 py-3 rounded-lg font-medium transition-colors ${
                    progressTab === index
                      ? "bg-khaki-200 text-gray-900 shadow-lg"
                      : "bg-transparent text-gray-600"
                  } whitespace-nowrap`}
                >
                  {title}
                </button>
              ))}
            </div>

            {/* New Campaign Form */}
            <form className="space-y-6">
              {/* Campaign Name */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex gap-3 items-center">
                  <img src="/megaphone.png" alt="megaphone-icon" />
                  <div className="flex-1">
                    <label
                      htmlFor="campaignName"
                      className="block text-sm font-medium text-gray-500"
                    >
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      id="campaignName"
                      name="campaignName"
                      required
                      maxLength={100}
                      placeholder="Untitled Campaign"
                      className="mt-1 block w-full focus:border-b focus:border-khaki-200 focus:outline-none md:text-lg lg:text-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Set Campaign goal */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 0
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                } bg-[url('/campaign-goal.png')] bg-contain`}
                style={{
                  backgroundPosition: "right, bottom",
                  backgroundRepeat: "no-repeat",
                }}
                onClick={() => setProgressTab(0)}
              >
                <div className="flex gap-3 items-center">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-36 border border-peru-200" />
                    </div>
                    <div>
                      <label
                        htmlFor="campaignGoal"
                        className="block text-sm font-medium text-gray-500"
                      >
                        Set Campaign goal
                      </label>
                      {/* radio group */}
                      <div className="flex flex-col mt-1 gap-3">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="awareness"
                            className="form-radio"
                          />
                          <span className="ml-2">Awareness</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="traffic"
                            className="form-radio"
                          />
                          <span className="ml-2">Traffic</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="conversions"
                            className="form-radio"
                          />
                          <span className="ml-2">Conversions</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="campaignGoal"
                            value="leads"
                            className="form-radio"
                          />
                          <span className="ml-2">Leads</span>
                        </label>
                      </div>
                      <div className="bg-gray-50 p-2 mt-4 w-fit">
                        <ul className="list-disc list-inside">
                          <li>
                            <small className="font-gilroy-bold">
                              Show your ad to as many people as possible to
                              increase brand visibility and reach.
                            </small>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Choose Platform */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 1
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(1)}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-32 border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Choose platform
                      </label>
                      <p className="mt-2 font-gilroy-medium text-gray-500">
                        What platforms are you running this ad on?{" "}
                        <span className="ml-2 hover:underline text-peru-200 cursor-pointer">
                          Connect new account
                        </span>
                      </p>

                      {/* Platform Cards */}
                      <div className="flex mt-4 gap-4">
                        {/* Meta Card */}
                        <label
                          htmlFor="meta"
                          className="inline-flex items-start gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl"
                        >
                          <Checkbox
                            id="meta"
                            defaultChecked
                            className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                          />

                          {/* Meta Logo */}
                          <img
                            src="/logos_meta-icon.png"
                            alt="meta"
                            className="mt-2"
                          />

                          {/* Facebook Account */}
                          <div className="mb-3 border-r pr-2 mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <div className="p-1 bg-gray-600 rounded-full">
                                <Facebook className="w-4 h-4 text-white" />
                              </div>
                              <span>Growdex Limited</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <PluggedIcon fill="#0A883F" />
                              <span className="text-xs text-green-600 font-medium">
                                Connected
                              </span>
                            </div>
                          </div>

                          {/* Instagram Account */}
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <InstagramIcon className="w-4 h-4 text-gray-500" />
                              <span>Growdex_Limited</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                              >
                                <PluggedOutIcon />
                                Connect
                              </button>
                            </div>
                          </div>
                        </label>

                        {/* TikTok Card */}
                        <label
                          htmlFor="tiktok"
                          className="inline-flex items-start gap-2 cursor-pointer group flex-1 mt-2 bg-mintcream-50 p-2 rounded-xl"
                        >
                          <Checkbox
                            id="tiktok"
                            defaultChecked
                            className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                          />

                          <div className="flex gap-2 items-center">
                            {/* TikTok Logo */}
                            <img
                              src="/logos_tiktok-icon.png"
                              alt="tiktok-icon"
                            />

                            {/* TikTok Account */}
                            <div className="flex flex-col gap-2 items-start">
                              <p className="text-sm font-medium text-gray-700">
                                <span>Grow with Growdex</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <PluggedIcon fill="#0A883F" />
                                <span className="text-xs text-green-600 font-medium">
                                  Connected
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target audience */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 2
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(2)}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-full border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Target audience
                      </label>
                      <p className="mt-2 font-gilroy-medium text-gray-500">
                        Select the audience you want to reach{" "}
                        <small className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer">
                          <SparklesIcon className="w-4 h-4" /> optimize with AI
                        </small>
                      </p>

                      {/* Audience reach cards */}
                      <div className="w-full flex flex-col gap-2 mt-4">
                        {/* Meta Card */}
                        <div className="rounded-4xl border p-3 space-y-2">
                          <div>
                            <p className="text-gray-400">Total reach</p>
                            <h4 className="text-xl md:text-2xl">
                              25,000 - 50,000k
                            </h4>
                          </div>
                          <div className="w-full inline-flex items-start justify-between gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl">
                            <div className="flex gap-4">
                              {/* Meta Logo */}
                              <img
                                src="/logos_meta-icon.png"
                                alt="meta"
                                className="mt-2"
                              />

                              {/* Facebook Account */}
                              <div className="mb-3 border-r pr-2 mt-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <div className="p-1 bg-gray-600 rounded-full">
                                    <Facebook className="w-4 h-4 text-white" />
                                  </div>
                                  <span>Growdex Limited</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <PluggedIcon fill="#0A883F" />
                                  <span className="text-xs text-green-600 font-medium">
                                    Connected
                                  </span>
                                </div>
                              </div>

                              {/* Instagram Account */}
                              <div className="mt-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <InstagramIcon className="w-4 h-4 text-gray-500" />
                                  <span>Growdex_Limited</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    type="button"
                                    className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"
                                  >
                                    <PluggedOutIcon />
                                    Connect
                                  </button>
                                </div>
                              </div>
                            </div>
                            <small className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer text-right">
                              <div className="p-1 bg-dimYellow rounded-lg">
                                <Users className="w-4 h-4" />
                              </div>
                              Use saved audience
                              <ChevronDown className="w-4 h-4" />
                            </small>
                          </div>

                          {/* country & age cards */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* country */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Country</p>
                              <div className="border-b inline-flex items-center justify-between w-full pb-2">
                                <p className="text-gray-400">Nigeria</p>
                                <p className="text-peru-200">Change country</p>
                              </div>
                              <div className="mt-2">
                                <InputGroup className="bg-white">
                                  <InputGroupInput placeholder="Search for city or state" />
                                  <InputGroupAddon>
                                    <Search />
                                  </InputGroupAddon>
                                </InputGroup>
                                {/* city/state tags */}
                                <div className="mt-2 flex gap-2">
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Makurdi
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Abuja
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Lagos
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Kano
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* age */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Age</p>
                              <p className="text-gray-400">
                                Set the audience age
                              </p>
                              <div className="mt-2 flex flex-col gap-2">
                                <label
                                  htmlFor="age1"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age1"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">18-25</span>
                                </label>
                                <label
                                  htmlFor="age2"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age2"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">25-30</span>
                                </label>
                                <label
                                  htmlFor="age3"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age3"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">30-65</span>
                                </label>
                                <label
                                  htmlFor="age4"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age4"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">65-80</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* category card */}
                          <div className="p-2 bg-gray-50 rounded-xl">
                            <p>Core Interest Categories</p>
                            <p className="text-gray-400">
                              Broad and sub-interests inferred from user
                              activity and profile data.
                            </p>
                            <hr className="my-4" />
                            <div>
                              <InputGroup className="bg-white">
                                <InputGroupInput placeholder="Search for category" />
                                <InputGroupAddon>
                                  <Search />
                                </InputGroupAddon>
                              </InputGroup>
                              {/* city/state tags */}
                              <div className="mt-2 flex gap-2">
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Marketing
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Management
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Education
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Health
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black">
                            Save audience
                          </Button>
                        </div>

                        {/* Tiktok Card */}
                        <div className="rounded-4xl border p-3 space-y-2">
                          <div className="w-full inline-flex items-start justify-between gap-2 cursor-pointer group bg-mintcream-50 p-2 rounded-xl">
                            <div className="flex gap-2 items-center">
                              {/* TikTok Logo */}
                              <img
                                src="/logos_tiktok-icon.png"
                                alt="tiktok-icon"
                              />

                              {/* TikTok Account */}
                              <div className="flex flex-col gap-2 items-start">
                                <p className="text-sm font-medium text-gray-700">
                                  <span>Grow with Growdex</span>
                                </p>
                                <div className="flex items-center gap-2">
                                  <PluggedIcon fill="#0A883F" />
                                  <span className="text-xs text-green-600 font-medium">
                                    Connected
                                  </span>
                                </div>
                              </div>
                            </div>
                            <small className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer">
                              <div className="p-1 bg-dimYellow rounded-lg">
                                <Users className="w-4 h-4" />
                              </div>
                              Use saved audience
                              <ChevronDown className="w-4 h-4" />
                            </small>
                          </div>

                          {/* country & age cards */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* country */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Country</p>
                              <div className="border-b inline-flex items-center justify-between w-full pb-2">
                                <p className="text-gray-400">Nigeria</p>
                                <p className="text-peru-200">Change country</p>
                              </div>
                              <div className="mt-2">
                                <InputGroup className="bg-white">
                                  <InputGroupInput placeholder="Search for city or state" />
                                  <InputGroupAddon>
                                    <Search />
                                  </InputGroupAddon>
                                </InputGroup>
                                {/* city/state tags */}
                                <div className="mt-2 flex gap-2">
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Makurdi
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Abuja
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Lagos
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                    <p>&times;</p>
                                    <p className="text-xs font-medium text-gray-700">
                                      Kano
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* age */}
                            <div className="p-2 bg-gray-50 h-52 rounded-xl">
                              <p>Age</p>
                              <p className="text-gray-400">
                                Set the audience age
                              </p>
                              <div className="mt-2 flex flex-col gap-2">
                                <label
                                  htmlFor="age1"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age1"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">18-25</span>
                                </label>
                                <label
                                  htmlFor="age2"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age2"
                                    defaultChecked
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">25-30</span>
                                </label>
                                <label
                                  htmlFor="age3"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age3"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">30-65</span>
                                </label>
                                <label
                                  htmlFor="age4"
                                  className="inline-flex items-center"
                                >
                                  <Checkbox
                                    id="age4"
                                    className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                                  />
                                  <span className="ml-2">65-80</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* category card */}
                          <div className="p-2 bg-gray-50 rounded-xl">
                            <p>Core Interest Categories</p>
                            <p className="text-gray-400">
                              Broad and sub-interests inferred from user
                              activity and profile data.
                            </p>
                            <hr className="my-4" />
                            <div>
                              <InputGroup className="bg-white">
                                <InputGroupInput placeholder="Search for category" />
                                <InputGroupAddon>
                                  <Search />
                                </InputGroupAddon>
                              </InputGroup>
                              {/* city/state tags */}
                              <div className="mt-2 flex gap-2">
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Marketing
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Management
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Education
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md">
                                  <p>&times;</p>
                                  <p className="text-xs font-medium text-gray-700">
                                    Health
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black">
                            Save audience
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 3
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(3)}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-32 border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Budget
                      </label>
                      <div className="flex items-center justify-between font-gilroy-medium">
                        <p className="mt-2 text-gray-500">
                          How much do you want to spend?
                        </p>
                        <p className="ml-2 hover:underline text-peru-200 cursor-pointer">
                          Select Budget
                        </p>
                      </div>

                      {/* Platform budgets */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {/* Meta Card */}
                        <label
                          htmlFor="meta"
                          className="inline-flex items-start gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl"
                        >
                          {/* Meta Logo */}
                          <img
                            src="/logos_meta-icon.png"
                            alt="meta"
                            className="mt-2"
                          />

                          {/* Meta Freq */}
                          <div className="mb-3 mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <span>Growdex Limited</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Input />
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Frequency</SelectLabel>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">
                                      Weekly
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                      Monthly
                                    </SelectItem>
                                    <SelectItem value="yearly">
                                      Yearly
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-gray-500">
                              Reach: 25,000 - 70,000
                            </p>
                          </div>
                        </label>
                        <label
                          htmlFor="meta"
                          className="inline-flex items-start gap-2 cursor-pointer group bg-gray-50 p-2 rounded-xl"
                        >
                          {/* Tiktok Logo */}
                          <img
                            src="/logos_tiktok-icon.png"
                            alt="meta"
                            className="mt-2"
                          />

                          {/* Tiktok Freq */}
                          <div className="mb-3 mt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <span>Grow with Growdex</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Input />
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Frequency</SelectLabel>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">
                                      Weekly
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                      Monthly
                                    </SelectItem>
                                    <SelectItem value="yearly">
                                      Yearly
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-gray-500">
                              Reach: 25,000 - 70,000
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Setup Creative */}
              <div
                className={`bg-white rounded-xl p-4 border ${
                  progressTab === 4
                    ? "border-darkkhaki-200"
                    : "border-transparent"
                }`}
                onClick={() => setProgressTab(4)}
              >
                <div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-dimYellow border border-peru-200" />
                      <div className="w-0 h-full border border-peru-200" />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-800 font-gilroy-bold"
                      >
                        Setup Creative
                      </label>

                      {/* Creative cards */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {/* Meta Creative */}
                        <div className="bg-gray-50 rounded-xl p-2 space-y-2">
                          <div className="flex justify-between gap-2 px-2">
                            <div className="flex gap-2">
                              <img
                                src="/logos_meta-icon.png"
                                alt="meta-icon"
                                className="h-11"
                              />
                              <div>
                                <p>Header</p>
                                <p>Subhead</p>
                              </div>
                            </div>
                            <MoreVerticalIcon />
                          </div>
                          <img src="/media-creative.png" alt="media" />
                          <div className="flex justify-end">
                            <Button className="bg-khaki-200 hover:bg-khaki-300 text-black">
                              Add creative
                            </Button>
                          </div>
                        </div>
                        {/* Tiktok Creative */}
                        <div className="bg-gray-50 rounded-xl p-2 space-y-2">
                          <div className="flex justify-between gap-2 px-2">
                            <div className="flex gap-2">
                              <img
                                src="/logos_tiktok-icon.png"
                                alt="tiktok-icon"
                                className="h-11"
                              />
                              <div>
                                <p>Header</p>
                                <p>Subhead</p>
                              </div>
                            </div>
                            <MoreVerticalIcon />
                          </div>
                          <img src="/media-creative.png" alt="media" />
                          <div className="flex justify-end">
                            <Button className="bg-khaki-200 hover:bg-khaki-300 text-black">
                              Add creative
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* create campaign btn */}
              <Button className="w-full bg-khaki-200 hover:bg-khaki-300 text-black text-center cursor-pointer">
                <CircleArrowRight />
                Create campaign
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
