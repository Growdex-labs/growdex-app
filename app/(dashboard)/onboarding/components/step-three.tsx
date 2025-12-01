interface StepThreeProps {
    isLoading :boolean;
    handleGoToDashboard: () => void;
}

export function StepThreeOnboarding({ isLoading, handleGoToDashboard }: StepThreeProps) {
    return (
        <div>
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  You're all set up!
                </h1>
                <p className="text-xl text-gray-700">
                  Let's help you get started. Take the Growdex Setup Wizard
                </p>
              </div>

              <ul className="space-y-3 mb-12">
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create your first campaign
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Connect your social accounts
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Fund your ad wallet
                </li>
              </ul>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleGoToDashboard}
                  disabled={isLoading}
                  className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Completing...' : 'Go to dashboard'}
                </button>
                {/* <button
                  onClick={handleSetupLater}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  Setup later
                </button> */}
              </div>
            </div>
    );
}
