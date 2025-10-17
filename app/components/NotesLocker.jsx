"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Pin,
  Archive,
  Trash2,
  X,
  MoreVertical,
  Edit3,
  Check,
  Grid3x3,
  List,
  Loader2,
  PinOff
} from "lucide-react";
import toast from "react-hot-toast";

const COLOR_OPTIONS = [
  { name: 'default', value: 'bg-gray-900 dark:bg-gray-800', border: 'border-emerald-800/30' },
  { name: 'red', value: 'bg-red-950/30', border: 'border-red-800/30' },
  { name: 'orange', value: 'bg-orange-950/30', border: 'border-orange-800/30' },
  { name: 'yellow', value: 'bg-yellow-950/30', border: 'border-yellow-800/30' },
  { name: 'green', value: 'bg-green-950/30', border: 'border-green-800/30' },
  { name: 'teal', value: 'bg-teal-950/30', border: 'border-teal-800/30' },
  { name: 'blue', value: 'bg-blue-950/30', border: 'border-blue-800/30' },
  { name: 'purple', value: 'bg-purple-950/30', border: 'border-purple-800/30' },
  { name: 'pink', value: 'bg-pink-950/30', border: 'border-pink-800/30' },
  { name: 'gray', value: 'bg-gray-800', border: 'border-gray-700' },
];

