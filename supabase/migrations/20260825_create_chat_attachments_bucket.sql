-- ======================================================================
-- MIGRATION: Create chat-attachments bucket
-- ======================================================================

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on the storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the chat-attachments bucket

-- Allow public read access to all chat attachments
CREATE POLICY "Public Access for chat attachments" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'chat-attachments' );

-- Allow authenticated users to upload new attachments
CREATE POLICY "Authenticated users can upload chat attachments" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
    bucket_id = 'chat-attachments' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own attachments
CREATE POLICY "Users can update their own chat attachments" 
ON storage.objects FOR UPDATE 
USING ( 
    bucket_id = 'chat-attachments' 
    AND auth.uid() = owner
);

-- Allow authenticated users to delete their own attachments
CREATE POLICY "Users can delete their own chat attachments" 
ON storage.objects FOR DELETE 
USING ( 
    bucket_id = 'chat-attachments' 
    AND auth.uid() = owner
);
