import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import FileUpload from './FileUpload';

export default function FormRenderer() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  // Extract settings
  const settingsNode = form?.schema?.find(q => q.type === 'settings') || {};
  const settings = {
    confirmationMessage: settingsNode.confirmationMessage ?? 'Thank you for submitting your response.',
    showLinkAnother: settingsNode.showLinkAnother ?? true,
    disableAutosave: settingsNode.disableAutosave ?? false,
    showProgressBar: settingsNode.showProgressBar ?? true
  };

  // Initialize form with cached values if they exist
  const getCachedValues = () => {
    if (settings.disableAutosave) return {};
    try {
      const cached = localStorage.getItem(`form_progress_${id}`);
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  };

  const { register, trigger, watch, setValue, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: getCachedValues()
  });

  const formValues = watch();

  // Save progress to localStorage whenever formValues change
  useEffect(() => {
    if (!settings.disableAutosave && Object.keys(formValues).length > 0) {
      localStorage.setItem(`form_progress_${id}`, JSON.stringify(formValues));
    }
  }, [formValues, id, settings.disableAutosave]);

  useEffect(() => {
    if (id) {
      api.getForm(id).then(setForm).catch(console.error);
    }
  }, [id]);

  if (!form) return <div className="flex justify-center items-center h-screen bg-gray-50">Loading form...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Response Recorded</h2>
          <p className="text-gray-600 mb-8">{settings.confirmationMessage}</p>
          {settings.showLinkAnother && (
            <button onClick={() => window.location.reload()} className="text-primary-600 hover:text-primary-700 font-medium underline">
              Submit another response
            </button>
          )}
        </div>
      </div>
    );
  }

  const themeNode = form.schema?.find(q => q.type === 'theme');
  const themeColor = themeNode?.color || '#3b82f6';
  const coverImage = themeNode?.coverImage || null;
  const questions = form.schema?.filter(q => q.type !== 'theme' && q.type !== 'settings') || [];

  // Parse schema into pages based on sections
  const pages = [];
  let currentPage = { 
    id: 'root', 
    header: { title: form.title, description: form.description }, 
    items: [], 
    rule: null 
  };
  
  questions.forEach(q => {
    if (q.type === 'section') {
      pages.push(currentPage);
      currentPage = { 
        id: q.id, 
        header: { title: q.title, description: q.description }, 
        items: [], 
        rule: q.visibilityRule 
      };
    } else {
      currentPage.items.push(q);
    }
  });
  pages.push(currentPage);

  const getNextValidPageIndex = (fromIndex) => {
    let nextIdx = fromIndex + 1;
    while(nextIdx < pages.length) {
      const rule = pages[nextIdx].rule;
      if (!rule || !rule.questionId) return nextIdx;
      
      const val = formValues[rule.questionId];
      if (Array.isArray(val) ? val.includes(rule.optionValue) : val === rule.optionValue) {
        return nextIdx;
      }
      nextIdx++;
    }
    return -1;
  };

  const getPrevValidPageIndex = (fromIndex) => {
    let prevIdx = fromIndex - 1;
    while(prevIdx >= 0) {
      const rule = pages[prevIdx].rule;
      if (!rule || !rule.questionId) return prevIdx;
      
      const val = formValues[rule.questionId];
      if (Array.isArray(val) ? val.includes(rule.optionValue) : val === rule.optionValue) {
        return prevIdx;
      }
      prevIdx--;
    }
    return 0;
  };

  const handleNext = async () => {
    const fieldsToValidate = pages[currentPageIndex].items.filter(q => q.required).map(q => q.id);
    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    
    if (isValid) {
      setCurrentPageIndex(getNextValidPageIndex(currentPageIndex));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentPageIndex(getPrevValidPageIndex(currentPageIndex));
    window.scrollTo(0, 0);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    
    const fieldsToValidate = pages[currentPageIndex].items.filter(q => q.required).map(q => q.id);
    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    
    if (isValid) {
      // Collect data only from pages that were visible to the user
      const validData = {};
      let idx = 0;
      while(idx !== -1 && idx < pages.length) {
        pages[idx].items.forEach(q => {
          validData[q.id] = formValues[q.id] || null;
        });
        idx = getNextValidPageIndex(idx);
      }

      try {
        await api.submitForm(id, validData);
        // Clear cache on successful submission
        localStorage.removeItem(`form_progress_${id}`);
        setSubmitted(true);
      } catch (err) {
        console.error(err);
        alert("Failed to submit form");
      }
    }
  };

  const activePage = pages[currentPageIndex];
  const nextIdx = getNextValidPageIndex(currentPageIndex);
  const isLastPage = nextIdx === -1;

  // Calculate progress
  // A simple approximation: current index over total pages, but we dynamically count valid pages if we wanted to.
  // For simplicity, we just use the raw index if there are pages.
  const progressPercentage = pages.length > 1 ? ((currentPageIndex + 1) / pages.length) * 100 : 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress bar */}
        {settings.showProgressBar && pages.length > 1 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6 overflow-hidden">
            <div className="h-1.5 transition-all duration-300" style={{ width: `${progressPercentage}%`, backgroundColor: themeColor }}></div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-3 w-full" style={{ backgroundColor: themeColor }}></div>
          {coverImage && (
            <div className="w-full h-48 bg-gray-100 overflow-hidden">
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{activePage.header.title || form.title}</h1>
            {(activePage.header.description || form.description) && (
              <p className="text-gray-600">{activePage.header.description || form.description}</p>
            )}
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {activePage.items.map((q) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <label className="block text-lg font-medium text-gray-900 mb-4">
                {q.title}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {q.type === 'text' && (
                <input
                  type="text"
                  className="w-full sm:w-1/2 bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none py-2 transition-colors text-gray-900"
                  placeholder="Your answer"
                  {...register(q.id, { required: q.required })}
                />
              )}

              {q.type === 'paragraph' && (
                <textarea
                  className="w-full bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none py-2 transition-colors text-gray-900 resize-y min-h-[100px]"
                  placeholder="Your answer"
                  {...register(q.id, { required: q.required })}
                />
              )}
              
              {q.type === 'date' && (
                <input
                  type="date"
                  className="bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none py-2 transition-colors text-gray-900"
                  {...register(q.id, { required: q.required })}
                />
              )}
              
              {q.type === 'file' && (
                <div>
                  <FileUpload 
                    value={formValues[q.id]}
                    onUploadComplete={(url) => setValue(q.id, url, { shouldValidate: true, shouldDirty: true })} 
                  />
                  {/* Hidden input to register with react-hook-form */}
                  <input type="hidden" {...register(q.id, { required: q.required })} />
                </div>
              )}

              {q.type === 'radio' && (
                <div className="space-y-3">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        value={opt}
                        className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                        {...register(q.id, { required: q.required })}
                      />
                      <span className="text-gray-700 group-hover:text-gray-900">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {q.type === 'checkbox' && (
                <div className="space-y-3">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={opt}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        {...register(q.id, { required: q.required })}
                      />
                      <span className="text-gray-700 group-hover:text-gray-900">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {q.type === 'dropdown' && (
                <select 
                  className="w-full sm:w-1/2 bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  {...register(q.id, { required: q.required })}
                >
                  <option value="">Choose</option>
                  {q.options?.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {errors[q.id] && <span className="text-red-500 text-sm mt-2 block">This question is required</span>}
            </div>
          ))}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center pt-4 gap-4 sm:gap-0">
            {currentPageIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div className="hidden sm:block"></div>}

            {isLastPage ? (
              <button
                type="button"
                onClick={submitForm}
                className="w-full sm:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex justify-end pt-2">
             <p className="text-xs text-gray-400">Powered by FormFlow</p>
          </div>
        </form>
      </div>
    </div>
  );
}
