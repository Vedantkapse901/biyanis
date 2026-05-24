import { useMemo, useState } from 'react';
import { Image as ImageIcon, Video, Download, FolderOpen, CalendarDays, X } from 'lucide-react';
import { useGalleryFolders } from '../hooks/useSupabaseData';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { AccentText } from '../components/ui/AccentText';
import { buildB2DisplayUrl, extractB2ObjectKey } from '../lib/b2MediaUrls';
import { ResolvedImage } from '../components/ResolvedImage';

function mediaSrc(item, preferThumbnail) {
  const url = preferThumbnail ? item?.thumbnail_url : item?.url;
  const fallback = preferThumbnail ? item?.url : item?.thumbnail_url;
  const src = (url && String(url).trim()) || (fallback && String(fallback).trim()) || '';
  if (extractB2ObjectKey(src)) return buildB2DisplayUrl(src);
  return src;
}

export function Gallery() {
  const { data: galleryFolders, loading } = useGalleryFolders();
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Process folders with their items
  const folders = useMemo(() => {
    if (!galleryFolders || !Array.isArray(galleryFolders)) return [];

    return galleryFolders
      .map((folder) => ({
        id: folder.id,
        name: folder.folder_name || 'Untitled Folder',
        eventDate: folder.event_date,
        displayOrder: folder.display_order,
        items: (folder.gallery_items || [])
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map(item => ({
            id: item.id,
            title: item.title || 'Untitled',
            type: item.type === 'video' ? 'video' : 'image',
            url: item.url,
            thumbnail_url: item.thumbnail_url,
            drive_link: item.drive_link,
            display_order: item.display_order,
          })),
        cover: folder.gallery_items?.[0] || null,
        driveLink: folder.gallery_items?.[0]?.drive_link || '',
      }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [galleryFolders]);

  if (loading) {
    return (
      <PageTransition>
        <div className="page-shell bg-[#F8F9FA] flex items-center justify-center">
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
        <div className="page-shell bg-[#F8F9FA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h1 className="mb-4 font-serif text-4xl font-bold text-[#0A0F2C] md:text-6xl">
                Event <AccentText>Gallery</AccentText>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Click a folder to explore photos and videos from our events.
              </p>
            </div>

            {folders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
                <FolderOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="font-semibold text-[#0A0F2C]">No gallery items yet</p>
                <p className="mt-2 text-sm">Add photos in the Admin panel under Gallery.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolder(folder)}
                    className="text-left"
                  >
                    <GlassCard className="overflow-hidden !p-0 hover:-translate-y-1 transition-transform">
                      <div className="relative h-52 bg-slate-100">
                        {folder.cover && mediaSrc(folder.cover, true) ? (
                          <img
                            src={mediaSrc(folder.cover, true)}
                            alt={folder.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const fallback = img.nextElementSibling;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 text-sm text-slate-500"
                          style={{ display: folder.cover && mediaSrc(folder.cover, true) ? 'none' : 'flex' }}
                        >
                          No preview available
                        </div>
                        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0A0F2C]">
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3.5 w-3.5" /> {folder.items.length} items
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 p-5">
                        <h3 className="text-lg font-bold text-[#0A0F2C]">{folder.name}</h3>
                        {folder.eventDate && (
                          <p className="flex items-center gap-2 text-sm text-slate-500">
                            <CalendarDays className="h-4 w-4 text-[#D90429]" />
                            {new Date(folder.eventDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
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
              <div>
                <h3 className="text-2xl font-bold text-[#0A0F2C]">{selectedFolder.name}</h3>
                {selectedFolder.eventDate && (
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(selectedFolder.eventDate).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedFolder(null)}
                className="shrink-0 rounded-full border border-slate-300 p-2 hover:border-[#D90429]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedFolder.items.length === 0 ? (
              <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-500">
                No items in this folder yet
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedFolder.items.map((item) => {
                    const src = item.type === 'video' ? mediaSrc(item, false) : mediaSrc(item, true) || mediaSrc(item, false);
                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center justify-between bg-slate-100 p-2">
                          <span className="text-xs font-semibold text-slate-700">{item.title}</span>
                          {item.type === 'video' ? (
                            <Video className="h-3.5 w-3.5 text-[#D90429]" />
                          ) : (
                            <ImageIcon className="h-3.5 w-3.5 text-[#D90429]" />
                          )}
                        </div>
                        {!src ? (
                          <div className="flex h-64 w-full items-center justify-center bg-slate-200 text-xs text-slate-500">
                            Missing media
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
                          <ResolvedImage
                            src={item.url || item.thumbnail_url}
                            alt={item.title}
                            className="h-64 w-full object-cover"
                            draggable="false"
                          />
                        )}
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
                    <Download className="h-4 w-4" /> Download All from Drive
                  </a>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
