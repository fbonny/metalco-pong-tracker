export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize to max 300px width while maintaining aspect ratio
        if (width > 300) {
          height = (height * 300) / width;
          width = 300;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with 0.7 quality
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(base64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function compressFamePhoto(file: File, maxSizeMB: number = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check file size first (in MB)
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      reject(new Error(`L'immagine è troppo grande (${fileSizeMB.toFixed(2)}MB). Massimo ${maxSizeMB}MB.`));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize to max 600px width (reduced from 800px for smaller file size)
        if (width > 600) {
          height = (height * 600) / width;
          width = 600;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with lower quality (0.7 instead of 0.85)
        let quality = 0.7;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        
        // Target max 500KB for base64 string (more aggressive)
        const maxBase64Size = 500 * 1024;
        
        // If still too large, reduce quality iteratively
        while (base64.length > maxBase64Size && quality > 0.3) {
          quality -= 0.05;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }
        
        // Final check - convert base64 length to approximate MB
        const finalSizeKB = base64.length / 1024;
        console.log(`Compressed image: ${finalSizeKB.toFixed(0)}KB (quality: ${quality.toFixed(2)})`);
        
        if (base64.length > maxBase64Size * 2) {
          reject(new Error(`Impossibile comprimere l'immagine abbastanza. Prova con un'immagine più piccola o di qualità inferiore.`));
          return;
        }
        
        resolve(base64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}