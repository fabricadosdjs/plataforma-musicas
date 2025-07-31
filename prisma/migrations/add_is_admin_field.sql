-- Add isAdmin field to User table
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX "User_isAdmin_idx" ON "User"("isAdmin"); 