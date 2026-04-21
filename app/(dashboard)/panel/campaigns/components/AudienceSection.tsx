"use client";

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
import { AudienceSectionProps } from "@/types/audience";
import { FC, useState, useEffect } from "react";
import { apiFetch } from "@/lib/auth";


export const AudienceSection: FC<AudienceSectionProps> = (props) => {
  // Meta Interests Auto-complete state
  const [interestResults, setInterestResults] = useState<
    { id: string; name: string; audience_size_lower_bound: number; audience_size_upper_bound: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce Meta API interest search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (props.metaInterestQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await apiFetch(
            `/campaigns/meta-interests/search?q=${encodeURIComponent(
              props.metaInterestQuery
            )}`
          );
          const json = await res.json();
          if (json.success && json.data) {
            setInterestResults(json.data);
          }
        } catch (e) {
          console.error("Failed to search interests", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setInterestResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [props.metaInterestQuery]);

  const handleAddInterest = (interest: { id: string; name: string; audience_size_lower_bound: number; audience_size_upper_bound: number }) => {
    props.addInterestTag("meta", interest.name);
    props.setLowerReach((prev) => prev + interest.audience_size_lower_bound);
    props.setUpperReach((prev) => prev + interest.audience_size_upper_bound);
    props.setMetaInterestQuery("");
    setInterestResults([]);
  };

  // Meta Location Auto-complete state
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Debounce Meta API location search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (props.metaLocationQuery.trim().length >= 2) {
        setIsSearchingLocation(true);
        try {
          const res = await apiFetch(
            `/campaigns/meta-locations/search?q=${encodeURIComponent(
              props.metaLocationQuery
            )}`
          );
          const json = await res.json();
          if (json.success && json.data) {
            setLocationResults(json.data);
          }
        } catch (e) {
          console.error("Failed to search locations", e);
        } finally {
          setIsSearchingLocation(false);
        }
      } else {
        setLocationResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [props.metaLocationQuery]);

  const handleAddLocation = (location: { key: string; name: string; type: string; country_code: string; audience_size_lower_bound?: number; audience_size_upper_bound?: number }) => {
    props.addLocationTag("meta", location.name);
    if (location.audience_size_lower_bound) props.setLowerReach((prev) => prev + location.audience_size_lower_bound!);
    if (location.audience_size_upper_bound) props.setUpperReach((prev) => prev + location.audience_size_upper_bound!);
    props.setMetaLocationQuery("");
    setLocationResults([]);
  };

  // TikTok Interests Auto-complete state
  const [tiktokInterestResults, setTiktokInterestResults] = useState<
    { id: string; name: string; audience_size?: number }[]
  >([]);
  const [isSearchingTiktokInterest, setIsSearchingTiktokInterest] = useState(false);

  // Debounce TikTok API interest search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (props.tiktokInterestQuery.trim().length >= 2) {
        setIsSearchingTiktokInterest(true);
        try {
          const res = await apiFetch(
            `/campaigns/tiktok-interests/search?q=${encodeURIComponent(
              props.tiktokInterestQuery
            )}`
          );
          const json = await res.json();
          if (json.success && json.data) {
            setTiktokInterestResults(json.data);
          }
        } catch (e) {
          console.error("Failed to search tiktok interests", e);
        } finally {
          setIsSearchingTiktokInterest(false);
        }
      } else {
        setTiktokInterestResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [props.tiktokInterestQuery]);

  const handleAddTiktokInterest = (interest: { id: string; name: string; audience_size?: number }) => {
    props.addInterestTag("tiktok", interest.name);
    // TikTok might not provide exact reach bounds in same format, adapt as needed
    if (interest.audience_size) {
      props.setLowerReach((prev) => prev + interest.audience_size!);
      props.setUpperReach((prev) => prev + interest.audience_size!);
    }
    props.setTiktokInterestQuery("");
    setTiktokInterestResults([]);
  };

  // TikTok Location Auto-complete state
  const [tiktokLocationResults, setTiktokLocationResults] = useState<any[]>([]);
  const [isSearchingTiktokLocation, setIsSearchingTiktokLocation] = useState(false);

  // Debounce TikTok API location search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (props.tiktokLocationQuery.trim().length >= 2) {
        setIsSearchingTiktokLocation(true);
        try {
          const res = await apiFetch(
            `/campaigns/tiktok-locations/search?q=${encodeURIComponent(
              props.tiktokLocationQuery
            )}`
          );
          const json = await res.json();
          if (json.success && json.data) {
            setTiktokLocationResults(json.data);
          }
        } catch (e) {
          console.error("Failed to search tiktok locations", e);
        } finally {
          setIsSearchingTiktokLocation(false);
        }
      } else {
        setTiktokLocationResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [props.tiktokLocationQuery]);

  const handleAddTiktokLocation = (location: { id: string; name: string; type?: string; country_code?: string; audience_size?: number }) => {
    props.addLocationTag("tiktok", location.name);
     if (location.audience_size) {
      props.setLowerReach((prev) => prev + location.audience_size!);
      props.setUpperReach((prev) => prev + location.audience_size!);
    }
    props.setTiktokLocationQuery("");
    setTiktokLocationResults([]);
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        props.progressTab === 2 ? "border-darkkhaki-200" : "border-transparent"
      }`}
      onClick={() => props.setProgressTab(2)}
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
              {props.selectedPlatforms.meta &&
               <div className="rounded-4xl border p-3 space-y-2">
                <div>
                  <p className="text-gray-400">Total reach</p>
                  <h4 className="text-xl md:text-2xl">{props.lowerReach} - {props.upperReach}</h4>
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
                        <span>{props.brandName}</span>
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
                        <span>{props.instagramAccountName}</span>
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
                      {props.loadingAudiences ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          Loading...
                        </div>
                      ) : props.savedAudiences.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          No saved audiences
                        </div>
                      ) : (
                        <>
                          <DropdownMenuLabel>Saved Audiences</DropdownMenuLabel>
                          {props.savedAudiences.map((audience) => (
                            <DropdownMenuCheckboxItem
                              key={audience.id}
                              onClick={() => props.applyAudienceToForm(audience)}
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
                          {props.formatCountriesSummary(props.metaCountries)}
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
                          {props.COUNTRY_OPTIONS.map(({ code, name }) => (
                            <DropdownMenuCheckboxItem
                              key={code}
                              checked={props.metaCountries.includes(code)}
                              onCheckedChange={(checked) =>
                                props.toggleCountry("meta", code, Boolean(checked))
                              }
                            >
                              {name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2 relative">
                      <InputGroup className="bg-white">
                        <InputGroupInput
                          placeholder="Search for city or state"
                          value={props.metaLocationQuery}
                          onChange={(e) =>
                            props.setMetaLocationQuery(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (locationResults.length > 0) {
                                handleAddLocation(locationResults[0]);
                              } else {
                                props.addLocationTag(
                                  "meta",
                                  props.metaLocationQuery
                                );
                              }
                            }
                          }}
                        />
                        <InputGroupAddon>
                          {isSearchingLocation ? (
                            <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                          ) : (
                            <Search />
                          )}
                        </InputGroupAddon>
                      </InputGroup>

                      {locationResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {locationResults.map((result) => (
                            <button
                              key={result.key || result.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center"
                              onClick={() => handleAddLocation(result)}
                            >
                              <span>{result.name}</span>
                              <span className="text-xs text-gray-400">
                                {result.type} ({result.country_code})
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* city/state tags */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {props.metaLocations.map((location) => (
                          <div
                            key={location}
                            className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                          >
                            <button
                              type="button"
                              className="text-xs font-medium text-gray-700"
                              aria-label={`Remove ${location}`}
                              onClick={() =>
                                props.removeLocationTag("meta", location)
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
                          value={props.metaAgeMin}
                          onChange={(e) => props.setMetaAgeMin(e.target.value)}
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
                          value={props.metaAgeMax}
                          onChange={(e) => props.setMetaAgeMax(e.target.value)}
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
                  <div className="relative">
                    <InputGroup className="bg-white">
                      <InputGroupInput
                        placeholder="Search interests (e.g., Football, Technology)..."
                        value={props.metaInterestQuery}
                        onChange={(e) =>
                          props.setMetaInterestQuery(e.target.value)
                        }
                      />
                      <InputGroupAddon>
                        {isSearching ? (
                          <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                        ) : (
                          <Search />
                        )}
                      </InputGroupAddon>
                    </InputGroup>

                    {interestResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {interestResults.map((result) => (
                          <button
                            key={result.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center"
                            onClick={() => handleAddInterest(result)}
                          >
                            <span>{result.name}</span>
                            <span className="text-xs text-gray-400">
                              ID: {result.id}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex gap-2 flex-wrap">
                      {props.metaInterests.map((interest) => (
                        <div
                          key={interest}
                          className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                        >
                          <button
                            type="button"
                            className="text-xs font-medium text-gray-700"
                            aria-label={`Remove ${interest}`}
                            onClick={() => props.removeInterestTag("meta", interest)}
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
                {!props.bothPlatformsConnected && (
                  <Button
                    type="button"
                    className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={() => props.saveAudienceForPlatform("meta")}
                  >
                    Save audience
                  </Button>
                )}
              </div>}

              {/* Tiktok Card */}
              {props.selectedPlatforms.tiktok &&
              <div className="rounded-4xl border p-3 space-y-2">
                <div className="w-full inline-flex items-start justify-between gap-2 cursor-pointer group bg-mintcream-50 p-2 rounded-xl">
                  <div className="flex gap-2 items-center">
                    {/* TikTok Logo */}
                    <img src="/logos_tiktok-icon.png" alt="tiktok-icon" />

                    {/* TikTok Account */}
                    <div className="flex flex-col gap-2 items-start">
                      <p className="text-sm font-medium text-gray-700">
                        <span>{props.brandName}</span>
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
                      {props.loadingAudiences ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          Loading...
                        </div>
                      ) : props.savedAudiences.length === 0 ? (
                        <div className="px-2 py-1 text-xs text-gray-500">
                          No saved audiences
                        </div>
                      ) : (
                        <>
                          <DropdownMenuLabel>Saved Audiences</DropdownMenuLabel>
                          {props.savedAudiences.map((audience) => (
                            <DropdownMenuCheckboxItem
                              key={audience.id}
                              onClick={() => props.applyAudienceToForm(audience)}
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
                          {props.formatCountriesSummary(props.tiktokCountries)}
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
                          {props.COUNTRY_OPTIONS.map(({ code, name }) => (
                            <DropdownMenuCheckboxItem
                              key={code}
                              checked={props.tiktokCountries.includes(code)}
                              onCheckedChange={(checked) =>
                                props.toggleCountry("tiktok", code, Boolean(checked))
                              }
                            >
                              {name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2 relative">
                      <InputGroup className="bg-white">
                        <InputGroupInput
                          placeholder="Search for city or state"
                          value={props.tiktokLocationQuery}
                          onChange={(e) =>
                            props.setTiktokLocationQuery(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (tiktokLocationResults.length > 0) {
                                handleAddTiktokLocation(tiktokLocationResults[0]);
                              } else {
                                props.addLocationTag(
                                  "tiktok",
                                  props.tiktokLocationQuery
                                );
                              }
                            }
                          }}
                        />
                        <InputGroupAddon>
                         {isSearchingTiktokLocation ? (
                            <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                          ) : (
                            <Search />
                          )}
                        </InputGroupAddon>
                      </InputGroup>

                      {tiktokLocationResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {tiktokLocationResults.map((result) => (
                            <button
                              key={result.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center"
                              onClick={() => handleAddTiktokLocation(result)}
                            >
                              <span>{result.name}</span>
                              <span className="text-xs text-gray-400">
                                {result.type} ({result.country_code})
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* city/state tags */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {props.tiktokLocations.map((location) => (
                          <div
                            key={location}
                            className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                          >
                            <button
                              type="button"
                              className="text-xs font-medium text-gray-700"
                              aria-label={`Remove ${location}`}
                              onClick={() =>
                                props.removeLocationTag("tiktok", location)
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
                  <div className="relative">
                    <InputGroup className="bg-white">
                      <InputGroupInput
                        placeholder="Search for category"
                        value={props.tiktokInterestQuery}
                        onChange={(e) =>
                          props.setTiktokInterestQuery(e.target.value)
                        }
                      />
                      <InputGroupAddon>
                        {isSearchingTiktokInterest ? (
                          <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                        ) : (
                          <Search />
                        )}
                      </InputGroupAddon>
                    </InputGroup>

                    {tiktokInterestResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {tiktokInterestResults.map((result) => (
                          <button
                            key={result.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex justify-between items-center"
                            onClick={() => handleAddTiktokInterest(result)}
                          >
                            <span>{result.name}</span>
                            <span className="text-xs text-gray-400">
                              ID: {result.id}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex gap-2 flex-wrap">
                      {props.tiktokInterests.map((interest) => (
                        <div
                          key={interest}
                          className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-md"
                        >
                          <button
                            type="button"
                            className="text-xs font-medium text-gray-700"
                            aria-label={`Remove ${interest}`}
                            onClick={() =>
                              props.removeInterestTag("tiktok", interest)
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
                {!props.bothPlatformsConnected && (
                  <Button
                    type="button"
                    className="mt-2 bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={() => props.saveAudienceForPlatform("tiktok")}
                  >
                    Save audience
                  </Button>
                )}
              </div>}

              {/* General Save button */}
              {props.bothPlatformsConnected && (
                <div className="mt-4">
                  <Button
                    type="button"
                    className="bg-khaki-200 hover:bg-khaki-300 text-black"
                    onClick={props.saveAudienceCombined}
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
