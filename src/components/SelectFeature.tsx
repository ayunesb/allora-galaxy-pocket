
import React from 'react';

const SelectFeature: React.FC = () => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-2">New "Select" Feature</h3>
      <p className="text-sm text-gray-600">
        This component demonstrates the new "Select" feature in Lovable.
        You can now click on elements directly to edit them.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {['Feature 1', 'Feature 2', 'Feature 3'].map((feature, i) => (
          <div key={i} className="p-2 bg-white border rounded text-center shadow-sm hover:shadow-md transition-shadow">
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectFeature;
