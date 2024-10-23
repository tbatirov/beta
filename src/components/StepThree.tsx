import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface StepThreeProps {
  formData: { code: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onComplete: () => void;
}

const StepThree: React.FC<StepThreeProps> = ({ formData, onChange, onComplete }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication process
    setTimeout(() => {
      setIsAuthenticated(true);
      onComplete();
    }, 1000);
  };

  if (isAuthenticated) {
    return (
      <div className="text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Registration Successful!</h3>
        <p className="text-gray-600">You can now log in to your account.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          Verification Code
        </label>
        <input
          type="text"
          id="code"
          name="code"
          value={formData.code}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter verification code"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Verify & Complete Registration
      </button>
    </form>
  );
};

export default StepThree;