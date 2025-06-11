-- Migration: Create quiz_questions table
-- Description: Table to store AI-generated quiz questions for documents
-- Created: 2024

-- Create the quiz_questions table
CREATE TABLE quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id TEXT NOT NULL,
    questions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on document_id for fast lookups
CREATE INDEX idx_quiz_questions_document_id ON quiz_questions(document_id);

-- Create index on created_at for sorting
CREATE INDEX idx_quiz_questions_created_at ON quiz_questions(created_at);

-- Add constraint to ensure document_id is unique (one quiz per document)
ALTER TABLE quiz_questions ADD CONSTRAINT unique_document_quiz UNIQUE (document_id);

-- Add constraint to validate questions JSON structure
ALTER TABLE quiz_questions ADD CONSTRAINT validate_questions_structure 
CHECK (
    jsonb_typeof(questions) = 'array' AND 
    jsonb_array_length(questions) >= 1 AND
    jsonb_array_length(questions) <= 10
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER trigger_update_quiz_questions_updated_at
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_questions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE quiz_questions IS 'Stores AI-generated quiz questions for documents';
COMMENT ON COLUMN quiz_questions.id IS 'Unique identifier for the quiz';
COMMENT ON COLUMN quiz_questions.document_id IS 'Reference to the document ID';
COMMENT ON COLUMN quiz_questions.questions IS 'JSON array of quiz questions with structure: [{"question": "string", "options": ["string"], "correctAnswer": number}]';
COMMENT ON COLUMN quiz_questions.created_at IS 'Timestamp when the quiz was created';
COMMENT ON COLUMN quiz_questions.updated_at IS 'Timestamp when the quiz was last updated';

-- Enable Row Level Security (RLS)
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- Note: Adjust these policies based on your specific security requirements
CREATE POLICY "Allow full access to quiz_questions for authenticated users" 
ON quiz_questions
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Optional: Create policy for anonymous users to read quiz questions
CREATE POLICY "Allow read access to quiz_questions for anonymous users" 
ON quiz_questions
FOR SELECT 
TO anon 
USING (true);

-- Insert sample data for testing (optional - remove in production)
-- INSERT INTO quiz_questions (document_id, questions) VALUES 
-- ('sample_doc_1', '[
--     {
--         "question": "Apa yang dimaksud dengan Pancasila?",
--         "options": ["Lima dasar negara Indonesia", "Empat pilar bangsa", "Tiga prinsip utama", "Enam nilai luhur"],
--         "correctAnswer": 0
--     },
--     {
--         "question": "Sila pertama Pancasila adalah?",
--         "options": ["Kemanusiaan yang adil dan beradab", "Ketuhanan Yang Maha Esa", "Persatuan Indonesia", "Kerakyatan yang dipimpin oleh hikmat"],
--         "correctAnswer": 1
--     }
-- ]'::jsonb); 