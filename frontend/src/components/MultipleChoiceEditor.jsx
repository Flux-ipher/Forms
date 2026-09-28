import React from 'react';
import { Circle, Square, List, X } from 'lucide-react';

export default function MultipleChoiceEditor({ type, options, onChange }) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      onChange(newOptions);
    }
  };

  const addOption = () => {
    onChange([...options, `Option ${options.length + 1}`]);
  };

  const getIcon = (idx) => {
    if (type === 'checkbox') return <Square className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />;
    if (type === 'dropdown') return <span className="w-5 text-center text-gray-400 mr-3 flex-shrink-0 text-sm font-medium">{idx + 1}.</span>;
    return <Circle className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />;
  };

  return (
    <div className="space-y-3">
      {options.map((opt, index) => (
        <div key={index} className="flex items-center group">
          {getIcon(index)}
          <input
            type="text"
            className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 outline-none py-1 transition-colors text-gray-700"
            value={opt}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          {options.length > 1 && (
            <button
              onClick={() => removeOption(index)}
              className="ml-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
      <div className="flex items-center pt-2">
        {type === 'dropdown' ? <List className="w-5 h-5 text-gray-300 mr-3" /> : getIcon(options.length)}
        <button
          onClick={addOption}
          className="text-gray-500 hover:text-primary-600 font-medium text-sm transition-colors"
        >
          Add option
        </button>
      </div>
    </div>
  );
}
