import { describe, it, expect } from 'vitest';
import { pdfService } from '../server/services/pdfService.ts';
import { aiService } from '../server/services/aiService.ts';

describe('PDF Ingestion & AI Question Generation Pipeline', () => {
  it('extracts text, chunks, and semantic topics from text buffer', async () => {
    const sampleBuffer = Buffer.from(`
Module 4: Graph Algorithms and Priority Queue Implementations.
Section 4.1: Dijkstra's Single-Source Shortest Path Algorithm.
Dijkstra's algorithm solves the single-source shortest-paths problem on a directed, weighted graph.
Section 4.2: Bellman-Ford Dynamic Programming and Negative Cycles.
The Bellman-Ford algorithm relaxes all edges V-1 times and detects negative cycles.
    `, 'utf-8');

    const result = await pdfService.extractTextFromBuffer(sampleBuffer, 'CS201_Graphs.pdf');

    expect(result).toBeDefined();
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
    expect(result.wordCount).toBeGreaterThan(15);
    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.topics.length).toBeGreaterThan(0);
  });

  it('generates structured questions via development sample provider when offline', async () => {
    const result = await aiService.generateQuestions({
      subjectName: 'Data Structures & Algorithms',
      topicName: "Dijkstra's Algorithm",
      type: 'MIXED',
      difficulty: 'Medium',
      questionCount: 3,
    });

    expect(result).toBeDefined();
    expect(result.questions.length).toBe(3);
    expect(result.isSample).toBe(true);
    expect(result.questions[0].prompt).toBeDefined();
    expect(result.questions[0].correctAnswer).toBeDefined();
    expect(result.questions[0].explanation).toBeDefined();
  });
});
