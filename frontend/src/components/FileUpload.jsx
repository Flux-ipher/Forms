import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { api } from '../api';

export default function FileUpload({ onUploadComplete, value }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const { url } = await api.uploadFile(file);
      onUploadComplete(url);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <a href={value} target="_blank" rel="noreferrer" className="text-sm font-medium text-green-700 hover:underline flex-1 truncate">
          File uploaded successfully (View)
        </a>
        <button 
          type="button"
          onClick={() => onUploadComplete('')}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isUploading ? (
            <>
              <Loader className="w-8 h-8 text-primary-500 animate-spin mb-2" />
              <p className="text-sm text-gray-500 font-medium">Uploading to Google Drive...</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG (MAX. 10MB)</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
