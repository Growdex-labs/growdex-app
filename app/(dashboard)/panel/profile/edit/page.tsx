"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { DashboardHeader } from "../../components/dashboard-header";
import { Camera, Upload, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepositIcon } from "@/components/svg";
import Link from "next/link";
import { useMe } from "@/context/me-context";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  brandName: string;
  twitterLink: string;
  facebookLink: string;
  googleLink: string;
  instagramLink: string;
  businessAddress: string;
  password?: string;
}

export default function EditProfilePage(): JSX.Element {
  const { me } = useMe();
  const [profileImage, setProfileImage] = useState<string>("/profile.png");
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    brandName: "",
    twitterLink: "",
    facebookLink: "",
    googleLink: "",
    instagramLink: "",
    businessAddress: "",
    password: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!me) return;
    if (initializedRef.current) return;

    setFormData((prev) => ({
      ...prev,
      firstName: me.profile?.firstName ?? "",
      lastName: me.profile?.lastName ?? "",
      email: me.email ?? "",
      phoneNumber: me.profile?.phone ?? "",
      country: me.profile?.country ?? "",
      brandName: me.brand?.name ?? "",
      twitterLink: me.brand?.twitterUrl ?? "",
      facebookLink: me.brand?.facebookUrl ?? "",
      googleLink: me.brand?.googleUrl ?? "",
      instagramLink: me.brand?.instagramUrl ?? "",
      businessAddress: me.brand?.businessAddress ?? "",
    }));

    initializedRef.current = true;
  }, [me]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    setProfileImage("/avatar-placeholder.png");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    console.log("Saving profile changes:", formData);
    // Add save logic here
  };

  return (
    <PanelLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4 md:p-6">
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header Section */}
            <div className="px-4 md:px-6 py-6 md:py-8">
              <div className="flex flex-col  md:items-start md:justify-between gap-6">
                {/* Title */}
                <div className="flex items-center mt-4">
                  <Link
                    href="/panel/profile"
                    className="text-xl font-semibold text-gray-600"
                  >
                    My Profile
                  </Link>
                  <span className="mx-2">&gt;</span>
                  <span className="text-xl font-bold text-gray-900">
                    Edit Profile
                  </span>
                </div>

                {/* Profile Picture Section */}
                <div className="flex items-center sm:items-end gap-2 sm:gap-6">
                  <div className="relative">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="absolute -bottom-2 -right-4 flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-yellow-300 hover:bg-yellow-400 rounded-full transition-colors"
                        title="Upload photo"
                      >
                        <Camera className="w-4 h-4 text-gray-900" />
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2 mt-10 sm:mt-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Upload New
                    </button>
                    <button
                      onClick={handleImageDelete}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap mr-2"
                    >
                      Delete Image
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-4 md:px-6 py-6 md:py-8 mt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Personal Information Section */}
                <div className="bg-slate-100 p-4 rounded-lg">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      />
                      <p className="text-xs text-khaki-300 absolute right-3 top-11 cursor-pointer">
                        change password
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select className="w-20 px-2 md:px-3 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300">
                          <option>+234</option>
                          <option>+1</option>
                          <option>+44</option>
                        </select>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            country: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="United States">
                            United States
                          </SelectItem>
                          <SelectItem value="United Kingdom">
                            United Kingdom
                          </SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Brand Information Section */}
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
                    Brand Information
                  </h2>
                  <div className="space-y-4">
                    {/* Brand Name */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        name="brandName"
                        value={formData.brandName}
                        onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Emails from here
                      </p>
                    </div>

                    {/* Social Links Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Twitter Link
                        </label>
                        <input
                          type="url"
                          name="twitterLink"
                          value={formData.twitterLink}
                          onChange={handleInputChange}
                          placeholder="Emails fields"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Facebook Link
                        </label>
                        <input
                          type="url"
                          name="facebookLink"
                          value={formData.facebookLink}
                          onChange={handleInputChange}
                          placeholder="Emails fields"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Google Link
                        </label>
                        <input
                          type="url"
                          name="googleLink"
                          value={formData.googleLink}
                          onChange={handleInputChange}
                          placeholder="Emails fields"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Instagram Link
                        </label>
                        <input
                          type="url"
                          name="instagramLink"
                          value={formData.instagramLink}
                          onChange={handleInputChange}
                          placeholder="Emails fields"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                    </div>

                    {/* Business Address */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Business Address
                      </label>
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Emails fields
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveChanges}
                  className="w-full px-6 py-3 md:py-3.5 bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors text-sm md:text-base flex items-center justify-center gap-2"
                >
                  <DepositIcon />
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
