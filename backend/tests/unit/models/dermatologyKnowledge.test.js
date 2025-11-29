const mongoose = require('mongoose');
const DermatologyKnowledge = require('../../../models/skin-study/DermatologyKnowledge');

describe('DermatologyKnowledge Model', () => {
  describe('Schema Validation', () => {
    test('should create valid dermatology knowledge with required fields', () => {
      const validKnowledge = new DermatologyKnowledge({
        category: 'skin-conditions',
        subcategory: 'acne',
        title: 'Understanding Acne',
        content: 'Acne is a common skin condition that occurs when hair follicles become clogged.',
        sourceReference: 'Dermatology Textbook Chapter 5'
      });

      expect(validKnowledge.category).toBe('skin-conditions');
      expect(validKnowledge.subcategory).toBe('acne');
      expect(validKnowledge.title).toBe('Understanding Acne');
      expect(validKnowledge.content).toBeTruthy();
      expect(validKnowledge.sourceReference).toBe('Dermatology Textbook Chapter 5');
    });

    test('should require category field', () => {
      const knowledge = new DermatologyKnowledge({
        subcategory: 'acne',
        title: 'Test',
        content: 'Test content',
        sourceReference: 'Test source'
      });
      const error = knowledge.validateSync();
      
      expect(error.errors.category).toBeDefined();
    });

    test('should require subcategory field', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'skin-conditions',
        title: 'Test',
        content: 'Test content',
        sourceReference: 'Test source'
      });
      const error = knowledge.validateSync();
      
      expect(error.errors.subcategory).toBeDefined();
    });

    test('should require title field', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'skin-conditions',
        subcategory: 'acne',
        content: 'Test content',
        sourceReference: 'Test source'
      });
      const error = knowledge.validateSync();
      
      expect(error.errors.title).toBeDefined();
    });

    test('should require content field', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'skin-conditions',
        subcategory: 'acne',
        title: 'Test',
        sourceReference: 'Test source'
      });
      const error = knowledge.validateSync();
      
      expect(error.errors.content).toBeDefined();
    });

    test('should require sourceReference field', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'skin-conditions',
        subcategory: 'acne',
        title: 'Test',
        content: 'Test content'
      });
      const error = knowledge.validateSync();
      
      expect(error.errors.sourceReference).toBeDefined();
    });
  });

  describe('Category Enum Validation', () => {
    test('should accept valid category: skin-conditions', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'skin-conditions',
        subcategory: 'test',
        title: 'Test',
        content: 'Test content',
        sourceReference: 'Test source'
      });

      expect(knowledge.category).toBe('skin-conditions');
    });

    test('should accept valid category: ingredients', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'ingredients',
        subcategory: 'retinol',
        title: 'Retinol Benefits',
        content: 'Test content',
        sourceReference: 'Test source'
      });

      expect(knowledge.category).toBe('ingredients');
    });

    test('should accept valid category: treatments', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'treatments',
        subcategory: 'laser',
        title: 'Laser Treatment',
        content: 'Test content',
        sourceReference: 'Test source'
      });

      expect(knowledge.category).toBe('treatments');
    });

    test('should accept valid category: routines', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'routines',
        subcategory: 'morning',
        title: 'Morning Skincare',
        content: 'Test content',
        sourceReference: 'Test source'
      });

      expect(knowledge.category).toBe('routines');
    });

    test('should accept valid category: cosmetics', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'cosmetics',
        subcategory: 'makeup',
        title: 'Cosmetic Products',
        content: 'Test content',
        sourceReference: 'Test source'
      });

      expect(knowledge.category).toBe('cosmetics');
    });

    test('should accept valid category: procedures', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'procedures',
        subcategory: 'chemical-peel',
        title: 'Chemical Peels',
        content: 'Test content',
        sourceReference: 'Test source'
      });

      expect(knowledge.category).toBe('procedures');
    });

    test('should accept valid category: general-advice', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'general-advice',
        subcategory: 'sun-protection',
        title: 'Sun Protection Tips',
        content: 'Test content',
        sourceReference: 'Test source'
      });

      expect(knowledge.category).toBe('general-advice');
    });

    test('should reject invalid category', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'invalid-category',
        subcategory: 'test',
        title: 'Test',
        content: 'Test content',
        sourceReference: 'Test source'
      });
      const error = knowledge.validateSync();
      
      expect(error.errors.category).toBeDefined();
    });
  });

  describe('Optional Fields', () => {
    test('should accept keywords array', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'ingredients',
        subcategory: 'vitamin-c',
        title: 'Vitamin C Benefits',
        content: 'Test content',
        sourceReference: 'Test source',
        keywords: ['vitamin-c', 'antioxidant', 'brightening', 'collagen']
      });

      expect(knowledge.keywords).toHaveLength(4);
      expect(knowledge.keywords).toContain('vitamin-c');
      expect(knowledge.keywords).toContain('antioxidant');
    });

    test('should accept source tracking fields', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'skin-conditions',
        subcategory: 'eczema',
        title: 'Eczema Management',
        content: 'Test content',
        sourceReference: 'Dermatology Manual',
        chapterNumber: '12',
        chapterTitle: 'Inflammatory Skin Conditions',
        pageReference: 'pp. 245-267'
      });

      expect(knowledge.chapterNumber).toBe('12');
      expect(knowledge.chapterTitle).toBe('Inflammatory Skin Conditions');
      expect(knowledge.pageReference).toBe('pp. 245-267');
    });

    test('should have verified field', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'treatments',
        subcategory: 'topical',
        title: 'Topical Treatments',
        content: 'Test content',
        sourceReference: 'Test source',
        verified: true
      });

      expect(knowledge.verified).toBe(true);
    });
  });

  describe('Complete Knowledge Entry', () => {
    test('should create complete knowledge entry with all fields', () => {
      const knowledge = new DermatologyKnowledge({
        category: 'ingredients',
        subcategory: 'retinoids',
        title: 'Comprehensive Guide to Retinoids',
        content: 'Retinoids are vitamin A derivatives widely used in dermatology for treating acne, photoaging, and other skin conditions.',
        keywords: ['retinol', 'tretinoin', 'anti-aging', 'acne-treatment'],
        sourceReference: 'Clinical Dermatology: A Color Guide to Diagnosis and Therapy',
        chapterNumber: '23',
        chapterTitle: 'Topical Therapy',
        pageReference: 'pp. 892-910',
        verified: true
      });

      expect(knowledge.category).toBe('ingredients');
      expect(knowledge.subcategory).toBe('retinoids');
      expect(knowledge.title).toBeTruthy();
      expect(knowledge.content).toBeTruthy();
      expect(knowledge.keywords).toHaveLength(4);
      expect(knowledge.verified).toBe(true);
      expect(knowledge.chapterNumber).toBe('23');
    });
  });
});
