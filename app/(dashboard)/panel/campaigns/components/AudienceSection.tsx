"use client";

import React from "react";
import {
  Facebook,
  Instagram as InstagramIcon,
  Users,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { PluggedIcon, PluggedOutIcon } from "@/components/svg";
import { Audience } from "@/lib/audiences";
import { MetaSpecialAdLocationCode } from "@/lib/meta-special-ad-locations";

interface AudienceSectionProps {
  progressTab: number;
  setProgressTab: (tab: number) => void;
  brandName: string;
  instagramAccountName: string;
  loadingAudiences: boolean;
  savedAudiences: Audience[];
  applyAudienceToForm: (audience: Audience) => void;
  formatCountriesSummary: (codes: MetaSpecialAdLocationCode[]) => string;
  COUNTRY_OPTIONS: Array<{ code: MetaSpecialAdLocationCode; name: string }>;
  metaCountries: MetaSpecialAdLocationCode[];
  tiktokCountries: MetaSpecialAdLocationCode[];
  toggleCountry: (
    platform: "meta" | "tiktok",
    code: MetaSpecialAdLocationCode,
    checked: boolean,
  ) => void;
  metaLocationQuery: string;
  setMetaLocationQuery: (val: string) => void;
  tiktokLocationQuery: string;
  setTiktokLocationQuery: (val: string) => void;
  addLocationTag: (platform: "meta" | "tiktok", value: string) => void;
  metaLocations: string[];
  removeLocationTag: (platform: "meta" | "tiktok", value: string) => void;
  tiktokLocations: string[];
  metaAgeMin: string;
  setMetaAgeMin: (val: string) => void;
  metaAgeMax: string;
  setMetaAgeMax: (val: string) => void;
  metaInterestQuery: string;
  setMetaInterestQuery: (val: string) => void;
  addInterestTag: (platform: "meta" | "tiktok", value: string) => void;
  metaInterests: string[];
  removeInterestTag: (platform: "meta" | "tiktok", value: string) => void;
  tiktokInterestQuery: string;
  setTiktokInterestQuery: (val: string) => void;
  tiktokInterests: string[];
  bothPlatformsConnected: boolean;
  saveAudienceForPlatform: (platform: "meta" | "tiktok") => void;
  saveAudienceCombined: () => void;
  readOnly?: boolean;
}

export const AudienceSection = ({
  progressTab,
  setProgressTab,
  brandName,
  instagramAccountName,
  loadingAudiences,
  savedAudiences,
  applyAudienceToForm,
  formatCountriesSummary,
  COUNTRY_OPTIONS,
  metaCountries,
  tiktokCountries,
  toggleCountry,
  metaLocationQuery,
  setMetaLocationQuery,
  tiktokLocationQuery,
  setTiktokLocationQuery,
  addLocationTag,
  metaLocations,
  removeLocationTag,
  tiktokLocations,
  metaAgeMin,
  setMetaAgeMin,
  metaAgeMax,
  setMetaAgeMax,
  metaInterestQuery,
  setMetaInterestQuery,
  addInterestTag,
  metaInterests,
  removeInterestTag,
  tiktokInterestQuery,
  setTiktokInterestQuery,
  tiktokInterests,
  bothPlatformsConnected,
  saveAudienceForPlatform,
  saveAudienceCombined,
  readOnly = false,
}: AudienceSectionProps) => {
  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        progressTab === 2 ? "border-darkkhaki-200" : "border-transparent"
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
            </p>

            {/* Audience reach cards */}
            <div className="w-full flex flex-col gap-2 mt-4">
              {/* Meta Card */}
              <div className="rounded-4xl border p-3 space-y-2">
                <div>
                  <p className="text-gray-400">Total reach</p>
                  <h4 className="text-xl md:text-2xl">25,000 - 50,000k</h4>
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
                        <span>{brandName}</span>
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
                        <span>{instagramAccountName}</span>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer text-right"
                      >
                        <div className="p-1 bg-dimYellow rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>
                        Use saved audience
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {loadingAudiences ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          Loading...
                        </div>
                      ) : savedAudiences.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          No saved audiences
                        </div>
                      ) : (
                        <>
                          <DropdownMenuLabel>Saved Audiences</DropdownMenuLabel>
                          {savedAudiences.map((audience) => (
                            <DropdownMenuCheckboxItem
                              key={audience.id}
                              onClick={() => applyAudienceToForm(audience)}
                              checked={false}
                            >
                              {audience.name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* country & age cards */}
                <div className="grid grid-cols-2 gap-2">
                  {/* country */}
                  <div className="p-2 bg-gray-50 h-52 rounded-xl">
                    <p>Country</p>
                    <div className="border-b inline-flex items-center justify-between w-full pb-2 gap-2">
                      <div className="flex-1">
                        <p className="text-gray-400">
                          {formatCountriesSummary(metaCountries)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="text-peru-200">
                            Change country
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72 max-h-72">
                          <DropdownMenuLabel>
                            Countries (Multiple choice)
                          </DropdownMenuLabel>
                          {COUNTRY_OPTIONS.map(({ code, name }) => (
                            <DropdownMenuCheckboxItem
                              key={code}
                              checked={metaCountries.includes(code)}
                              onCheckedChange={(checked) =>
                                toggleCountry("meta", code, Boolean(checked))
                              }
                            >
                              {name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2">
                      <InputGroup className="bg-white">
                        <InputGroupInput
                          placeholder="Search for city or state"
                          value={metaLocationQuery}
                          onChange={(e) => setMetaLocationQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addLocationTag("meta", metaLocationQuery);
                            }
                          }}
                        />
                        <InputGroupAddon>
                          <Search />
                        </InputGroupAddon>
                      </InputGroup>
                      {/* city/state tags */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {metaLocations.map((location) => (
                          <div
                            key={location}
                            className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                          >
                            <button
                              type="button"
                              className="text-xs font-medium text-gray-700"
                              aria-label={`Remove ${location}`}
                              onClick={() =>
                                removeLocationTag("meta", location)
                              }
                            >
                              &times;
                            </button>
                            <p className="text-xs font-medium text-gray-700">
                              {location}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* age */}
                  <div className="p-2 bg-gray-50 h-52 rounded-xl">
                    <p>Age</p>
                    <p className="text-gray-400">Set the audience age</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-700">Min Age</label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={13}
                          max={80}
                          value={metaAgeMin}
                          onChange={(e) => setMetaAgeMin(e.target.value)}
                          placeholder="18"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700">Max Age</label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={13}
                          max={80}
                          value={metaAgeMax}
                          onChange={(e) => setMetaAgeMax(e.target.value)}
                          placeholder="65"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* category card */}
                <div className="p-2 bg-gray-50 rounded-xl">
                  <p>Core Interest Categories</p>
                  <p className="text-gray-400">
                    Broad and sub-interests inferred from user activity and
                    profile data.
                  </p>
                  <hr className="my-4" />
                  <div>
                    <InputGroup className="bg-white">
                      <InputGroupInput
                        placeholder="Search for category"
                        value={metaInterestQuery}
                        onChange={(e) => setMetaInterestQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterestTag("meta", metaInterestQuery);
                          }
                        }}
                      />
                      <InputGroupAddon>
                        <Search />
                      </InputGroupAddon>
                    </InputGroup>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {metaInterests.map((interest) => (
                        <div
                          key={interest}
                          className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                        >
                          <button
                            type="button"
                            className="text-xs font-medium text-gray-700"
                            aria-label={`Remove ${interest}`}
                            onClick={() => removeInterestTag("meta", interest)}
                          >
                            &times;
                          </button>
                          <p className="text-xs font-medium text-gray-700">
                            {interest}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {!bothPlatformsConnected && (
                  <Button
                    type="button"
                    className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={() => saveAudienceForPlatform("meta")}
                  >
                    Save audience
                  </Button>
                )}
              </div>

              {/* Tiktok Card */}
              <div className="rounded-4xl border p-3 space-y-2">
                <div className="w-full inline-flex items-start justify-between gap-2 cursor-pointer group bg-mintcream-50 p-2 rounded-xl">
                  <div className="flex gap-2 items-center">
                    {/* TikTok Logo */}
                    <img src="/logos_tiktok-icon.png" alt="tiktok-icon" />

                    {/* TikTok Account */}
                    <div className="flex flex-col gap-2 items-start">
                      <p className="text-sm font-medium text-gray-700">
                        <span>{brandName}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <PluggedIcon fill="#0A883F" />
                        <span className="text-xs text-green-600 font-medium">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex gap-1 items-center ml-2 hover:underline text-peru-200 cursor-pointer"
                      >
                        <div className="p-1 bg-dimYellow rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>
                        Use saved audience
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {loadingAudiences ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          Loading...
                        </div>
                      ) : savedAudiences.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          No saved audiences
                        </div>
                      ) : (
                        <>
                          <DropdownMenuLabel>Saved Audiences</DropdownMenuLabel>
                          {savedAudiences.map((audience) => (
                            <DropdownMenuCheckboxItem
                              key={audience.id}
                              onClick={() => applyAudienceToForm(audience)}
                              checked={false}
                            >
                              {audience.name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* country & age cards */}
                <div className="grid grid-cols-2 gap-2">
                  {/* country */}
                  <div className="p-2 bg-gray-50 h-52 rounded-xl">
                    <p>Country</p>
                    <div className="border-b inline-flex items-center justify-between w-full pb-2 gap-2">
                      <div className="flex-1">
                        <p className="text-gray-400">
                          {formatCountriesSummary(tiktokCountries)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="text-peru-200">
                            Change country
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-72 max-h-72">
                          <DropdownMenuLabel>Countries</DropdownMenuLabel>
                          {COUNTRY_OPTIONS.map(({ code, name }) => (
                            <DropdownMenuCheckboxItem
                              key={code}
                              checked={tiktokCountries.includes(code)}
                              onCheckedChange={(checked) =>
                                toggleCountry("tiktok", code, Boolean(checked))
                              }
                            >
                              {name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2">
                      <InputGroup className="bg-white">
                        <InputGroupInput
                          placeholder="Search for city or state"
                          value={tiktokLocationQuery}
                          onChange={(e) =>
                            setTiktokLocationQuery(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addLocationTag("tiktok", tiktokLocationQuery);
                            }
                          }}
                        />
                        <InputGroupAddon>
                          <Search />
                        </InputGroupAddon>
                      </InputGroup>
                      {/* city/state tags */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {tiktokLocations.map((location) => (
                          <div
                            key={location}
                            className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                          >
                            <button
                              type="button"
                              className="text-xs font-medium text-gray-700"
                              aria-label={`Remove ${location}`}
                              onClick={() =>
                                removeLocationTag("tiktok", location)
                              }
                            >
                              &times;
                            </button>
                            <p className="text-xs font-medium text-gray-700">
                              {location}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* age */}
                  <div className="p-2 bg-gray-50 h-52 rounded-xl">
                    <p>Age</p>
                    <p className="text-gray-400">Set the audience age</p>
                    <div className="mt-2 flex flex-col gap-2">
                      <label
                        htmlFor="tiktok-age1"
                        className="inline-flex items-center"
                      >
                        <Checkbox
                          id="tiktok-age1"
                          defaultChecked
                          className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                        />
                        <span className="ml-2">18-25</span>
                      </label>
                      <label
                        htmlFor="tiktok-age2"
                        className="inline-flex items-center"
                      >
                        <Checkbox
                          id="tiktok-age2"
                          defaultChecked
                          className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                        />
                        <span className="ml-2">25-30</span>
                      </label>
                      <label
                        htmlFor="tiktok-age3"
                        className="inline-flex items-center"
                      >
                        <Checkbox
                          id="tiktok-age3"
                          className="data-[state=checked]:bg-darkkhaki-200 data-[state=checked]:text-white data-[state=checked]:border-darkkhaki-200"
                        />
                        <span className="ml-2">30-65</span>
                      </label>
                      <label
                        htmlFor="tiktok-age4"
                        className="inline-flex items-center"
                      >
                        <Checkbox
                          id="tiktok-age4"
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
                    Broad and sub-interests inferred from user activity and
                    profile data.
                  </p>
                  <hr className="my-4" />
                  <div>
                    <InputGroup className="bg-white">
                      <InputGroupInput
                        placeholder="Search for category"
                        value={tiktokInterestQuery}
                        onChange={(e) => setTiktokInterestQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterestTag("tiktok", tiktokInterestQuery);
                          }
                        }}
                      />
                      <InputGroupAddon>
                        <Search />
                      </InputGroupAddon>
                    </InputGroup>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {tiktokInterests.map((interest) => (
                        <div
                          key={interest}
                          className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                        >
                          <button
                            type="button"
                            className="text-xs font-medium text-gray-700"
                            aria-label={`Remove ${interest}`}
                            onClick={() =>
                              removeInterestTag("tiktok", interest)
                            }
                          >
                            &times;
                          </button>
                          <p className="text-xs font-medium text-gray-700">
                            {interest}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {!bothPlatformsConnected && (
                  <Button
                    type="button"
                    className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={() => saveAudienceForPlatform("tiktok")}
                  >
                    Save audience
                  </Button>
                )}
              </div>

              {/* General Save button */}
              {bothPlatformsConnected && (
                <div className="mt-4">
                  <Button
                    type="button"
                    className="bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={saveAudienceCombined}
                  >
                    Save audience
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
