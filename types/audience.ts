import { Audience } from "@/lib/audiences";
import { MetaSpecialAdLocationCode } from "@/lib/meta-special-ad-locations";
import React from "react";

export interface AudienceSectionProps {
  progressTab: number;
  setProgressTab: (tab: number) => void;
  brandName: string;
  instagramAccountName: string;
  selectedPlatforms: { [key: string]: boolean };
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
  lowerReach: number;
  upperReach: number;
  setLowerReach: React.Dispatch<React.SetStateAction<number>>;
  setUpperReach: React.Dispatch<React.SetStateAction<number>>;
}
