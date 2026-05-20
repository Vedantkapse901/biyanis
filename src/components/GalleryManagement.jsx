import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Loader, Link as LinkIcon } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { uploadAdminFile, buildStoragePath } from '../lib/mediaStorage';
import { buildB2DisplayUrl } from '../lib/b2MediaUrls';
import { ResolvedImage } from './ResolvedImage';

export function GalleryManagement({ items = [], onAdd, onUpdate, onDelete, loading = false }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAddNew = () => {
    setFormData({
      title: '',
      image_url: '',
      drive_link: '',
      category: 'all',
      display_order: items.length + 1,
    });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setImagePreview(item.image_url ? buildB2DisplayUrl(item.image_url) : null);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Show preview while uploading
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);

      const storagePath = buildStoragePath('gallery', file.name);
      const { url, storageRef } = await uploadAdminFile({ storagePath, file, contentType: file.type });

      setFormData({
        ...formData,
        image_url: storageRef,
        drive_link: '',
      });
      setImagePreview(url);

      console.log('✅ Gallery photo uploaded:', url);
    } catch (error) {
      console.error('❌ Photo upload failed:', error);
      alert('Photo upload failed: ' + error.message);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDriveLinkChange = (url) => {
    if (!url.trim()) {
      setFormData({
        ...formData,
        drive_link: '',
        image_url: '',
      });
      setImagePreview(null);
      return;
    }

    // Extract image URL from Google Drive share link
    // Format: https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
    // Convert to: https://drive.google.com/uc?export=view&id={FILE_ID}
    let imageUrl = url;
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      const fileId = match[1];
      imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    setFormData({
      ...formData,
      drive_link: url,
      image_url: imageUrl,
    });
    setImagePreview(imageUrl);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!formData.image_url && !formData.drive_link) {
      alert('Please upload a photo or add a Google Drive link');
      return;
    }

    const payload = {
      ...formData,
      image_url: formData.image_url || formData.drive_link,
    };

    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onAdd(payload);
    }

    setShowForm(false);
    setFormData(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this gallery item?')) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0A0F2C]">Gallery Management</h2>
        {!showForm && (
          <button
            onClick={handleAddNew}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
          >
            <Plus className="h-5 w-5" /> Add Photo
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && formData && (
        <GlassCard className="p-6 border-t-4 border-t-[#D90429]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#0A0F2C]">
                {editingId ? 'Edit Gallery Item' : 'Add Photo to Gallery'}
              </h3>
              <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Photo Title / Event Name *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Annual Fest 2026, Toppers Award"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., events, awards, campus"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    placeholder="1, 2, 3..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column - Photo Upload */}
              <div className="space-y-4">
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Upload Photo (Circular)
                  </label>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-[#D90429] transition-colors relative">
                    {uploading ? (
                      <>
                        <Loader className="h-5 w-5 text-[#D90429] animate-spin" />
                        <span className="text-sm text-slate-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-slate-400" />
                        <span className="text-sm text-slate-600">Click to upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Google Drive Link */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Or Google Drive Link
                  </label>
                  <div className="flex gap-2">
                    <LinkIcon className="h-5 w-5 text-slate-400 mt-2 flex-shrink-0" />
                    <input
                      type="url"
                      value={formData.drive_link}
                      onChange={(e) => handleDriveLinkChange(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none text-sm"
                    />
                  </div>
                  {formData.drive_link && (
                    <p className="mt-2 text-xs text-slate-500">
                      ✓ Link is ready. Preview shows below →
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="flex justify-center">
                <div className="relative">
                  <ResolvedImage
                    src={formData.image_url || imagePreview}
                    alt="Preview"
                    className="h-40 w-40 object-cover rounded-full border-4 border-[#D90429] shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5">
                    <span className="text-xs font-bold">✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading || uploading}
                className="flex-1 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
              >
                {loading ? '💾 Saving...' : '💾 Save Photo'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Gallery Grid */}
      {!showForm && (
        <>
          {items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => (
                <GlassCard key={item.id} className="p-4 text-center hover:shadow-lg transition-shadow">
                  {/* Circular Photo */}
                  <div className="relative mb-4 flex justify-center">
                    {item.image_url ? (
                      <ResolvedImage
                        src={item.image_url}
                        alt={item.title}
                        className="h-32 w-32 object-cover rounded-full border-4 border-slate-200 shadow-md"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-[#0A0F2C] text-sm line-clamp-2 mb-2">
                    {item.title}
                  </h4>

                  {/* Category */}
                  {item.category && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                      {item.category}
                    </p>
                  )}

                  {/* Link Status */}
                  {item.drive_link && (
                    <p className="text-xs text-green-600 font-semibold mb-3">
                      ✓ Google Drive Linked
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-center pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-6 text-center">
              <p className="text-slate-600">No gallery photos yet. Click "Add Photo" to get started.</p>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
