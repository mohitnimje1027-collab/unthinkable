import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ImageIcon, Send, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { createComplaint } from '../api/complaints';

const CATEGORIES = [
  { value: 'Plumbing', emoji: '🔧', desc: 'Leaks, clogs, pipe issues' },
  { value: 'Electrical', emoji: '⚡', desc: 'Power, wiring, fixtures' },
  { value: 'Cleaning', emoji: '🧹', desc: 'Common areas, sanitation' },
  { value: 'Security', emoji: '🔒', desc: 'Gates, cameras, access' },
  { value: 'Other', emoji: '📋', desc: 'Anything else' },
];

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function NewComplaint() {
  const [form, setForm] = useState({ category: '', description: '', priority: 'Medium' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const removePhoto = () => {
    setPhoto(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error('Please select a category'); return; }
    if (form.description.trim().length < 20) { toast.error('Description must be at least 20 characters'); return; }

    const fd = new FormData();
    fd.append('category', form.category);
    fd.append('description', form.description.trim());
    fd.append('priority', form.priority);
    if (photo) fd.append('photo', photo);

    setLoading(true);
    try {
      await createComplaint(fd);
      toast.success('Complaint submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit a Complaint</h1>
        <p className="text-slate-500 mt-1">Describe your issue and we'll get it resolved as soon as possible</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value })}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  form.category === cat.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <p className={`text-sm font-semibold ${form.category === cat.value ? 'text-primary-700' : 'text-slate-700'}`}>
                    {cat.value}
                  </p>
                  <p className="text-xs text-slate-400 leading-tight">{cat.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description + Priority */}
        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              placeholder="Describe the issue in detail (minimum 20 characters)..."
              className="input-field resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${form.description.length < 20 && form.description.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {form.description.length < 20 ? `${20 - form.description.length} more characters needed` : 'Good length ✓'}
              </span>
              <span className="text-xs text-slate-400">{form.description.length} chars</span>
            </div>
          </div>

          <div>
            <label className="label">Priority</label>
            <div className="flex gap-3">
              {PRIORITIES.map((p) => {
                const colors = {
                  Low: 'border-blue-500 bg-blue-50 text-blue-700',
                  Medium: 'border-orange-500 bg-orange-50 text-orange-700',
                  High: 'border-red-500 bg-red-50 text-red-700',
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                      form.priority === p ? colors[p] : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Photo upload */}
        <div className="card p-6">
          <label className="label">Photo (optional)</label>
          {!preview ? (
            <div
              onClick={() => fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragging ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-sm">Click to upload or drag & drop</p>
              <p className="text-slate-400 text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={preview} alt="Preview" className="w-full h-56 object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                <ImageIcon className="w-3 h-3" />
                {photo?.name}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
