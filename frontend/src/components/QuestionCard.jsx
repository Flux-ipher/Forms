import React from 'react';
import { Trash2, GripHorizontal } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MultipleChoiceEditor from './MultipleChoiceEditor';

export default function QuestionCard({ id, question, onChange, onDelete }) {
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

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-xl shadow-sm border ${isDragging ? 'border-primary-500 shadow-xl opacity-80' : 'border-gray-200'} overflow-visible group transition-all hover:shadow-md`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-1/2 -top-3 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white border border-gray-200 rounded px-2 py-0.5 shadow-sm z-20"
      >
        <GripHorizontal className="w-4 h-4 text-gray-400" />
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            className="flex-1 text-lg font-medium text-gray-900 bg-gray-50 border border-transparent hover:border-gray-300 focus:border-primary-500 focus:bg-white rounded-lg px-4 py-3 outline-none transition-all placeholder-gray-400"
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
          {['radio', 'checkbox', 'dropdown'].includes(question.type) && (
            <MultipleChoiceEditor
              type={question.type}
              options={question.options || []}
              onChange={(options) => onChange({ options })}
            />
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-3 flex justify-end items-center space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <span className="text-sm font-medium text-gray-600">Required</span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={question.required || false}
              onChange={(e) => onChange({ required: e.target.checked })}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${question.required ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${question.required ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
        
        <div className="w-px h-6 bg-gray-300"></div>

        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
          title="Delete question"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
