import { Wifi } from "lucide-react";
import { SocialAccountSetupProps } from "../page";
import { SocialPlatform } from "@/lib/oauth";

interface StepTwoProps {
    socialAccounts: SocialAccountSetupProps;
    isLoading: boolean;
    handleConnectSocial: (platform: SocialPlatform) => Promise<void>;
    handleDisconnectSocial: (platform: SocialPlatform) => Promise<void>;
    onNext: () => void;
    handleSetupLater: () => void;
}

export function StepTwoOnboarding({
    socialAccounts, isLoading, handleConnectSocial,
    handleDisconnectSocial, onNext, handleSetupLater
}: StepTwoProps) {
    return (
        <div>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl"><Wifi className='text-blue-400'/></span>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Connect your social accounts
                  </h1>
                </div>
                <p className="text-gray-700 max-w-2xl">
                  Don't worry, you're safe. We need to connect your accounts to enable
                  you run unified ads across one dashboard. Connect your social
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {/* Facebook */}
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Facebook</div>
                    <div className="font-medium text-gray-900">
                      {socialAccounts.facebook.username || 'Not connected'}
                    </div>
                  </div>
                  {socialAccounts.facebook.connected ? (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Connected
                      </span>
                      <button
                        onClick={() => handleDisconnectSocial('facebook')}
                        disabled={isLoading}
                        className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnectSocial('facebook')}
                      disabled={isLoading}
                      className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>

                {/* Instagram */}
                <div
                  className={`p-4 border rounded-lg ${
                    socialAccounts.instagram.error
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className={`text-sm mb-1 ${
                          socialAccounts.instagram.error ? 'text-red-600' : 'text-gray-500'
                        }`}
                      >
                        Instagram
                      </div>
                      <div className="font-medium text-gray-900">
                        {socialAccounts.instagram.username || 'Not connected'}
                      </div>
                    </div>
                    {socialAccounts.instagram.connected ? (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 text-green-600 font-medium">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Connected
                        </span>
                        <button
                          onClick={() => handleDisconnectSocial('instagram')}
                          disabled={isLoading}
                          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnectSocial('instagram')}
                        disabled={isLoading}
                        className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {isLoading ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                  {socialAccounts.instagram.error && (
                    <div className="mt-2 text-sm text-red-600">
                      We can't find this account. Try another one
                    </div>
                  )}
                </div>

                {/* TikTok */}
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">TikTok</div>
                    <div className="font-medium text-gray-900">
                      {socialAccounts.tiktok.username || 'Not connected'}
                    </div>
                  </div>
                  {socialAccounts.tiktok.connected ? (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Connected
                      </span>
                      <button
                        onClick={() => handleDisconnectSocial('tiktok')}
                        disabled={isLoading}
                        className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnectSocial('tiktok')}
                      disabled={isLoading}
                      className="flex items-center gap-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={onNext}
                  disabled={isLoading}
                  className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={handleSetupLater}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  Setup later
                </button>
              </div>
            </div>
    );
}
