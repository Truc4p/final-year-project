const mongoose = require('mongoose');
const LiveStream = require('../../../models/livestream/liveStream');

describe('LiveStream Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid livestream with required fields', () => {
      const validLiveStream = new LiveStream({
        title: 'Test Livestream',
        description: 'Test description',
        streamUrl: 'https://stream.example.com/live123'
      });

      expect(validLiveStream.title).toBe('Test Livestream');
      expect(validLiveStream.description).toBe('Test description');
      expect(validLiveStream.streamUrl).toBe('https://stream.example.com/live123');
    });

    test('should require title field', () => {
      const livestream = new LiveStream({
        description: 'Test description'
      });
      const error = livestream.validateSync();
      
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.message).toContain('required');
    });

    test('should have default values', () => {
      const livestream = new LiveStream({
        title: 'Test Stream'
      });

      expect(livestream.description).toBe('');
      expect(livestream.videoUrl).toBe('');
      expect(livestream.streamUrl).toBe('');
      expect(livestream.thumbnailUrl).toBe('');
      expect(livestream.duration).toBe(0);
      expect(livestream.viewCount).toBe(0);
      expect(livestream.likes).toBe(0);
      expect(livestream.likedBy).toEqual([]);
      expect(livestream.startTime).toBeNull();
    });

    test('should trim whitespace from string fields', () => {
      const livestream = new LiveStream({
        title: '  Test Livestream  ',
        description: '  Test description  '
      });

      expect(livestream.title).toBe('Test Livestream');
      expect(livestream.description).toBe('Test description');
    });
  });

  describe('Field Types', () => {
    test('should accept number for duration', () => {
      const livestream = new LiveStream({
        title: 'Test Stream',
        duration: 3600
      });

      expect(livestream.duration).toBe(3600);
      expect(typeof livestream.duration).toBe('number');
    });

    test('should accept number for viewCount', () => {
      const livestream = new LiveStream({
        title: 'Test Stream',
        viewCount: 150
      });

      expect(livestream.viewCount).toBe(150);
    });

    test('should accept number for likes', () => {
      const livestream = new LiveStream({
        title: 'Test Stream',
        likes: 42
      });

      expect(livestream.likes).toBe(42);
    });

    test('should accept array of strings for likedBy', () => {
      const livestream = new LiveStream({
        title: 'Test Stream',
        likedBy: ['user1', 'user2', 'user3']
      });

      expect(livestream.likedBy).toHaveLength(3);
      expect(livestream.likedBy).toContain('user1');
      expect(livestream.likedBy).toContain('user2');
    });

    test('should accept Date for startTime and endTime', () => {
      const now = new Date();
      const later = new Date(now.getTime() + 3600000); // 1 hour later

      const livestream = new LiveStream({
        title: 'Test Stream',
        startTime: now,
        endTime: later
      });

      expect(livestream.startTime).toBeInstanceOf(Date);
      expect(livestream.endTime).toBeInstanceOf(Date);
      expect(livestream.startTime.getTime()).toBe(now.getTime());
    });
  });

  describe('URLs and Media', () => {
    test('should accept valid streamUrl', () => {
      const livestream = new LiveStream({
        title: 'Test Stream',
        streamUrl: 'https://stream.example.com/live/abc123'
      });

      expect(livestream.streamUrl).toBe('https://stream.example.com/live/abc123');
    });

    test('should accept valid videoUrl', () => {
      const livestream = new LiveStream({
        title: 'Test Stream',
        videoUrl: 'https://video.example.com/recordings/abc123.mp4'
      });

      expect(livestream.videoUrl).toBe('https://video.example.com/recordings/abc123.mp4');
    });

    test('should accept valid thumbnailUrl', () => {
      const livestream = new LiveStream({
        title: 'Test Stream',
        thumbnailUrl: 'https://cdn.example.com/thumbnails/abc123.jpg'
      });

      expect(livestream.thumbnailUrl).toBe('https://cdn.example.com/thumbnails/abc123.jpg');
    });
  });

  describe('Livestream State', () => {
    test('should create livestream with all fields populated', () => {
      const now = new Date();
      const livestream = new LiveStream({
        title: 'Complete Test Stream',
        description: 'A complete livestream with all fields',
        streamUrl: 'https://stream.example.com/live123',
        videoUrl: 'https://video.example.com/rec123.mp4',
        thumbnailUrl: 'https://cdn.example.com/thumb123.jpg',
        duration: 7200,
        viewCount: 500,
        likes: 150,
        likedBy: ['user1', 'user2'],
        startTime: now
      });

      expect(livestream.title).toBe('Complete Test Stream');
      expect(livestream.viewCount).toBe(500);
      expect(livestream.likes).toBe(150);
      expect(livestream.likedBy).toHaveLength(2);
      expect(livestream.duration).toBe(7200);
    });
  });
});
