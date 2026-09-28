import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';
import ShareModal from './ShareModal';
import { PlusCircle, Save, ExternalLink, BarChart2, Share2, Palette } from 'lucide-react';
import debounce from 'lodash.debounce';
import { api } from '../api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      api.getForm(id).then(setForm).catch(console.error);
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
    const updatedForm = { ...form, ...updates };
    setForm(updatedForm);
    debouncedSave(updatedForm);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      title: '',
      type: 'text',
      options: ['Option 1'],
      required: false
    };
    handleUpdate({ schema: [...(form.schema || []), newQuestion] });
  };

  const addQuestionAtIndex = (index) => {
    const newQuestion = {
      id: Date.now().toString(),
      title: '',
      type: 'text',
      options: ['Option 1'],
      required: false
    };
    const newSchema = [...(form.schema || [])];
    newSchema.splice(index + 1, 0, newQuestion);
    handleUpdate({ schema: newSchema });
  };

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: 'New Section',
      description: '',
      type: 'section',
      visibilityRule: null
    };
    handleUpdate({ schema: [...(form.schema || []), newSection] });
  };

  const updateQuestion = (qId, updates) => {
    const newSchema = form.schema.map(q => q.id === qId ? { ...q, ...updates } : q);
    handleUpdate({ schema: newSchema });
  };

  const deleteQuestion = (qId) => {
    const newSchema = form.schema.filter(q => q.id !== qId);
    handleUpdate({ schema: newSchema });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = form.schema.findIndex((q) => q.id === active.id);
      const newIndex = form.schema.findIndex((q) => q.id === over.id);
      
      const newSchema = arrayMove(form.schema, oldIndex, newIndex);
      handleUpdate({ schema: newSchema });
    }
  };

  if (!form) return <div className="flex justify-center items-center h-64">Loading...</div>;

  const themeNode = form.schema?.find(q => q.type === 'theme');
  const themeColor = themeNode?.color || '#3b82f6';
  const questions = form.schema?.filter(q => q.type !== 'theme') || [];

  const updateTheme = (color) => {
    const newSchema = form.schema.filter(q => q.type !== 'theme');
    newSchema.push({ id: 'theme-settings', type: 'theme', color });
    handleUpdate({ schema: newSchema });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all hover:shadow-md relative">
        <div className="h-3 w-full" style={{ backgroundColor: themeColor }}></div>
        <div className="absolute top-8 right-8">
          <label className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 shadow-sm" title="Change Theme Color">
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Theme</span>
            <input 
              type="color" 
              className="sr-only" 
              value={themeColor} 
              onChange={(e) => updateTheme(e.target.value)} 
            />
          </label>
        </div>
        <div className="p-8">
          <input
            type="text"
            className="w-full text-4xl font-bold text-gray-900 border-none outline-none focus:ring-0 mb-4 placeholder-gray-300"
            placeholder="Form Title"
            value={form.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
          />
          <textarea
            className="w-full text-gray-600 border-none outline-none focus:ring-0 resize-none placeholder-gray-400"
            placeholder="Form Description"
            value={form.description || ''}
            onChange={(e) => handleUpdate({ description: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          <SortableContext
            items={questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q, index) => (
              <QuestionCard
                key={q.id}
                id={q.id}
                question={q}
                allQuestions={questions}
                index={index}
                onChange={(updates) => updateQuestion(q.id, updates)}
                onDelete={() => deleteQuestion(q.id)}
                onAddQuestionInside={() => addQuestionAtIndex(index)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={addQuestion}
          className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 hover:text-primary-600 transition-colors shadow-sm font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Question</span>
        </button>
        <button
          onClick={addSection}
          className="flex items-center space-x-2 bg-primary-50 border border-primary-200 text-primary-700 px-6 py-3 rounded-full hover:bg-primary-100 transition-colors shadow-sm font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Section</span>
        </button>
      </div>

      <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border border-gray-200 flex items-center space-x-3 sm:space-x-6 z-50 w-[90%] sm:w-max overflow-x-auto justify-between sm:justify-center">
        <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-[70px] sm:min-w-[100px] shrink-0">
          {isSaving ? (
            <span className="flex items-center text-yellow-600"><Save className="w-4 h-4 sm:mr-2 animate-pulse" /><span className="hidden sm:inline">Saving...</span></span>
          ) : (
            <span className="flex items-center text-green-600"><Save className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Saved</span></span>
          )}
        </div>
        <div className="w-px h-6 bg-gray-200 shrink-0"></div>
        <button onClick={() => setIsShareModalOpen(true)} className="flex items-center text-xs sm:text-sm text-gray-700 hover:text-primary-600 font-medium transition-colors shrink-0">
          <Share2 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Share</span>
        </button>
        <div className="w-px h-6 bg-gray-200 shrink-0"></div>
        <button onClick={() => window.open(`/form/${id}`, '_blank')} className="flex items-center text-xs sm:text-sm text-gray-700 hover:text-primary-600 font-medium transition-colors shrink-0">
          <ExternalLink className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Preview</span>
        </button>
        <div className="w-px h-6 bg-gray-200 shrink-0"></div>
        <button onClick={() => navigate(`/analytics/${id}`)} className="flex items-center text-xs sm:text-sm text-gray-700 hover:text-primary-600 font-medium transition-colors shrink-0">
          <BarChart2 className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Analytics</span>
        </button>
      </div>
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        formId={id} 
      />
    </div>
  );
}
