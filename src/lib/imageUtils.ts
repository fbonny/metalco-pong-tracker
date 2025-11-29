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
        
        // Resize to max 800px width while maintaining aspect ratio (higher quality for Wall of Fame)
        if (width > 800) {
          height = (height * 800) / width;
          width = 800;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with 0.85 quality (higher quality for Wall of Fame)
        let quality = 0.85;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        
        // If still too large, reduce quality iteratively
        while (base64.length > maxSizeMB * 1024 * 1024 * 1.37 && quality > 0.5) {
          quality -= 0.05;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }
        
        // Final check
        const finalSizeMB = base64.length / 1024 / 1024 / 1.37; // Approximate base64 overhead
        if (finalSizeMB > maxSizeMB) {
          reject(new Error(`Impossibile comprimere l'immagine sotto ${maxSizeMB}MB. Prova con un'immagine più piccola.`));
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