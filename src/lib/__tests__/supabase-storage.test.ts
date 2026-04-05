import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client before importing the module
const mockUpload = vi.fn();
const mockList = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        list: mockList,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}));

// Import after mocking
import { uploadPhoto, fetchBetPhotos } from '../supabase';

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

describe('uploadPhoto', () => {
  const betId = 'bet-123';
  const name = 'Alice';
  // Minimal valid data URL
  const dataUrl = 'data:image/jpeg;base64,/9j/4AAQ';

  it('returns true on successful upload', async () => {
    mockUpload.mockResolvedValueOnce({ error: null });

    const result = await uploadPhoto(betId, name, dataUrl);
    expect(result).toBe(true);
    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockUpload).toHaveBeenCalledWith(
      `${betId}/${encodeURIComponent(name)}.jpg`,
      expect.any(Blob),
      { upsert: true, contentType: 'image/jpeg' }
    );
  });

  it('retries on failure and succeeds on second attempt', async () => {
    mockUpload
      .mockResolvedValueOnce({ error: new Error('Network error') })
      .mockResolvedValueOnce({ error: null });

    const promise = uploadPhoto(betId, name, dataUrl);
    // Advance past the 1s retry delay
    await vi.advanceTimersByTimeAsync(1500);
    const result = await promise;

    expect(result).toBe(true);
    expect(mockUpload).toHaveBeenCalledTimes(2);
  });

  it('returns false after all retries exhausted', async () => {
    mockUpload.mockResolvedValue({ error: new Error('Network error') });

    const promise = uploadPhoto(betId, name, dataUrl);
    // Advance past all retry delays (1s + 2s + 4s)
    await vi.advanceTimersByTimeAsync(8000);
    const result = await promise;

    expect(result).toBe(false);
    expect(mockUpload).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
  });

  it('returns false on invalid data URL (blob conversion error)', async () => {
    const result = await uploadPhoto(betId, name, 'not-a-data-url');
    expect(result).toBe(false);
    expect(mockUpload).not.toHaveBeenCalled();
  });
});

describe('fetchBetPhotos', () => {
  const betId = 'bet-456';

  it('returns photo URL map when Storage has files', async () => {
    mockList.mockResolvedValueOnce({
      data: [{ name: 'Alice.jpg' }, { name: 'Bob.jpg' }],
      error: null,
    });
    mockGetPublicUrl
      .mockReturnValueOnce({ data: { publicUrl: 'https://cdn.example.com/Alice.jpg' } })
      .mockReturnValueOnce({ data: { publicUrl: 'https://cdn.example.com/Bob.jpg' } });

    const photos = await fetchBetPhotos(betId);
    expect(photos.size).toBe(2);
    expect(photos.get('Alice')).toBe('https://cdn.example.com/Alice.jpg');
    expect(photos.get('Bob')).toBe('https://cdn.example.com/Bob.jpg');
  });

  it('returns empty map when Storage is empty', async () => {
    mockList.mockResolvedValueOnce({ data: [], error: null });
    const photos = await fetchBetPhotos(betId);
    expect(photos.size).toBe(0);
  });

  it('returns empty map on Storage error (no throw)', async () => {
    mockList.mockResolvedValueOnce({ data: null, error: new Error('Storage down') });
    const photos = await fetchBetPhotos(betId);
    expect(photos.size).toBe(0);
  });
});
