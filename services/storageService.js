import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Centrally handles image uploading to Firebase Storage.
 * works for both Web and Native environments.
 * 
 * @param {string} uri - The local URI of the image (from ImagePicker)
 * @param {string} path - The destination path in Storage (e.g., 'profile_photos/user123.jpg')
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export async function uploadImage(uri, path) {
    if (!uri) throw new Error('No URI provided for upload');
    
    // For React Native / Expo, we often need to fetch the local URI as a blob
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = (e) => {
            console.error('XHR error during blob conversion:', e);
            reject(new TypeError('Network request failed for image blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
    });

    try {
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, blob);
        
        // Clean up blob to avoid memory leaks on native
        if (blob.close) blob.close();
        
        const downloadUrl = await getDownloadURL(fileRef);
        return downloadUrl;
    } catch (error) {
        console.error('Firebase Storage upload error:', error);
        throw error;
    }
}
