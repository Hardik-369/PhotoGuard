// @ts-ignore
import * as piexif from 'piexifjs';

export interface ProcessingResult {
  originalFile: File;
  cleanedBlob: Blob;
  metadata: Record<string, any>;
  hasGPS: boolean;
  hasPersonalData: boolean;
  sizeBefore: number;
  sizeAfter: number;
}

export class MetadataProcessor {
  static async processImage(file: File): Promise<ProcessingResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const dataUrl = this.arrayBufferToDataURL(arrayBuffer, file.type);
          
          // Extract metadata using piexifjs
          let metadata: Record<string, any> = {};
          let hasGPS = false;
          let hasPersonalData = false;
          
          try {
            const exifData = piexif.load(dataUrl);
            metadata = this.parseExifData(exifData);
            hasGPS = this.checkForGPS(exifData);
            hasPersonalData = this.checkForPersonalData(exifData);
          } catch (exifError) {
            console.log('No EXIF data found or unsupported format');
          }

          // Remove metadata and create clean image
          const cleanedDataUrl = this.removeMetadata(dataUrl, file.type);
          const cleanedBlob = this.dataURLToBlob(cleanedDataUrl);

          const result: ProcessingResult = {
            originalFile: file,
            cleanedBlob,
            metadata,
            hasGPS,
            hasPersonalData,
            sizeBefore: file.size,
            sizeAfter: cleanedBlob.size
          };

          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to process image: ${error}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private static arrayBufferToDataURL(buffer: ArrayBuffer, type: string): string {
    const binary = Array.from(new Uint8Array(buffer))
      .map(byte => String.fromCharCode(byte))
      .join('');
    const base64 = btoa(binary);
    return `data:${type};base64,${base64}`;
  }

  private static dataURLToBlob(dataURL: string): Blob {
    const parts = dataURL.split(',');
    const contentType = parts[0].split(':')[1].split(';')[0];
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  private static removeMetadata(dataUrl: string, mimeType: string): string {
    try {
      // For JPEG images, use piexifjs to remove EXIF data
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        return piexif.remove(dataUrl);
      }
      
      // For other formats, we'll recreate the image without metadata
      // by drawing it to a canvas and exporting
      return new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const cleanDataUrl = canvas.toDataURL(mimeType, 0.95);
            resolve(cleanDataUrl);
          }
        };
        img.src = dataUrl;
      }) as any;
    } catch (error) {
      console.warn('Could not remove metadata using piexif, using canvas fallback');
      
      // Canvas fallback for all image types
      return new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const cleanDataUrl = canvas.toDataURL(mimeType, 0.95);
            resolve(cleanDataUrl);
          }
        };
        img.src = dataUrl;
      }) as any;
    }
  }

  private static parseExifData(exifData: any): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    // Parse all EXIF sections
    const sections = ['0th', '1st', 'Exif', 'GPS', 'Interop'];
    
    sections.forEach(section => {
      if (exifData[section]) {
        Object.keys(exifData[section]).forEach(key => {
          const tagName = this.getTagName(section, key);
          const value = exifData[section][key];
          metadata[tagName] = value;
        });
      }
    });

    return metadata;
  }

  private static checkForGPS(exifData: any): boolean {
    return exifData.GPS && Object.keys(exifData.GPS).length > 0;
  }

  private static checkForPersonalData(exifData: any): boolean {
    const personalDataTags = [
      'Artist', 'Copyright', 'ImageDescription', 'Make', 'Model', 
      'Software', 'DateTime', 'DateTimeOriginal', 'XPAuthor', 'XPComment'
    ];

    for (const section of ['0th', 'Exif']) {
      if (exifData[section]) {
        for (const tag of personalDataTags) {
          if (Object.values(exifData[section]).some(key => 
            this.getTagName(section, String(key)).includes(tag)
          )) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private static getTagName(section: string, key: string): string {
    try {
      const tagKey = parseInt(key);
      if (section === 'GPS' && piexif.GPSIFD[tagKey]) {
        return `GPS ${piexif.GPSIFD[tagKey].name}`;
      }
      if (section === 'Exif' && piexif.ExifIFD[tagKey]) {
        return piexif.ExifIFD[tagKey].name;
      }
      if ((section === '0th' || section === '1st') && piexif.ImageIFD[tagKey]) {
        return piexif.ImageIFD[tagKey].name;
      }
      if (section === 'Interop' && piexif.InteropIFD[tagKey]) {
        return piexif.InteropIFD[tagKey].name;
      }
    } catch (error) {
      // Fallback to raw key if tag name lookup fails
    }
    
    return `${section}_${key}`;
  }
}