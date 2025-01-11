import { Injectable } from '@nestjs/common';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface CompressedData {
  compressed: boolean;
  data: string;
  originalSize: number;
  compressedSize: number;
}

@Injectable()
export class CacheCompressionService {
  private readonly compressionThreshold = 1024; // 1KB

  async compress(data: any): Promise<CompressedData> {
    const stringData = JSON.stringify(data);
    const originalSize = Buffer.byteLength(stringData);

    if (originalSize < this.compressionThreshold) {
      return {
        compressed: false,
        data: stringData,
        originalSize,
        compressedSize: originalSize,
      };
    }

    try {
      const compressed = await gzip(stringData);
      const compressedSize = compressed.length;

      return {
        compressed: true,
        data: compressed.toString('base64'),
        originalSize,
        compressedSize,
      };
    } catch {
      return {
        compressed: false,
        data: stringData,
        originalSize,
        compressedSize: originalSize,
      };
    }
  }

  async decompress(data: CompressedData): Promise<any> {
    if (!data.compressed) {
      return JSON.parse(data.data);
    }

    try {
      const buffer = Buffer.from(data.data, 'base64');
      const decompressed = await gunzip(buffer);
      return JSON.parse(decompressed.toString());
    } catch {
      throw new Error('Failed to decompress cache data');
    }
  }

  getCompressionRatio(data: CompressedData): number {
    if (!data.compressed || data.compressedSize >= data.originalSize) {
      return 1;
    }
    return data.compressedSize / data.originalSize;
  }

  shouldCompress(size: number): boolean {
    return size >= this.compressionThreshold;
  }
}
