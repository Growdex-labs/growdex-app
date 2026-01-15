import { ChangeEvent } from "react";
import { FormDataProps } from "../page";

interface OnboardStepProps {
    formData: FormDataProps;
    inputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
    isLoading: boolean;
};

export function StepOneOnboarding({formData, inputChange, onNext, isLoading}: OnboardStepProps) {
    return (
        <div>
            <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🎯</span>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                Welcome to Growdex!
                </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-700">Great to have you here</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
                <label className="block text-xs md:text-sm text-gray-500 mb-2">
                Your first name <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={inputChange}
                required
                placeholder="John"
                className="w-full px-2 md:px-4 py-1 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-xs md:text-sm text-gray-500 mb-2">
                Your last name <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={inputChange}
                required
                placeholder="Doe"
                className="w-full px-2 md:px-4 py-1 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-xs md:text-sm text-gray-500 mb-2">
                Organization name
                </label>
                <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={inputChange}
                placeholder="Doe Junior"
                className="w-full px-2 md:px-4 py-1 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-xs md:text-sm text-gray-500 mb-2">
                Organization size
                </label>
                <input
                type="number"
                name="organizationSize"
                value={formData.organizationSize}
                onChange={inputChange}
                placeholder="25"
                className="w-full px-2 md:px-4 py-1 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            </div>

            <div className="flex justify-between items-center">
            <button
                onClick={onNext}
                disabled={isLoading}
                className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {isLoading ? 'Saving...' : 'Next'}
            </button>
            <button
                onClick={onNext}
                className="text-gray-400 text-sm md:text-base hover:text-gray-600 transition-colors"
            >
                Setup social accounts
            </button>
            </div>
        </div>
    );
}
