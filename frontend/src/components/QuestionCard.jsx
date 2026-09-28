import React from 'react';
import { Trash2, GripHorizontal, Settings, Copy, PlusCircle, LayoutTemplate } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MultipleChoiceEditor from './MultipleChoiceEditor';

export default function QuestionCard({ id, question, onChange, onDelete, allQuestions, index, isActive, onFocus, onAddQuestion, onAddSection }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative'
  };

  // Find multiple choice questions that appear before this section to use in logic jumps
  const previousChoiceQuestions = allQuestions
    .slice(0, index)
    .filter(q => q.type === 'radio' || q.type === 'dropdown');

  const isSection = question.type === 'section';
  const isInSection = !isSection && allQuestions.slice(0, index).some(q => q.type === 'section');

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-lg shadow-sm border ${isActive || isDragging ? 'border-primary-500 shadow-xl opacity-100 border-l-[6px]' : 'border-gray-200 border-l-[6px] border-l-transparent hover:border-l-gray-300'} overflow-visible group transition-all hover:shadow-md ${isSection ? 'border-t-[6px] border-t-primary-500 mt-8 rounded-t-lg' : 'mb-4'} ${isInSection ? 'ml-8' : ''} relative cursor-default`}
      onClick={(e) => {
        // Prevent click inside from resetting focus
        e.stopPropagation();
        if (!isActive && onFocus) onFocus();
      }}
    >
      {/* Absolute Side Menu (Only visible when active) */}
      {isActive && (
        <div className="absolute -right-14 top-0 hidden md:flex flex-col bg-white rounded-lg shadow-md border border-gray-200 p-1.5 space-y-2 items-center z-30">
          <button
            onClick={(e) => { e.stopPropagation(); onAddQuestion(); }}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Add Question"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddSection(); }}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Add Section"
          >
            <LayoutTemplate className="w-5 h-5" />
          </button>
        </div>
      )}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-1/2 -top-3 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white border border-gray-200 rounded px-2 py-0.5 shadow-sm z-20"
      >
        <GripHorizontal className="w-4 h-4 text-gray-400" />
      </div>

      <div className="p-6">
        {isSection ? (
          // SECTION UI
          <div className="flex flex-col gap-4 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Section Break</span>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Settings className="w-4 h-4" />
                <span>Logic</span>
              </div>
            </div>
            <input
              type="text"
              className="w-full text-2xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 py-2 outline-none transition-all placeholder-gray-400"
              placeholder="Section Title"
              value={question.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
            <textarea
              className="w-full text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 py-2 outline-none resize-none placeholder-gray-400"
              placeholder="Description (optional)"
              value={question.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={1}
            />

            {/* Visibility Logic Settings */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-700">Show this section only if:</p>
              {previousChoiceQuestions.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Add a multiple choice or dropdown question above this section to enable logic jumps.</p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-primary-500"
                    value={question.visibilityRule?.questionId || ''}
                    onChange={(e) => onChange({ 
                      visibilityRule: { ...question.visibilityRule, questionId: e.target.value, optionValue: '' } 
                    })}
                  >
                    <option value="">Always show this section</option>
                    {previousChoiceQuestions.map(q => (
                      <option key={q.id} value={q.id}>{q.title || 'Untitled Question'}</option>
                    ))}
                  </select>

                  {question.visibilityRule?.questionId && (
                    <select 
                      className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-primary-500"
                      value={question.visibilityRule?.optionValue || ''}
                      onChange={(e) => onChange({ 
                        visibilityRule: { ...question.visibilityRule, optionValue: e.target.value } 
                      })}
                    >
                      <option value="">Select option...</option>
                      {previousChoiceQuestions.find(q => q.id === question.visibilityRule.questionId)?.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // QUESTION UI
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                className="flex-1 text-base font-medium text-gray-900 bg-gray-50 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:border-b-2 focus:bg-gray-100 px-4 py-3 outline-none transition-all placeholder-gray-500"
                placeholder="Question title"
                value={question.title}
                onChange={(e) => onChange({ title: e.target.value })}
              />
              <select
                className="sm:w-48 bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all cursor-pointer"
                value={question.type}
                onChange={(e) => onChange({ type: e.target.value })}
              >
                <option value="text">Short Answer</option>
                <option value="paragraph">Paragraph</option>
                <option value="radio">Multiple Choice</option>
                <option value="checkbox">Checkboxes</option>
                <option value="dropdown">Dropdown</option>
                <option value="date">Date</option>
                <option value="file">File Upload</option>
              </select>
            </div>

            <div className="mb-4">
              {question.type === 'text' && (
                <div className="w-1/2 border-b border-gray-300 pb-2 text-gray-400">Short answer text</div>
              )}
              {question.type === 'paragraph' && (
                <div className="w-full border-b border-gray-300 pb-2 text-gray-400">Long answer text</div>
              )}
              {question.type === 'date' && (
                <div className="w-[150px] border-b border-gray-300 pb-2 text-gray-400 flex items-center">MM/DD/YYYY</div>
              )}
              {question.type === 'file' && (
                <div className="w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 flex flex-col items-center justify-center">
                  <span className="text-sm">Respondents will be able to upload a file to Google Drive here</span>
                </div>
              )}
              {['radio', 'checkbox', 'dropdown'].includes(question.type) && (
                <MultipleChoiceEditor
                  type={question.type}
                  options={question.options || []}
                  onChange={(options) => onChange({ options })}
                />
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="border-t border-gray-100 bg-white px-6 py-3 flex items-center w-full rounded-b-lg">
        {isSection && isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddQuestion(); }}
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium mr-auto hover:bg-primary-50 px-3 py-1.5 rounded-md transition-colors"
          >
            <span className="text-lg leading-none font-bold">+</span>
            <span>Add Question to this Section</span>
          </button>
        )}
        
        <div className="flex items-center space-x-4 ml-auto">
          {!isSection && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Duplicate functionality not fully implemented, acts as Add Question for now
                onAddQuestion();
              }}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Duplicate"
            >
              <Copy className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onDelete}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title={isSection ? "Delete section" : "Delete question"}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-gray-300"></div>

          {!isSection && (
            <label className="flex items-center space-x-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-600">Required</span>
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={question.required || false}
                  onChange={(e) => onChange({ required: e.target.checked })}
                />
                <div className={`block w-9 h-5 rounded-full transition-colors ${question.required ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${question.required ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          )}
          
          <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
