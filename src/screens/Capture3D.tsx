import { useState, useRef } from 'react';
import { Upload, Box, Download, FileText, X, Eye } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  date: string;
}

export default function Capture3D() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: 'modelo_superior.stl', size: '2.4 MB', type: 'STL', date: '2026-10-08' },
    { name: 'scan_inferior.obj', size: '1.8 MB', type: 'OBJ', date: '2026-10-07' },
    { name: 'guia_quirurgica.stl', size: '3.1 MB', type: 'STL', date: '2026-10-05' },
  ]);
  const [dragOver, setDragOver] = useState(false);
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles: UploadedFile[] = droppedFiles.map(f => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      date: new Date().toISOString().split('T')[0],
    }));
    setFiles(prev => [...newFiles, ...prev]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const newFiles: UploadedFile[] = selected.map(f => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      date: new Date().toISOString().split('T')[0],
    }));
    setFiles(prev => [...newFiles, ...prev]);
    e.target.value = '';
  };

  const handleRemove = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-[20px] font-semibold text-navy">Captura 3D</h1>
        <p className="text-[13px] text-slate-text mt-0.5">Carga, visualiza y exporta modelos digitales</p>
      </div>

      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Dropzone */}
          <div className="col-span-2 flex flex-col gap-4">
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`card flex-1 min-h-[240px] flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all cursor-pointer ${
                dragOver ? 'border-blue-primary bg-blue-50/30' : 'border-black/10 hover:border-black/20'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept=".stl,.obj,.ply" multiple onChange={handleFileSelect} />
              <div className="w-14 h-14 rounded-2xl bg-pastel-blue flex items-center justify-center mb-4">
                <Upload size={22} className="text-blue-primary" strokeWidth={1.5} />
              </div>
              <div className="text-[15px] font-medium text-navy mb-1">Arrastra archivos aquí</div>
              <div className="text-[12px] text-slate-text mb-4">o haz click para seleccionar</div>
              <div className="flex gap-2">
                <span className="pill bg-black/5 text-[11px] text-slate-text">STL</span>
                <span className="pill bg-black/5 text-[11px] text-slate-text">OBJ</span>
                <span className="pill bg-black/5 text-[11px] text-slate-text">PLY</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary flex items-center gap-1.5">
                <Upload size={14} /> Subir modelo
              </button>
              <button className="btn-ghost flex items-center gap-1.5" disabled={!viewingFile}>
                <Eye size={14} /> Visualizar 3D
              </button>
              <button className="btn-ghost flex items-center gap-1.5" disabled={!viewingFile}>
                <Download size={14} /> Exportar
              </button>
            </div>
          </div>

          {/* Recent files */}
          <div className="card p-4 overflow-y-auto">
            <h3 className="text-[13px] font-semibold text-navy mb-3">Archivos recientes</h3>
            <div className="space-y-1.5">
              {files.map(file => (
                <div
                  key={file.name}
                  onClick={() => setViewingFile(file)}
                  className={`card-sm px-3 py-2.5 cursor-pointer transition-all ${
                    viewingFile?.name === file.name ? 'ring-1 ring-blue-primary/30 bg-blue-50/30' : 'hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pastel-lavender flex items-center justify-center">
                      <FileText size={13} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-navy truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-text">{file.type} · {file.size} · {file.date}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(file.name); }}
                      className="text-slate-text hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <div className="text-[12px] text-slate-text text-center py-4">Sin archivos</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
