import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Calendar, Clock, BarChart2, Trash2, Mail, Users, MessageSquare } from 'lucide-react';
import { api } from '../api';

const TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank form',
    icon: PlusCircle,
    color: 'text-gray-500',
    data: { title: 'Untitled Form', description: '', schema: [] }
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: Mail,
    color: 'text-blue-500',
    data: {
      title: 'Contact Information',
      description: 'Please leave your contact details so we can get in touch.',
      schema: [
        { id: 't1', type: 'text', title: 'Full Name', required: true },
        { id: 't2', type: 'text', title: 'Email Address', required: true },
        { id: 't3', type: 'paragraph', title: 'Message', required: false }
      ]
    }
  },
  {
    id: 'event',
    title: 'Event RSVP',
    icon: Users,
    color: 'text-emerald-500',
    data: {
      title: 'Event Registration',
      description: 'Register for our upcoming event.',
      schema: [
        { id: 't4', type: 'text', title: 'Name', required: true },
        { id: 't5', type: 'radio', title: 'Will you attend?', options: ['Yes', 'No', 'Maybe'], required: true },
        { id: 't6', type: 'dropdown', title: 'Dietary Restrictions', options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free'], required: true }
      ]
    }
  },
  {
    id: 'feedback',
    title: 'Customer Feedback',
    icon: MessageSquare,
    color: 'text-purple-500',
    data: {
      title: 'Customer Feedback',
      description: 'We value your opinion! Let us know how we did.',
      schema: [
        { id: 't7', type: 'radio', title: 'How satisfied are you?', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'], required: true },
        { id: 't8', type: 'checkbox', title: 'What did you like?', options: ['Service', 'Quality', 'Speed', 'Price'], required: false },
        { id: 't9', type: 'paragraph', title: 'Any other comments?', required: false }
      ]
    }
  }
];

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = () => {
    api.getForms()
      .then(setForms)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const createFormFromTemplate = async (templateData) => {
    try {
      const newForm = await api.createForm(templateData);
      navigate(`/build/${newForm.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteForm = async (id, e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this form? This cannot be undone.")) {
      try {
        await api.deleteForm(id);
        setForms(forms.filter(f => f.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete form.");
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading your forms...</div>;
  }

  return (
    <div>
      {/* Template Gallery */}
      <div className="bg-gray-50 border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Start a new form</h2>
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => createFormFromTemplate(template.data)}
                className="flex-shrink-0 group flex flex-col items-center w-36"
              >
                <div className="w-full aspect-[4/3] bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center group-hover:border-primary-500 transition-colors cursor-pointer relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${
                    template.id === 'blank' ? 'bg-gray-500' : 'bg-primary-500'
                  }`} />
                  <template.icon className={`w-10 h-10 ${template.color}`} />
                </div>
                <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-primary-600 truncate w-full text-center">
                  {template.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Forms */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent forms</h2>
        </div>

        {forms.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 py-16 px-4">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No forms yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating a new form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {forms.map(form => (
              <div key={form.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full relative">
                <div className="p-5 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-primary-600 transition-colors pr-8">{form.title}</h3>
                  <button 
                    onClick={(e) => deleteForm(form.id, e)}
                    className="absolute top-5 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete form"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="mt-6 flex items-center text-xs text-gray-400 space-x-3">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(form.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 flex justify-between items-center">
                  <Link to={`/build/${form.id}`} className="text-sm font-medium text-gray-600 hover:text-primary-600">
                    Edit form
                  </Link>
                  <div className="flex space-x-3">
                    <a href={`/form/${form.id}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                      Preview
                    </a>
                    <Link to={`/analytics/${form.id}`} className="flex items-center text-sm font-medium text-gray-600 hover:text-primary-600">
                      <BarChart2 className="w-4 h-4 mr-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
