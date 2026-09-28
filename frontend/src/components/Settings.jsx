import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { api } from '../api';
import FormEditorNav from './FormEditorNav';

export default function Settings() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [settings, setSettings] = useState({
    confirmationMessage: 'Your response has been recorded.',
    showLinkAnother: true,
    disableAutosave: false,
    showProgressBar: true,
    collectEmail: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      api.getForm(id).then(data => {
        setForm(data);
        const existingSettings = data.schema?.find(q => q.type === 'settings');
        if (existingSettings) {
          setSettings({
            confirmationMessage: existingSettings.confirmationMessage ?? 'Your response has been recorded.',
            showLinkAnother: existingSettings.showLinkAnother ?? true,
            disableAutosave: existingSettings.disableAutosave ?? false,
            showProgressBar: existingSettings.showProgressBar ?? true,
            collectEmail: existingSettings.collectEmail ?? false
          });
        }
      }).catch(console.error);
    }
  }, [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (dataToSave) => {
      setIsSaving(true);
      try {
        await api.saveForm(id, dataToSave);
      } catch (err) {
        console.error(err);
      }
      setTimeout(() => setIsSaving(false), 500);
    }, 1500),
    [id]
  );

  const handleUpdate = (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    // Merge into schema
    let newSchema = form.schema.filter(q => q.type !== 'settings');
    newSchema.push({ id: 'form-settings', type: 'settings', ...newSettings });
    
    const updatedForm = { ...form, schema: newSchema };
    setForm(updatedForm);
    debouncedSave(updatedForm);
  };

  if (!form) return <div className="flex justify-center items-center h-64">Loading settings...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <FormEditorNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Presentation</h2>
            <p className="text-gray-500">Manage how the form and responses are presented</p>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Form Presentation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Form Presentation</h3>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-gray-900 font-medium">Collect email addresses</div>
                  <div className="text-gray-500 text-sm">Require users to enter an email address before submitting</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.collectEmail}
                    onChange={(e) => handleUpdate({ collectEmail: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-900 font-medium">Show progress bar</div>
                  <div className="text-gray-500 text-sm">Display a progress bar at the top of multi-page forms</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.showProgressBar}
                    onChange={(e) => handleUpdate({ showProgressBar: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100"></div>

            {/* After Submission */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">After Submission</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-900 font-medium mb-1">Confirmation message</label>
                  <p className="text-gray-500 text-sm mb-3">Message respondents see after submitting their form</p>
                  <input
                    type="text"
                    value={settings.confirmationMessage}
                    onChange={(e) => handleUpdate({ confirmationMessage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">Show link to submit another response</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.showLinkAnother}
                      onChange={(e) => handleUpdate({ showLinkAnother: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100"></div>

            {/* Restrictions */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Restrictions</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-900 font-medium">Disable autosave for all respondents</div>
                  <div className="text-gray-500 text-sm">Respondents will lose their progress if they close their browser</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.disableAutosave}
                    onChange={(e) => handleUpdate({ disableAutosave: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

          </div>
        </div>
        
        {isSaving && <div className="text-sm text-gray-500 text-center mt-4 animate-pulse">Saving changes...</div>}
      </div>
    </div>
  );
}
