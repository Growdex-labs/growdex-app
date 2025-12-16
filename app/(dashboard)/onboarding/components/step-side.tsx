export function StepSideOnboarding({ currentStep }: { currentStep: number }) {
    return (
        <aside className="hidden md:block w-64 bg-[#2a2a2a] text-white p-8">
        <div className="flex items-center gap-2 mb-16">
          <div className="w-8 h-8">
            <img src="/logo.png" alt="logo" />
          </div>
          <span className="font-semibold text-lg">Growdex</span>
        </div>

        <nav className="space-y-2">
          <div
            className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
              currentStep === 1 ? 'bg-yellow-600 text-white' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 1
                  ? 'bg-white text-yellow-600'
                  : currentStep > 1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-400'
              }`}
            >
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className={currentStep === 1 ? 'text-white font-medium' : ''}>
              Get Started
            </span>
          </div>

          <div
            className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
              currentStep === 2 ? 'bg-yellow-500 text-gray-900' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 2
                  ? 'bg-gray-900 text-yellow-500'
                  : currentStep > 2
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-600 text-gray-400'
              }`}
            >
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span className={currentStep === 2 ? 'text-white font-medium' : ''}>
              Setup social accounts
            </span>
          </div>

          <div
            className={`px-4 py-3 rounded-lg flex items-center gap-3 ${
              currentStep === 3 ? 'bg-yellow-500 text-gray-900' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 3
                  ? 'bg-gray-900 text-yellow-500'
                  : 'bg-gray-600 text-gray-400'
              }`}
            >
              3
            </div>
            <span className={currentStep === 3 ? 'text-white font-medium' : ''}>
              Launch Growdex
            </span>
          </div>
        </nav>
      </aside>
    );
}
