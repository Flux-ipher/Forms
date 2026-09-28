import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

export default function ShareModal({ formId, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/form/${formId}`;

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Form</h2>
        <p className="text-gray-500 mb-6">Anyone with this link can view and submit responses to your form.</p>
        
        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200 mb-6">
          <input 
            type="text" 
            readOnly 
            value={shareUrl}
            className="flex-1 bg-transparent border-none outline-none text-gray-600 text-sm px-2"
          />
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md shadow-sm transition-colors text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        
        <div className="flex justify-end">
          <a 
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}
