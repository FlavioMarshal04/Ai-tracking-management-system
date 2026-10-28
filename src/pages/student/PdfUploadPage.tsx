import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StudyDocument } from '../../types/index.ts';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import {
  FileUp,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Layers,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export function PdfUploadPage({ onNavigate, initialSubjectId }: { onNavigate: (tab: string, state?: any) => void; initialSubjectId?: string }) {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'sub-dsa');
  const [documentTitle, setDocumentTitle] = useState('');
  const [previewDoc, setPreviewDoc] = useState<StudyDocument | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, subsRes] = await Promise.all([
        api.getDocuments(),
        api.getSubjects(),
      ]);
      setDocuments(docsRes.documents || []);
      setSubjects(subsRes.subjects || []);
      if (!initialSubjectId && subsRes.subjects?.length > 0) {
        setSelectedSubjectId(subsRes.subjects[0].id);
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading study documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a valid PDF document (.pdf).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds the 15MB limit.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', selectedSubjectId);
      formData.append('title', documentTitle.trim() || file.name.replace(/\.[^/.]+$/, ''));

      const res = await api.uploadDocument(formData);
      showToast(res.message, 'success');
      setDocumentTitle('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error processing PDF upload', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Instant curriculum presets for fast testing
  const handleLoadCurriculumPreset = async (presetType: 'DSA' | 'OS' | 'DL') => {
    setUploading(true);
    try {
      let title = '';
      let subjectId = '';
      let textContent = '';
      let filename = '';

      if (presetType === 'DSA') {
        title = 'Graph Traversal & Shortest Path Formulations';
        subjectId = 'sub-dsa';
        filename = 'CS201_Graph_Algorithms_Module4.pdf';
        textContent = `
Module 4: Graph Algorithms and Priority Queue Implementations.
Section 4.1: Dijkstra's Single-Source Shortest Path Algorithm.
Dijkstra's algorithm solves the single-source shortest-paths problem on a directed, weighted graph G = (V, E) where all edge weights are non-negative.
Using a binary min-heap, Dijkstra achieves O((V + E) log V). With a Fibonacci heap, decrease-key amortizes to O(1), yielding O(E + V log V).
Crucial Invariant: Once a vertex u is extracted from the priority queue, dist[u] is guaranteed to be optimal. If negative edge weights exist, this greedy property is violated.
Section 4.2: Bellman-Ford Dynamic Programming and Negative Cycles.
The Bellman-Ford algorithm relaxes all edges V-1 times. It correctly computes shortest paths in graphs with negative edges in O(V * E).
If after V-1 passes, an edge (u, v) satisfies dist[u] + w(u, v) < dist[v], then a reachable negative-weight cycle exists.
Section 4.3: Minimum Spanning Trees (MST).
Prim's algorithm grows a single tree using greedy cuts, running in O(E + V log V). Kruskal's algorithm utilizes a Disjoint-Set Union (DSU) data structure.
        `;
      } else if (presetType === 'OS') {
        title = 'Virtual Memory & Multi-Level Paging Architecture';
        subjectId = 'sub-os';
        filename = 'CS304_OS_Virtual_Memory_Paging.pdf';
        textContent = `
Chapter 8: Virtual Memory and Paging Systems.
Section 8.1: Hardware Memory Management Unit (MMU) & Multi-Level Page Tables.
Virtual memory maps process logical addresses to physical DRAM frames. Modern 64-bit systems utilize 4-level paging structures to minimize sparse memory footprint.
Section 8.2: Translation Lookaside Buffer (TLB).
The TLB is an associative hardware cache storing virtual page to physical frame translations. TLB hit provides single-cycle access. TLB miss incurs memory bus traversal.
Section 8.3: Page Replacement Algorithms.
Least Recently Used (LRU) is a stack algorithm immune to Belady's Anomaly. FIFO suffers from Belady's anomaly where more frames increase fault frequency.
Section 8.4: Thrashing and Working Set.
Thrashing occurs when total working set sizes exceed physical frame capacity, reducing CPU throughput to near zero due to continuous page fault I/O.
        `;
      } else {
        title = 'Self-Attention and Transformer Architecture';
        subjectId = 'sub-dl';
        filename = 'AI401_Attention_and_Transformers.pdf';
        textContent = `
Deep Learning Module 7: Attention Mechanisms and Transformers.
Section 7.1: Scaled Dot-Product Attention.
Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. The scaling factor 1/sqrt(d_k) prevents dot products from growing excessively large, avoiding vanishing gradients in softmax.
Section 7.2: Multi-Head Attention.
Linearly projects queries, keys, and values h times with different learned parameter matrices, allowing the model to jointly attend to multiple representation subspaces.
Section 7.3: Positional Encoding.
Since self-attention is permutation-equivariant, positional encodings (sinusoidal or rotary embeddings RoPE) inject sequence order information.
        `;
      }

      await api.uploadSimulatedDocument({
        title,
        subjectId,
        textContent,
        originalFilename: filename,
      });

      showToast(`Loaded curriculum preset: "${title}"`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to load preset', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      showToast('Document removed', 'info');
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      showToast(err.message || 'Error deleting document', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Scanning uploaded course documents..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          PDF Lecture & Curriculum Ingestion
        </h1>
        <p className="text-sm text-slate-500">
          Upload PDF lecture notes or textbook chapters. EduPulse extracts topics, chunks text, and
          prepares AI-generated assessments.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File drop area */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-violet-200 hover:border-[#6D28D9] bg-violet-50/30 hover:bg-violet-50/60 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-2xl bg-white text-[#6D28D9] shadow-xs flex items-center justify-center mb-3">
                <FileUp className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                Click or drag & drop a PDF document
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Supports syllabus modules, lecture slides, and notes (max 15MB)
              </p>
            </div>

            {/* Presets Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Sample Presets:</span>
              <button
                type="button"
                disabled={uploading}
                onClick={() => handleLoadCurriculumPreset('DSA')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 text-[#6D28D9] text-xs font-semibold transition-colors disabled:opacity-50"
              >
                + DSA Graphs
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => handleLoadCurriculumPreset('OS')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 text-[#6D28D9] text-xs font-semibold transition-colors disabled:opacity-50"
              >
                + OS Virtual Memory
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => handleLoadCurriculumPreset('DL')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 text-[#6D28D9] text-xs font-semibold transition-colors disabled:opacity-50"
              >
                + DL Transformers
              </button>
            </div>
          </div>

          {/* Config column */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Document Title (Optional)
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={e => setDocumentTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Graph Theory"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#6D28D9] bg-white text-slate-900"
              />
            </div>

            <div className="pt-2 text-xs text-slate-500 leading-relaxed">
              Upon upload, EduPulse will automatically run PDF extraction, create semantic text chunks,
              and identify key conceptual topics.
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-xs font-bold text-[#6D28D9] animate-pulse">
                <Clock className="w-4 h-4 animate-spin" />
                Parsing document & extracting topics...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Library List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Ingested Document Library</h2>

        {documents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="font-bold text-slate-800">No course documents ingested yet</div>
            <p className="text-xs text-slate-500 mt-1">
              Upload a PDF above or click one of the sample presets to test the AI extractor.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-violet-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-[#6D28D9] flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {doc.subjectName}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            doc.status === 'Processed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : doc.status === 'Processing'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {doc.status === 'Processed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {doc.status === 'Processing' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                          {doc.status === 'Failed' && <AlertCircle className="w-3.5 h-3.5" />}
                          {doc.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {Math.round(doc.fileSize / 1024)} KB
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">{doc.title}</h3>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">
                        {doc.originalFilename} · Uploaded by {doc.uploaderName || 'Student'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      title="Preview Extracted Content"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        onNavigate('generate-assessment', {
                          subjectId: doc.subjectId,
                          documentId: doc.id,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Test
                    </button>
                  </div>
                </div>

                {/* Topics Extracted */}
                {doc.topicsExtracted && doc.topicsExtracted.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Extracted Conceptual Topics:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.topicsExtracted.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Text Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Extracted Content: ${previewDoc.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pages</span>
                <span className="font-bold text-slate-800">{previewDoc.pageCount || 1}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Words</span>
                <span className="font-bold text-slate-800">{previewDoc.wordCount || 1200}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Chunks</span>
                <span className="font-bold text-slate-800">{previewDoc.chunkCount || 4}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Document Text Excerpt:
              </div>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {previewDoc.extractedSnippet ||
                  'No text excerpt available for this document.'}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
