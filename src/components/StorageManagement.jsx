import { useEffect, useState } from 'react';
import { HardDrive, Trash2, RefreshCw, Download } from 'lucide-react';
import { listB2Files, deleteFromB2 } from '../lib/b2storage';
import { GlassCard } from './ui/GlassCard';

export function StorageManagement({ saveStatus, setSaveStatus }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadFiles = async () => {
    setLoading(true);
    try {
      setSaveStatus('Loading files from B2 storage...');
      const result = await listB2Files('', 1000);
      const fileList = result.files || [];
      setFiles(fileList);
      setSaveStatus(`✓ Loaded ${fileList.length} files from B2`);
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (error) {
      console.error('Failed to load files:', error);
      setSaveStatus(`✗ Error loading files: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const deleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Delete ${fileName}? This cannot be undone.`)) {
      return;
    }

    try {
      setSaveStatus(`Deleting ${fileName}...`);
      await deleteFromB2(fileName, fileId);
      setFiles(files.filter((f) => f.fileId !== fileId));
      setSaveStatus(`✓ ${fileName} deleted successfully`);
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (error) {
      console.error('Failed to delete file:', error);
      setSaveStatus(`✗ Delete failed: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    if (['pdf'].includes(ext)) return 'pdf';
    return 'file';
  };

  const getFileFolder = (fileName) => {
    if (fileName.includes('documents/')) return 'Documents';
    if (fileName.includes('slides/')) return 'Slides';
    if (fileName.includes('gallery/')) return 'Gallery';
    if (fileName.includes('results/')) return 'Results';
    return 'Other';
  };

  const filteredFiles = filter === 'all' ? files : files.filter((f) => getFileType(f.fileName) === filter);

  const stats = {
    total: files.length,
    images: files.filter((f) => getFileType(f.fileName) === 'image').length,
    videos: files.filter((f) => getFileType(f.fileName) === 'video').length,
    pdfs: files.filter((f) => getFileType(f.fileName) === 'pdf').length,
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <GlassCard className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0A0F2C]">{stats.total}</div>
            <div className="text-xs font-semibold text-slate-600">Total Files</div>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0A0F2C]">{stats.images}</div>
            <div className="text-xs font-semibold text-slate-600">Images</div>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0A0F2C]">{stats.videos}</div>
            <div className="text-xs font-semibold text-slate-600">Videos</div>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0A0F2C]">{stats.pdfs}</div>
            <div className="text-xs font-semibold text-slate-600">PDFs</div>
          </div>
        </GlassCard>
        <GlassCard className="bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="text-center">
            <HardDrive className="mx-auto h-5 w-5 text-[#D90429]" />
            <div className="text-xs font-semibold text-slate-600">Backblaze B2</div>
          </div>
        </GlassCard>
      </div>

      {/* Controls */}
      <GlassCard className="bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold text-[#0A0F2C]">File Management</h2>
          <button
            type="button"
            onClick={loadFiles}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#0A0F2C] px-4 py-2 text-white transition-colors disabled:opacity-50 hover:bg-[#D90429]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['all', 'image', 'video', 'pdf'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                filter === type
                  ? 'bg-[#D90429] text-white'
                  : 'border border-slate-300 bg-white text-slate-600 hover:border-[#D90429]'
              }`}
            >
              {type === 'all' ? 'All Files' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Files List */}
      <GlassCard className="bg-white">
        {filteredFiles.length === 0 ? (
          <div className="py-12 text-center">
            <HardDrive className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-500">No files in B2 storage</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.fileId}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-200 text-xs font-bold text-slate-600">
                      {file.fileName.split('.').pop().substring(0, 3).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#0A0F2C]">{file.fileName.split('/').pop()}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="rounded bg-slate-200 px-2 py-1">{getFileFolder(file.fileName)}</span>
                        <span>{formatSize(file.contentLength)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_B2_BUCKET_NAME ? `https://f001.backblazeb2.com/file/${import.meta.env.VITE_B2_BUCKET_NAME}/${encodeURIComponent(file.fileName)}` : '#'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded bg-blue-100 px-3 py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-200"
                    title="Download file"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteFile(file.fileId, file.fileName)}
                    className="flex items-center gap-1 rounded bg-red-100 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-200"
                    title="Delete file"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Info */}
      <GlassCard className="border-l-4 border-l-blue-500 bg-blue-50">
        <h3 className="mb-2 font-bold text-blue-900">About Backblaze B2</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>✓ All files are stored securely on Backblaze B2 cloud storage</li>
          <li>✓ Files are publicly accessible via direct URLs</li>
          <li>✓ You can delete files here to free up storage space</li>
          <li>✓ When you upload files in admin panels, they automatically go to B2</li>
        </ul>
      </GlassCard>
    </div>
  );
}
