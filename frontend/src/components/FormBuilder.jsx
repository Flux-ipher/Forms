import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';
import ShareModal from './ShareModal';
import FormEditorNav from './FormEditorNav';
import { PlusCircle, Save, ExternalLink, BarChart2, Share2, Palette, Image as ImageIcon, Loader, Type, Video, LayoutTemplate } from 'lucide-react';
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
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [activeId, setActiveId] = useState(null);

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

  const addQuestionAtIndex = (index = -1) => {
    const newQuestion = {
      id: Date.now().toString(),
      title: '',
      type: 'text',
      options: ['Option 1'],
      required: false
    };
    const newSchema = [...(form.schema || [])];

    // If we pass an index, insert after it. Otherwise append.
    if (index >= 0) {
      newSchema.splice(index + 1, 0, newQuestion);
    } else {
      newSchema.push(newQuestion);
    }

    handleUpdate({ schema: newSchema });
    setActiveId(newQuestion.id);
  };

  const addSectionAtIndex = (index = -1) => {
    const newSection = {
      id: Date.now().toString(),
      title: 'New Section',
      description: '',
      type: 'section',
      visibilityRule: null
    };
    const newSchema = [...(form.schema || [])];

    if (index >= 0) {
      newSchema.splice(index + 1, 0, newSection);
    } else {
      newSchema.push(newSection);
    }

    handleUpdate({ schema: newSchema });
    setActiveId(newSection.id);
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
  const coverImage = themeNode?.coverImage || null;
  const questions = form.schema?.filter(q => q.type !== 'theme' && q.type !== 'settings') || [];

  const updateTheme = (color, coverImg = coverImage) => {
    const newSchema = form.schema.filter(q => q.type !== 'theme');
    newSchema.push({ id: 'theme-settings', type: 'theme', color, coverImage: coverImg });
    handleUpdate({ schema: newSchema });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const { url } = await api.uploadFile(file);
      updateTheme(themeColor, url);
    } catch (err) {
      alert("Failed to upload cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div className="bg-[#f0ebf8] min-h-screen">
      <FormEditorNav />
      <div className="flex justify-center items-start pt-4 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 transition-all hover:shadow-md relative cursor-pointer"
            onClick={() => setActiveId(null)}
          >
            <div className="h-3 w-full" style={{ backgroundColor: themeColor }}></div>
            {coverImage && (
              <div className="w-full h-48 bg-gray-100 overflow-hidden relative group">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button 
                  onClick={() => updateTheme(themeColor, null)} 
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm backdrop-blur-sm"
                >
                  Remove Cover
                </button>
              </div>
            )}
            <div className="p-8 border-l-[6px] border-l-transparent">
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
                    isActive={activeId === q.id}
                    onFocus={() => setActiveId(q.id)}
                    onChange={(updates) => updateQuestion(q.id, updates)}
                    onDelete={() => deleteQuestion(q.id)}
                    onAddQuestion={() => addQuestionAtIndex(index)}
                    onAddSection={() => addSectionAtIndex(index)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>
      
      {/* If there are no questions, give an initial add button below the header */ }
  {
    questions.length === 0 && (
      <div className="flex justify-center mt-8">
        <button
          onClick={() => addQuestionAtIndex(-1)}
          className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 hover:text-primary-600 transition-colors shadow-sm font-medium"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add your first question</span>
        </button>
      </div>
    )
  }
      </div>
      {/* Top Right Floating Action Bar (Google Forms Style) */}
      <div className="fixed top-20 right-4 sm:right-8 z-50 flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="bg-white px-3 py-2 rounded-full shadow-md border border-gray-200 flex items-center space-x-3 sm:space-x-4">
          <label className="flex items-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors" title="Change Theme Color">
            <Palette className="w-5 h-5" />
            <input
              type="color"
              className="sr-only"
              value={themeColor}
              onChange={(e) => updateTheme(e.target.value)}
            />
          </label>
          <label className="flex items-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors" title="Upload Cover Image">
            {isUploadingCover ? <Loader className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={isUploadingCover}
            />
          </label>
          <div className="w-px h-5 bg-gray-200"></div>
          <button onClick={() => window.open(`/form/${id}`, '_blank')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors" title="Preview">
            <ExternalLink className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-gray-200"></div>
          <button onClick={() => navigate(`/analytics/${id}`)} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors" title="Analytics">
            <BarChart2 className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-gray-200"></div>
          <button onClick={() => setIsShareModalOpen(true)} className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm" title="Share Form">
            <Share2 className="w-4 h-4 mr-1.5" /> Share
          </button>
        </div>

        {/* Small Save Status Pill below/beside it */}
        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center text-xs text-gray-500">
          {isSaving ? (
            <span className="flex items-center text-yellow-600"><Save className="w-3 h-3 mr-1.5 animate-pulse" /> Saving...</span>
          ) : (
            <span className="flex items-center text-green-600"><Save className="w-3 h-3 mr-1.5" /> Saved</span>
          )}
        </div>
      </div>
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        formId={id} 
      />
    </div>
  );
}
