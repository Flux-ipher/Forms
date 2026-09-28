import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, Users, ListFilter, Download, Trash2, ExternalLink } from 'lucide-react';
import { api } from '../api';
import FormEditorNav from './FormEditorNav';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      api.getAnalytics(id).then(setData).catch(console.error);
    }
  }, [id]);

  if (!data) return <div className="flex justify-center items-center h-64">Loading analytics...</div>;

  const { form, submissions } = data;

  const exportToCSV = () => {
    if (!data) return;
    
    const questions = form.schema.filter(q => q.type !== 'theme' && q.type !== 'settings');
    const headers = ['Submission Date', ...questions.map(q => q.title)];
    
    const rows = submissions.map(sub => {
      const date = new Date(sub.submitted_at || Date.now()).toLocaleString();
      const row = [date];
      
      questions.forEach(q => {
        let answer = sub.answers[q.id] || '';
        if (Array.isArray(answer)) answer = answer.join('; ');
        if (typeof answer === 'string' && (answer.includes(',') || answer.includes('"') || answer.includes('\n'))) {
          answer = `"${answer.replace(/"/g, '""')}"`;
        }
        row.push(answer);
      });
      return row.join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAggregatedData = (questionId, type, options) => {
    if (['radio', 'dropdown'].includes(type)) {
      const counts = (options || []).reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {});
      submissions.forEach(sub => {
        const answer = sub.answers[questionId];
        if (answer && counts[answer] !== undefined) counts[answer]++;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    
    if (type === 'checkbox') {
      const counts = (options || []).reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {});
      submissions.forEach(sub => {
        const answers = sub.answers[questionId] || [];
        // answers could be array or single string from react-hook-form
        const ansArray = Array.isArray(answers) ? answers : [answers];
        ansArray.forEach(ans => {
          if (ans && counts[ans] !== undefined) counts[ans]++;
        });
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }
    return [];
  };

  const handleDeleteResponses = async () => {
    if (window.confirm("Are you sure you want to delete ALL responses for this form? This cannot be undone.")) {
      setIsDeleting(true);
      try {
        await api.deleteAllResponses(id);
        setData({ ...data, submissions: [] });
      } catch (err) {
        alert("Failed to delete responses");
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <FormEditorNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-4">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-4">
          <Link to={`/build/${id}`} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-500 mt-1">Analytics Dashboard</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3 w-full sm:w-auto">
            <div className="bg-primary-100 p-2 rounded-full">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 leading-none">{submissions.length}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Responses</div>
            </div>
          </div>
          {submissions.length > 0 && (
            <>
              <button 
                onClick={exportToCSV}
                className="flex-1 sm:flex-none bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center space-x-2 text-gray-700 hover:text-primary-600 hover:border-primary-300 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button 
                onClick={handleDeleteResponses}
                disabled={isDeleting}
                className="flex-1 sm:flex-none bg-white px-4 py-3 rounded-lg border border-red-200 shadow-sm flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">{isDeleting ? 'Deleting...' : 'Delete All'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {form.schema && form.schema.filter(q => q.type !== 'theme' && q.type !== 'settings').map((q, index) => {
          const chartData = getAggregatedData(q.id, q.type, q.options);
          return (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="text-gray-400 mr-2">{index + 1}.</span> {q.title}
                </h3>
                <div className="text-sm font-medium text-gray-400 flex items-center">
                  <ListFilter className="w-4 h-4 mr-1" />
                  {submissions.filter(s => s.answers[q.id]).length} responses
                </div>
              </div>

              {['radio', 'dropdown', 'checkbox'].includes(q.type) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-8">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} responses`, name]}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {chartData.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="font-medium text-gray-700">{entry.name}</span>
                        </div>
                        <div className="font-bold text-gray-900">
                          {entry.value} 
                          <span className="text-gray-400 text-sm font-normal ml-1">
                            ({submissions.length ? ((entry.value / submissions.length) * 100).toFixed(0) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {['text', 'paragraph', 'date'].includes(q.type) && (
                <div className="mt-4 bg-gray-50 rounded-lg border border-gray-100 max-h-80 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {submissions.map((sub, i) => (
                      sub.answers[q.id] && (
                        <li key={i} className="p-4 text-gray-700">
                          {sub.answers[q.id]}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}

              {q.type === 'file' && (
                <div className="mt-4 bg-gray-50 rounded-lg border border-gray-100 max-h-80 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {submissions.map((sub, i) => (
                      sub.answers[q.id] && (
                        <li key={i} className="p-4 text-gray-700">
                           <a href={sub.answers[q.id]} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center space-x-1">
                             <span className="font-medium">View uploaded file</span>
                           </a>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
      </div>
    </div>
  );
}
