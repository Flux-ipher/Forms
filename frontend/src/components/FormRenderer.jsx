import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import { api } from '../api';

export default function FormRenderer() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (id) {
      api.getForm(id).then(setForm).catch(console.error);
    }
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await api.submitForm(id, data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit form");
    }
  };

  if (!form) return <div className="flex justify-center items-center h-screen bg-gray-50">Loading form...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Response Recorded</h2>
          <p className="text-gray-600 mb-8">Thank you for submitting your response.</p>
          <button onClick={() => window.location.reload()} className="text-primary-600 hover:text-primary-700 font-medium underline">
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  const themeNode = form.schema?.find(q => q.type === 'theme');
  const themeColor = themeNode?.color || '#3b82f6';
  const questions = form.schema?.filter(q => q.type !== 'theme') || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-3 w-full" style={{ backgroundColor: themeColor }}></div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <label className="block text-lg font-medium text-gray-900 mb-4">
                {q.title}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {q.type === 'text' && (
                <input
                  type="text"
                  className="w-1/2 bg-transparent border-b border-gray-300 focus:border-primary-500 outline-none py-2 transition-colors text-gray-900"
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
                  className="w-1/2 bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
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

          <div className="flex justify-between items-center pt-4">
            <button
              type="submit"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              Submit
            </button>
            <p className="text-xs text-gray-400">Powered by FormFlow</p>
          </div>
        </form>
      </div>
    </div>
  );
}
