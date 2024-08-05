-- Add title and description columns to feeds table
ALTER TABLE feeds ADD COLUMN title TEXT;
ALTER TABLE feeds ADD COLUMN description TEXT;