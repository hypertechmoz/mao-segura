import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Centrally handles image uploading to Supabase Storage.
 * 
 * @param {string} uri - The local URI of the image (from ImagePicker)
 * @param {string} path - The destination path in Storage (e.g., 'profile_photos/user123.jpg')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export async function uploadImage(uri, path) {
    if (!uri) throw new Error('No URI provided for upload');

    try {
        let fileData;

        if (Platform.OS === 'web') {
            // On web, we can't use expo-file-system easily for local blob conversion
            // Fetch the uri (which is a blob url or remote url) and get a blob
            const response = await fetch(uri);
            fileData = await response.blob();
        } else {
            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert base64 to ArrayBuffer
            fileData = decode(base64);
        }

        // Upload to 'profiles' bucket (using this as it's confirmed to exist)
        const { data, error } = await supabase.storage
            .from('profiles')
            .upload(path, fileData, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(path);

        return publicUrl;
    } catch (error) {
        console.error('Supabase Storage upload error:', error);
        throw error;
    }
}