export default function NotesLocker() {
  const { user } = useUser();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showArchived, setShowArchived] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: 'default',
    tags: []
  });

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, showArchived]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notes?archived=${showArchived}&search=${searchQuery}`);
      const data = await response.json();

      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async () => {
    if (!newNote.content.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });

      const data = await response.json();

      if (data.success) {
        setNotes([data.note, ...notes]);
        setNewNote({ title: '', content: '', color: 'default', tags: [] });
        setIsCreating(false);
        toast.success('Note created successfully!');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNote = async (noteId, updates) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, ...updates })
      });

      const data = await response.json();

      if (data.success) {
        setNotes(notes.map(note => 
          note._id === noteId ? data.note : note
        ));
        toast.success('Note updated!');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes?noteId=${noteId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setNotes(notes.filter(note => note._id !== noteId));
        toast.success('Note deleted!');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const togglePin = async (note) => {
    await updateNote(note._id, { isPinned: !note.isPinned });
  };

  const toggleArchive = async (note) => {
    await updateNote(note._id, { isArchived: !note.isArchived });
  };

  const changeColor = async (note, color) => {
    await updateNote(note._id, { color });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const getColorClasses = (colorName) => {
    const colorOption = COLOR_OPTIONS.find(c => c.name === colorName) || COLOR_OPTIONS[0];
    return colorOption;
  };

  const pinnedNotes = notes.filter(note => note.isPinned);
  const unpinnedNotes = notes.filter(note => !note.isPinned);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please sign in to view your notes.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              📝 Notes Locker
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-emerald-950/50 text-gray-300 hover:text-emerald-400 rounded-lg transition-colors border border-emerald-800/30"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded-lg transition-colors border ${
                  showArchived
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-gray-900 text-gray-300 border-emerald-800/30 hover:bg-emerald-950/50 hover:text-emerald-400'
                }`}
              >
                {showArchived ? 'Show Active' : 'Show Archived'}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
            <Input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-12 py-6 text-lg bg-gray-900 border-emerald-800/30 text-gray-200 placeholder-gray-500"
            />
          </form>
        </div>

        {/* Create Note Card */}
        {!showArchived && (
          <Card className={`mb-8 p-4 border-2 transition-all duration-300 ${
            isCreating ? 'shadow-lg' : ''
          } ${getColorClasses(newNote.color).value} ${getColorClasses(newNote.color).border}`}>
            <Input
              placeholder="Title (optional)"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              onFocus={() => setIsCreating(true)}
              className="mb-2 border-0 bg-transparent text-lg font-semibold text-gray-200 placeholder-gray-500"
            />
            <Textarea
              placeholder="Take a note..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              onFocus={() => setIsCreating(true)}
              className="border-0 bg-transparent resize-none text-gray-200 placeholder-gray-500"
              rows={isCreating ? 4 : 1}
            />
            
            {isCreating && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setNewNote({ ...newNote, color: color.name })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color.value} ${
                        newNote.color === color.name 
                          ? 'ring-2 ring-emerald-600 scale-110' 
                          : 'hover:scale-110'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewNote({ title: '', content: '', color: 'default', tags: [] });
                    }}
                    className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNote}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-emerald-400 mb-4 uppercase tracking-wide">
                  Pinned
                </h2>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {pinnedNotes.map(note => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onTogglePin={togglePin}
                      onToggleArchive={toggleArchive}
                      onChangeColor={changeColor}
                      onDelete={deleteNote}
                      onUpdate={updateNote}
                      getColorClasses={getColorClasses}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-semibold text-emerald-400 mb-4 uppercase tracking-wide">
                    Others
                  </h2>
                )}
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {unpinnedNotes.map(note => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onTogglePin={togglePin}
                      onToggleArchive={toggleArchive}
                      onChangeColor={changeColor}
                      onDelete={deleteNote}
                      onUpdate={updateNote}
                      getColorClasses={getColorClasses}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {notes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-500">
                  {showArchived 
                    ? "You don't have any archived notes." 
                    : "Create your first note or use voice commands to get started!"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, onTogglePin, onToggleArchive, onChangeColor, onDelete, onUpdate, getColorClasses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editedNote, setEditedNote] = useState({
    title: note.title,
    content: note.content
  });

  const handleSave = () => {
    onUpdate(note._id, editedNote);
    setIsEditing(false);
  };

  const colorClasses = getColorClasses(note.color);

  return (
    <Card className={`p-4 group relative transition-all duration-300 hover:shadow-lg border-2 ${colorClasses.value} ${colorClasses.border}`}>
      {/* Pin Indicator */}
      {note.isPinned && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-emerald-600 text-white p-1 rounded-full shadow-lg">
            <Pin className="h-3 w-3 fill-current" />
          </div>
        </div>
      )}

      {/* Content */}
      {isEditing ? (
        <div>
          <Input
            value={editedNote.title}
            onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
            placeholder="Title"
            className="mb-2 border-0 bg-transparent font-semibold"
          />
          <Textarea
            value={editedNote.content}
            onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
            className="border-0 bg-transparent resize-none"
            rows={4}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedNote({ title: note.title, content: note.content });
              }}
              className="px-3 py-1 text-gray-400 rounded text-sm hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {note.title && (
            <h3 className="font-semibold text-lg mb-2 text-gray-200">
              {note.title}
            </h3>
          )}
          <p className="text-gray-300 whitespace-pre-wrap break-words">
            {note.content}
          </p>
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-800 text-xs rounded-full text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions - Show on hover */}
      {!isEditing && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-800/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={() => onTogglePin(note)}
              className="p-2 hover:bg-emerald-950/50 text-gray-400 hover:text-emerald-400 rounded-lg transition-colors"
              title={note.isPinned ? "Unpin" : "Pin"}
            >
              {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-emerald-950/50 text-gray-400 hover:text-emerald-400 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleArchive(note)}
              className="p-2 hover:bg-emerald-950/50 text-gray-400 hover:text-emerald-400 rounded-lg transition-colors"
              title={note.isArchived ? "Unarchive" : "Archive"}
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(note._id)}
              className="p-2 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-emerald-950/50 text-gray-400 hover:text-emerald-400 rounded-lg transition-colors"
              title="Change color"
            >
              <div className={`w-4 h-4 rounded-full border-2 ${colorClasses.value}`} />
            </button>
            
            {showColorPicker && (
              <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-900 rounded-lg shadow-xl border border-emerald-800/30 flex gap-1">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => {
                      onChangeColor(note, color.name);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${color.value} hover:scale-110`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-500 mt-2">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </Card>
  );
}
