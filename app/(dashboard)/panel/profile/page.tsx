"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { PanelLayout } from "../components/panel-layout";
import { DashboardHeader } from "../components/dashboard-header";
import { Camera, Upload, X, Edit2, Loader2 } from "lucide-react";
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
import { apiFetch, updateCurrentUser, updateUserAvatar } from "@/lib/auth";
import { hashFolderName } from "@/lib/encrypt";
import { CLOUDINARY_FOLDER } from "@/lib/constants";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  brandName: string;
  brandSize: string;
  twitterLink: string;
  facebookLink: string;
  googleLink: string;
  instagramLink: string;
  businessAddress: string;
  password?: string;
}

export default function MyProfilePage(): JSX.Element {
  const router = useRouter();
  const { me, refresh } = useMe();
  const [profileImage, setProfileImage] = useState<string>("/profile.png");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    brandName: "",
    brandSize: "",
    twitterLink: "",
    facebookLink: "",
    googleLink: "",
    instagramLink: "",
    businessAddress: "",
    password: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;

    // Only populate if we haven't initialized or if we want to ensure data is fresh
    // For now, respect the original edit logic but ensure it runs at least once
    if (!initializedRef.current) {
        setFormData({
            firstName: me.profile?.firstName ?? "",
            lastName: me.profile?.lastName ?? "",
            email: me.email ?? "",
            phoneNumber: me.profile?.phone ?? "",
            country: me.profile?.country ?? "",
            brandName: me.brand?.name ?? "",
            brandSize: me.brand?.size ? String(me.brand.size) : "",
            twitterLink: me.brand?.twitterUrl ?? "",
            facebookLink: me.brand?.facebookUrl ?? "",
            googleLink: me.brand?.googleUrl ?? "",
            instagramLink: me.brand?.instagramUrl ?? "",
            businessAddress: me.brand?.businessAddress ?? "",
        });
        initializedRef.current = true;
    }
    // Set avatar from backend if available
    if (me.avatarUrl) {
      setProfileImage(me.avatarUrl);
    }
  }, [me]);

  const toggleEdit = () => {
      // If cancelling, revert to 'me' data (optional, but good UX)
      if (isEditing && me) {
        setFormData({
            firstName: me.profile?.firstName ?? "",
            lastName: me.profile?.lastName ?? "",
            email: me.email ?? "",
            phoneNumber: me.profile?.phone ?? "",
            country: me.profile?.country ?? "",
            brandName: me.brand?.name ?? "",
            brandSize: me.brand?.size ? String(me.brand.size) : "",
            twitterLink: me.brand?.twitterUrl ?? "",
            facebookLink: me.brand?.facebookUrl ?? "",
            googleLink: me.brand?.googleUrl ?? "",
            instagramLink: me.brand?.instagramUrl ?? "",
            businessAddress: me.brand?.businessAddress ?? "",
          });
        // Revert avatar preview
        setProfileImage(me.avatarUrl ?? "/profile.png");
      }
      setIsEditing(!isEditing);
      setAvatarError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setAvatarError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setProfileImage(localPreview);
    setAvatarError(null);

    try {
      setIsUploadingAvatar(true);
      setAvatarUploadProgress(0);

      // Build a unique public_id
      const encryptedFolder = await hashFolderName();
      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const publicId = `${encryptedFolder.slice(0, 20)}/avatar_${safeName}_${Date.now()}`;

      // Get signature stamp from backend
      const signRes = await apiFetch("/media/signature-stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: publicId,
          folder: CLOUDINARY_FOLDER,
        }),
      });

      if (!signRes.ok) {
        const errText = await signRes.text().catch(() => "");
        throw new Error(`Failed to get upload signature (${signRes.status}): ${errText}`);
      }

      const signPayload = await signRes.json();
      const { signature, timestamp, api_key } = signPayload;
      const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", String(signature));
      formData.append("public_id", publicId);
      formData.append("folder", CLOUDINARY_FOLDER);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

      const uploadResult: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setAvatarUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch (err) { reject(err); }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.send(formData);
      });

      const secureUrl = uploadResult.secure_url;
      const etag = uploadResult.etag ?? "";

      // Persist to backend
      await updateUserAvatar(secureUrl, etag);

      // Refresh context so sidebar/header pick up the new avatar
      await refresh();

      setProfileImage(secureUrl);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setAvatarError(err instanceof Error ? err.message : "Failed to upload avatar");
      // Revert preview on error
      setProfileImage(me?.avatarUrl ?? "/profile.png");
    } finally {
      setIsUploadingAvatar(false);
      setAvatarUploadProgress(0);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageDelete = async () => {
    try {
      setIsUploadingAvatar(true);
      setAvatarError(null);
      await updateUserAvatar("", "");
      await refresh();
      setProfileImage("/profile.png");
    } catch (err) {
      console.error("Avatar delete error:", err);
      setAvatarError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveChanges = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const payload = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phoneNumber,
          country: formData.country,
        },
        brand: {
          name: formData.brandName,
          size: formData.brandSize ? Number(formData.brandSize) : undefined,
          businessAddress: formData.businessAddress,
          instagramUrl: formData.instagramLink,
          facebookUrl: formData.facebookLink,
          googleUrl: formData.googleLink,
          twitterUrl: formData.twitterLink,
        },
      };

      await updateCurrentUser(payload);
      await refresh();
      setSaveSuccess(true);

      // Exit edit mode
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setSaveError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
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
                <div className="flex items-center justify-between w-full mt-4">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-gray-900">
                      My Profile
                    </span>
                  </div>
                  <button
                    onClick={toggleEdit}
                    className={`flex items-center gap-2 px-4 py-2 ${isEditing ? 'bg-gray-200 hover:bg-gray-300' : 'bg-yellow-300 hover:bg-yellow-400'} text-gray-900 font-semibold rounded-lg transition-colors text-sm`}
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                </div>

                {/* Profile Picture Section */}
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center sm:items-end gap-2 sm:gap-6">
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-lg object-cover bg-gray-100"
                      />
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center text-white text-xs font-semibold gap-1">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          {avatarUploadProgress > 0 && <span>{avatarUploadProgress}%</span>}
                        </div>
                      )}
                      {isEditing && !isUploadingAvatar && (
                        <div className="absolute -bottom-2 -right-4 flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-yellow-300 hover:bg-yellow-400 rounded-full transition-colors"
                            title="Upload photo"
                          >
                            <Camera className="w-4 h-4 text-gray-900" />
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={!isEditing || isUploadingAvatar}
                    />
                    {isEditing && (
                      <div className="flex gap-2 mt-10 sm:mt-0">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 disabled:bg-yellow-200 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap"
                        >
                          Upload New
                        </button>
                        <button
                          onClick={handleImageDelete}
                          disabled={isUploadingAvatar}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap mr-2"
                        >
                          Delete Image
                        </button>
                      </div>
                    )}
                  </div>
                  {avatarError && (
                    <div className="text-xs text-red-600 font-medium max-w-md bg-red-50 border border-red-200 rounded p-2 mt-1">
                      {avatarError}
                    </div>
                  )}
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
                          disabled={!isEditing}
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
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
                          disabled={!isEditing}
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
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
                        disabled={!isEditing}
                        placeholder={isEditing ? "Enter new password" : "••••••••"}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      {isEditing && (
                        <p className="text-xs text-khaki-300 absolute right-3 top-11 cursor-pointer">
                            change password
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                            disabled={!isEditing}
                            className="w-20 px-2 md:px-3 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500">
                          <option>+234</option>
                          <option>+1</option>
                          <option>+44</option>
                        </select>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
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
                        disabled={!isEditing}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <Select
                        value={formData.country}
                        disabled={!isEditing}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            country: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base disabled:bg-gray-100 disabled:text-gray-500">
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
                    {/* Brand Name & Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Brand Name
                        </label>
                        <input
                          type="text"
                          name="brandName"
                          value={formData.brandName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                        {isEditing && (
                          <p className="text-xs text-gray-500 mt-1">
                              Emails from here
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                          Brand Size
                        </label>
                        <input
                          type="number"
                          name="brandSize"
                          value={formData.brandSize}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="e.g. 10"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
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
                          disabled={!isEditing}
                          placeholder="https://twitter.com/..."
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
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
                          disabled={!isEditing}
                          placeholder="https://facebook.com/..."
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
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
                          disabled={!isEditing}
                          placeholder="https://google.com/..."
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
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
                          disabled={!isEditing}
                          placeholder="https://instagram.com/..."
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
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
                        disabled={!isEditing}
                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Changes Button */}
              {isEditing && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    {saveError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {saveError}
                    </div>
                    )}
                    {saveSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        Profile updated successfully!
                    </div>
                    )}
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="w-full px-6 py-3 md:py-3.5 bg-yellow-300 hover:bg-yellow-400 disabled:bg-yellow-200 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors text-sm md:text-base flex items-center justify-center gap-2"
                    >
                    <DepositIcon />
                    {isSaving ? "Saving..." : "Save changes"}
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
