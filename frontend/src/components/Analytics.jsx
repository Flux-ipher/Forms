import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowLeft, Users, ListFilter, Download, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api';
import FormEditorNav from './FormEditorNav';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [view, setView] = useState('summary'); // 'summary', 'question', 'individual'
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentSubmissionIdx, setCurrentSubmissionIdx] = useState(0);

  useEffect(() => {
    if (id) {
      api.getAnalytics(id).then(setData).catch(console.error);
    }
  }, [id]);

  if (!data) return <div className="flex justify-center items-center h-64">Loading analytics...</div>;

  const { form, submissions } = data;
  const questions = form.schema.filter(q => q.type !== 'theme' && q.type !== 'settings' && q.type !== 'section');

  const exportToCSV = () => {
    if (!data) return;
    
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
        setCurrentSubmissionIdx(0);
      } catch (err) {
        alert("Failed to delete responses");
      }
      setIsDeleting(false);
    }
  };

  const renderSummaryView = () => (
    <div className="space-y-8 mt-6">
      {questions.map((q, index) => {
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

            {['text', 'paragraph', 'date', 'email'].includes(q.type) && (
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
  );

  const renderQuestionView = () => {
    if (questions.length === 0) return null;
    const currentQ = questions[currentQuestionIdx];
    
    return (
      <div className="mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between mb-6">
          <button 
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
            disabled={currentQuestionIdx === 0}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-900 mb-1">{currentQ.title}</div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Question {currentQuestionIdx + 1} of {questions.length}</div>
          </div>
          <button 
            onClick={() => setCurrentQuestionIdx(Math.min(questions.length - 1, currentQuestionIdx + 1))}
            disabled={currentQuestionIdx === questions.length - 1}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {submissions.map((sub, i) => {
              const ans = sub.answers[currentQ.id];
              if (!ans) return null;
              return (
                <li key={i} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Response {i + 1}</div>
                  {currentQ.type === 'file' ? (
                     <a href={ans} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors">
                       <ExternalLink className="w-4 h-4" />
                       <span>View uploaded file</span>
                     </a>
                  ) : (
                    <div className="text-gray-900 font-medium whitespace-pre-wrap">
                      {Array.isArray(ans) ? ans.join(', ') : ans}
                    </div>
                  )}
                </li>
              );
            })}
            {submissions.filter(s => s.answers[currentQ.id]).length === 0 && (
              <div className="text-gray-500 text-center py-10 font-medium">No responses for this question yet.</div>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const renderIndividualView = () => {
    if (submissions.length === 0) return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200 mt-6 text-gray-500 font-medium">
        No submissions to display.
      </div>
    );
    const sub = submissions[currentSubmissionIdx];
    
    return (
      <div className="mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between mb-6">
          <button 
            onClick={() => setCurrentSubmissionIdx(Math.max(0, currentSubmissionIdx - 1))}
            disabled={currentSubmissionIdx === 0}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-900 mb-1">
              Submission {currentSubmissionIdx + 1} of {submissions.length}
            </div>
            <div className="text-sm font-medium text-gray-500">
              Submitted on: {new Date(sub.submitted_at || Date.now()).toLocaleString()}
            </div>
          </div>
          <button 
            onClick={() => setCurrentSubmissionIdx(Math.min(submissions.length - 1, currentSubmissionIdx + 1))}
            disabled={currentSubmissionIdx === submissions.length - 1}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, i) => {
            const ans = sub.answers[q.id];
            return (
              <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:border-gray-300">
                <div className="text-sm font-semibold text-gray-500 mb-3">{q.title}</div>
                {q.type === 'file' && ans ? (
                  <a href={ans} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    <span>View uploaded file</span>
                  </a>
                ) : (
                  <div className="text-gray-900 text-lg">
                    {ans ? (Array.isArray(ans) ? ans.join(', ') : ans) : <span className="text-gray-400 italic font-medium">No answer provided</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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

        {submissions.length > 0 && (
          <div className="border-b border-gray-200 mb-6 bg-white rounded-t-xl px-6 pt-2">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setView('summary')}
                className={`${view === 'summary' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Summary
              </button>
              <button
                onClick={() => setView('question')}
                className={`${view === 'question' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Question
              </button>
              <button
                onClick={() => setView('individual')}
                className={`${view === 'individual' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Individual
              </button>
            </nav>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200 font-medium">
            Waiting for responses...
          </div>
        ) : (
          <>
            {view === 'summary' && renderSummaryView()}
            {view === 'question' && renderQuestionView()}
            {view === 'individual' && renderIndividualView()}
          </>
        )}
      </div>
    </div>
  );
}
