import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch {
  // Fallback
}

export interface ExtractedDocumentData {
  text: string;
  pageCount: number;
  wordCount: number;
  chunkCount: number;
  chunks: string[];
  topics: {
    name: string;
    summary: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    importance: number;
  }[];
}

export class PDFService {
  async extractTextFromBuffer(buffer: Buffer, originalFilename: string): Promise<ExtractedDocumentData> {
    if (!buffer || buffer.length === 0) {
      throw new Error('Uploaded document file is empty (0 bytes).');
    }

    let rawText = '';
    let pageCount = 1;

    try {
      const parseFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default || pdfParse;
      const pdfData = typeof parseFn === 'function' ? await parseFn(buffer) : null;
      if (pdfData && pdfData.text) {
        rawText = pdfData.text.trim();
        pageCount = pdfData.numpages || 1;
      } else {
        rawText = buffer.toString('utf-8').trim();
      }
    } catch (err: any) {
      console.warn('PDF parse encountered error, checking if plain text or simulation fallback:', err?.message);
      // Attempt UTF-8 decode in case user uploaded a text file disguised as pdf or fallback
      rawText = buffer.toString('utf-8').trim();
      if (!rawText || rawText.length < 20) {
        throw new Error('Failed to parse PDF document. The file may be corrupt, scanned without OCR, or password protected.');
      }
    }

    if (rawText.length < 50) {
      throw new Error('Document contains insufficient readable text (fewer than 50 characters). Scanned images require OCR preprocessing.');
    }

    // Clean whitespace and normalize
    const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Split text into semantic chunks (~800 words per chunk with 100-word overlap)
    const chunkSize = 800;
    const overlap = 100;
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunkWords = words.slice(i, i + chunkSize);
      chunks.push(chunkWords.join(' '));
      if (i + chunkSize >= words.length) break;
    }

    // Extract key conceptual topics based on heading patterns or keyword frequency
    const extractedTopics = this.extractTopicsFromText(cleanText, originalFilename);

    return {
      text: cleanText,
      pageCount,
      wordCount,
      chunkCount: chunks.length,
      chunks,
      topics: extractedTopics,
    };
  }

  private extractTopicsFromText(text: string, filename: string): { name: string; summary: string; difficulty: 'Easy' | 'Medium' | 'Hard'; importance: number }[] {
    const lines = text.split('\n');
    const topics: { name: string; summary: string; difficulty: 'Easy' | 'Medium' | 'Hard'; importance: number }[] = [];

    // Scan for headings, sections, or bullet points
    const headingRegex = /^(?:Chapter\s*\d+|Section\s*\d+|Module\s*\d+|[\d.]+\s+)([A-Za-z0-9\s,\-:]{4,50})$/i;
    const discoveredTitles: string[] = [];

    for (let line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(headingRegex);
      if (match && match[1]) {
        const title = match[1].trim();
        if (title.length > 5 && !discoveredTitles.includes(title)) {
          discoveredTitles.push(title);
        }
      }
    }

    if (discoveredTitles.length >= 2) {
      discoveredTitles.slice(0, 5).forEach((title, idx) => {
        topics.push({
          name: title,
          summary: `Core curriculum section extracted from ${path.basename(filename)}.`,
          difficulty: idx % 3 === 0 ? 'Medium' : idx % 3 === 1 ? 'Hard' : 'Easy',
          importance: 95 - idx * 5,
        });
      });
      return topics;
    }

    // Default heuristic topics derived from the document content keywords
    const lower = text.toLowerCase();
    const candidateKeywords = [
      { name: 'Algorithmic Complexity & Bounds', keywords: ['complexity', 'asymptotic', 'big-o', 'runtime', 'bound'], diff: 'Medium' as const },
      { name: 'Data Structures & Storage Representation', keywords: ['tree', 'graph', 'node', 'array', 'pointer', 'heap'], diff: 'Medium' as const },
      { name: 'Optimization & Dynamic Formulations', keywords: ['dynamic programming', 'optimal', 'greedy', 'heuristic'], diff: 'Hard' as const },
      { name: 'System Concurrency & Memory Management', keywords: ['process', 'thread', 'memory', 'paging', 'cache', 'lock'], diff: 'Hard' as const },
      { name: 'Foundational Theorems & Invariants', keywords: ['theorem', 'proof', 'property', 'invariant', 'lemma'], diff: 'Easy' as const },
    ];

    for (const cand of candidateKeywords) {
      const match = cand.keywords.some(kw => lower.includes(kw));
      if (match) {
        topics.push({
          name: cand.name,
          summary: `Key theoretical concepts and analytical principles identified in the text.`,
          difficulty: cand.diff,
          importance: 90 - topics.length * 4,
        });
      }
    }

    if (topics.length === 0) {
      topics.push({
        name: `${path.basename(filename, path.extname(filename)).replace(/[_-]/g, ' ')} Concepts`,
        summary: 'Primary subject matter extracted from the uploaded document.',
        difficulty: 'Medium',
        importance: 85,
      });
    }

    return topics.slice(0, 5);
  }
}

export const pdfService = new PDFService();
