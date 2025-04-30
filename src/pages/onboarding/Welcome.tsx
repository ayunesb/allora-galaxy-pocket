export default function OnboardingWelcome() {
  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2">Welcome to Allora OS</h1>
      <p className="text-gray-600 mb-6">Let's personalize your experience.</p>
      <a href="/onboarding/company" className="bg-green-600 text-white px-4 py-2 rounded">Start Onboarding</a>
    </div>
  );
}
