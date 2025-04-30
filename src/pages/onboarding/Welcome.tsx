
import { useNavigate } from "react-router-dom";

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  
  const startOnboarding = () => {
    navigate("/onboarding/company");
  };
  
  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2">Welcome to Allora OS</h1>
      <p className="text-gray-600 mb-6">Let's personalize your experience by gathering some information about your business.</p>
      
      <div className="mb-6">
        <ul className="text-left mb-8 space-y-2">
          <li className="flex items-center">
            <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
            Create your account
          </li>
          <li className="flex items-center">
            <span className="bg-gray-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center mr-2">2</span>
            Company information
          </li>
          <li className="flex items-center">
            <span className="bg-gray-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center mr-2">3</span>
            Set your goals
          </li>
        </ul>
      </div>
      
      <button
        onClick={startOnboarding}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Start Onboarding
      </button>
    </div>
  );
}
