import { useMemo, useState } from 'react';
import { Image as ImageIcon, Video, Download, FolderOpen, CalendarDays, X } from 'lucide-react';
import { useGalleryFolders } from '../hooks/useSupabaseData';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';

function normalizeGallery(raw) {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => ({
    ...item,
    id: item.id ?? idx + 1,
    type: item.type === 'video' ? 'video' : 'image',
    folder: (item.folder && String(item.folder).trim()) || (item.title && String(item.title).trim()) || 'Untitled Folder',
  }));
}

function mediaSrc(item, preferThumbnail) {
  const a = preferThumbnail ? item?.thumbnail : item?.url;
  const b = preferThumbnail ? item?.url : item?.thumbnail;
  const s = (a && String(a).trim()) || (b && String(b).trim()) || '';
  return s;
}

export function Gallery() {
  const { data: galleryFolders, loading } = useGalleryFolders();
  const [selectedFolder, setSelectedFolder] = useState(null);

  const galleryItems = useMemo(() => normalizeGallery(galleryFolders), [galleryFolders]);

  const folderMap = useMemo(() => {
    const map = new Map();
    galleryItems.forEach((item) => {
      const folder = item.folder;
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder).push(item);
    });
    return map;
  }, [galleryItems]);

  const folders = Array.from(folderMap.entries()).map(([name, items]) => ({
    name,
    items,
    cover: items[0],
    driveLink: items.find((i) => i.driveLink && String(i.driveLink).trim())?.driveLink || items[0]?.driveLink || '',
  }));

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading gallery...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <>
      <PageTransition>
        <div className="min-h-screen bg-[#F8F9FA] pb-24 pt-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
                Event <AccentText>Gallery</AccentText>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Click a folder to view photos/videos. Downloads are available only via the folder Drive link.
              </p>
            </div>

            {folders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
                <FolderOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="font-semibold text-[#0A0F2C]">No gallery folders yet</p>
                <p className="mt-2 text-sm">Add items in the Admin panel under Gallery.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {folders.map((folder) => (
                  <button
                    key={folder.name}
                    type="button"
                    onClick={() => setSelectedFolder(folder)}
                    className="text-left"
                  >
                    <GlassCard className="overflow-hidden !p-0 hover:-translate-y-1">
                      <div className="relative h-52 bg-slate-100">
                        {folder.cover?.type === 'video' && mediaSrc(folder.cover, false) ? (
                          <video
                            src={mediaSrc(folder.cover, false)}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : mediaSrc(folder.cover, true) || mediaSrc(folder.cover, false) ? (
                          <img
                            src={mediaSrc(folder.cover, true) || mediaSrc(folder.cover, false)}
                            alt={folder.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                            No preview
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0A0F2C]">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3.5 w-3.5" /> Folder
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 p-5">
                        <h3 className="text-lg font-bold text-[#0A0F2C]">{folder.name}</h3>
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays className="h-4 w-4 text-[#D90429]" />
                          {folder.cover?.eventDate || 'Date not set'}
                        </p>
                        <p className="text-xs text-slate-500">{folder.items.length} item(s)</p>
                      </div>
                    </GlassCard>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>

      {selectedFolder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#0A0F2C]/70"
            aria-label="Close gallery"
            onClick={() => setSelectedFolder(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-[#0A0F2C]">{selectedFolder.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedFolder(null)}
                className="shrink-0 rounded-full border border-slate-300 p-2 hover:border-[#D90429]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {selectedFolder.items.map((item) => {
                const src = item.type === 'video' ? mediaSrc(item, false) : mediaSrc(item, true) || mediaSrc(item, false);
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <div className="p-2 text-xs font-semibold text-slate-600">{item.title}</div>
                    {!src ? (
                      <div className="flex h-64 w-full items-center justify-center bg-slate-200 text-xs text-slate-500">
                        Missing media — add URL or upload in Admin
                      </div>
                    ) : item.type === 'video' ? (
                      <video
                        src={src}
                        className="h-64 w-full object-cover"
                        controls
                        controlsList="nodownload"
                        preload="metadata"
                      />
                    ) : (
                      <img src={src} alt={item.title} className="h-64 w-full object-cover" draggable="false" />
                    )}
                    <div className="p-2 text-xs text-slate-500">
                      {item.type === 'video' ? (
                        <Video className="mr-1 inline h-3.5 w-3.5" />
                      ) : (
                        <ImageIcon className="mr-1 inline h-3.5 w-3.5" />
                      )}
                      Preview only inside gallery
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedFolder.driveLink && String(selectedFolder.driveLink).trim() ? (
              <a
                href={selectedFolder.driveLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b00320]"
              >
                <Download className="h-4 w-4" /> Download from Drive Folder
              </a>
            ) : (
              <p className="mt-6 text-sm text-amber-700">Add a Drive link for this folder in Admin (per item or first item).</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
