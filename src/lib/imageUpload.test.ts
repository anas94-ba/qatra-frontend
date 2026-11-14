import { prepareImageForUpload, webpName } from './imageUpload';

const photo = (name = 'proof.JPG', size = 5000, type = 'image/jpeg') => new File([new Uint8Array(size)], name, { type });

afterEach(() => vi.unstubAllGlobals());

describe('webpName', () => {
  it('swaps the extension', () => {
    expect(webpName('photo.JPG')).toBe('photo.webp');
    expect(webpName('my.photo.png')).toBe('my.photo.webp');
    expect(webpName('noext')).toBe('noext.webp');
  });
});

describe('prepareImageForUpload', () => {
  it('passes PDFs through untouched', async () => {
    const pdf = new File(['%PDF-1.7'], 'proof.pdf', { type: 'application/pdf' });
    expect(await prepareImageForUpload(pdf, { maxSize: 1600 })).toBe(pdf);
  });

  it('returns the original when the browser cannot decode images', async () => {
    vi.stubGlobal('createImageBitmap', undefined);
    const file = photo();
    expect(await prepareImageForUpload(file, { maxSize: 1600 })).toBe(file);
  });

  it('returns the original on any failure (the server converts anyway)', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bad image')));
    const file = photo();
    expect(await prepareImageForUpload(file, { maxSize: 1600 })).toBe(file);
  });

  it('resizes to maxSize and converts to a smaller WebP', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 4000, height: 2000, close: vi.fn() }));
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(new Blob([new Uint8Array(900)], { type: 'image/webp' })));

    const out = await prepareImageForUpload(photo('proof.JPG', 5000), { maxSize: 1600 });

    expect(out.name).toBe('proof.webp');
    expect(out.type).toBe('image/webp');
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 800);
  });

  it('keeps the original when the WebP result is not smaller', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 100, height: 100, close: vi.fn() }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(new Blob([new Uint8Array(9000)], { type: 'image/webp' })));
    const file = photo('a.jpg', 5000);
    expect(await prepareImageForUpload(file, { maxSize: 1600 })).toBe(file);
  });

  it('keeps the original when the browser cannot encode WebP (falls back to PNG)', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 100, height: 100, close: vi.fn() }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(new Blob([new Uint8Array(100)], { type: 'image/png' })));
    const file = photo('a.jpg', 5000);
    expect(await prepareImageForUpload(file, { maxSize: 1600 })).toBe(file);
  });
});
