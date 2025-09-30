-- Add new columns to testimonials table
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS submitted_by text DEFAULT 'client' CHECK (submitted_by IN ('admin', 'client'));

-- Update existing testimonials to be approved and submitted by admin
UPDATE testimonials 
SET status = 'approved', submitted_by = 'admin'
WHERE status = 'pending';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_show_on_homepage ON testimonials(show_on_homepage);