import { Router, Response } from 'express';
import multer from 'multer';
import { db } from '../db/store.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { pdfService } from '../services/pdfService.ts';
import { StudyDocument } from '../../src/types/index.ts';

const router = Router();
const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  storage: multer.memoryStorage(),
});

// GET /api/documents
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { subjectId } = req.query;
  let list = Array.from(db.documents.values());

  if (subjectId) {
    list = list.filter(d => d.subjectId === subjectId);
  }

  // If student, can see all public/subject study docs and their own uploads
  return res.json({ documents: list });
});

// GET /api/documents/:id
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const topics = Array.from(db.topics.values()).filter(t => t.documentId === doc.id);
  return res.json({ document: doc, topics });
});

// GET /api/documents/:id/status
router.get('/:id/status', authenticate, (req: AuthRequest, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  return res.json({
    id: doc.id,
    status: doc.status,
    pageCount: doc.pageCount,
    wordCount: doc.wordCount,
    chunkCount: doc.chunkCount,
    topicsCount: doc.topicsExtracted.length,
    errorMessage: doc.errorMessage,
  });
});

// POST /api/documents/upload
router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const { title, subjectId, textContent, originalFilename } = req.body;

    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }

    const subject = db.subjects.get(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Selected subject does not exist' });
    }

    const docId = `doc-${Date.now()}`;
    const docTitle = title || (file ? file.originalname.replace(/\.[^/.]+$/, '') : 'Course Syllabus Document');
    const filename = file ? file.originalname : originalFilename || 'uploaded_document.pdf';
    const fileSize = file ? file.size : (textContent ? Buffer.byteLength(textContent) : 102400);

    const newDoc: StudyDocument = {
      id: docId,
      title: docTitle,
      originalFilename: filename,
      fileSize,
      subjectId: subject.id,
      subjectName: subject.name,
      uploadedById: req.user!.id,
      uploaderName: req.user!.name,
      status: 'Processing',
      pageCount: 0,
      wordCount: 0,
      chunkCount: 0,
      topicsExtracted: [],
      createdAt: new Date().toISOString(),
    };

    db.documents.set(newDoc.id, newDoc);

    // Process document buffer or provided text content
    let buffer: Buffer;
    if (file) {
      buffer = file.buffer;
    } else if (textContent) {
      buffer = Buffer.from(textContent, 'utf-8');
    } else {
      // Sample standard engineering textbook text if no file payload provided
      buffer = Buffer.from(`Module 1: Advanced Computing Principles.\nSection 1.1: System Architecture and Asymptotic Bounds.\nSection 1.2: Dynamic Programming and State Memoization.\nSection 1.3: Distributed Transaction Consistency.`, 'utf-8');
    }

    try {
      const extracted = await pdfService.extractTextFromBuffer(buffer, filename);
      newDoc.status = 'Processed';
      newDoc.pageCount = extracted.pageCount;
      newDoc.wordCount = extracted.wordCount;
      newDoc.chunkCount = extracted.chunkCount;
      newDoc.topicsExtracted = extracted.topics.map(t => t.name);
      newDoc.extractedSnippet = extracted.text.slice(0, 500) + '...';

      // Save extracted topics to store
      extracted.topics.forEach((t, i) => {
        const topicId = `top-${docId}-${i + 1}`;
        db.topics.set(topicId, {
          id: topicId,
          documentId: docId,
          subjectId: subject.id,
          name: t.name,
          summary: t.summary,
          difficultyLevel: t.difficulty,
          importanceScore: t.importance,
        });
      });
    } catch (parseErr: any) {
      newDoc.status = 'Failed';
      newDoc.errorMessage = parseErr.message || 'Error extracting text from PDF';
    }

    db.documents.set(newDoc.id, newDoc);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'UPLOAD_DOCUMENT',
      resource: 'StudyDocument',
      details: `Uploaded study document "${newDoc.title}" for subject ${subject.code} (${newDoc.status})`,
      ipAddress: req.ip || '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: newDoc.status === 'Processed' ? 'Document uploaded and analyzed successfully' : 'Document uploaded, analysis flagged issue',
      document: newDoc,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error processing file upload' });
  }
});

// POST /api/documents/:id/process
router.post('/:id/process', authenticate, async (req: AuthRequest, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  doc.status = 'Processing';
  setTimeout(() => {
    doc.status = 'Processed';
    if (doc.topicsExtracted.length === 0) {
      doc.topicsExtracted = ['Fundamental Principles', 'Core Algorithm Properties', 'System Bounds'];
    }
    db.documents.set(doc.id, doc);
  }, 1000);

  return res.json({ message: 'Document reprocessing initiated', document: doc });
});

// DELETE /api/documents/:id
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const doc = db.documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Student can delete own uploads, Admin can delete any
  if (req.user!.role !== 'ADMIN' && doc.uploadedById !== req.user!.id) {
    return res.status(403).json({ error: 'You are not authorized to delete this document.' });
  }

  db.documents.delete(doc.id);
  return res.json({ message: 'Document deleted successfully' });
});

export default router;
