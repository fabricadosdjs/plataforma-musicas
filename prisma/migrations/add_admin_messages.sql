-- Create AdminMessage table
CREATE TABLE "AdminMessage" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for better performance
CREATE INDEX "AdminMessage_createdBy_idx" ON "AdminMessage"("createdBy");
CREATE INDEX "AdminMessage_isActive_idx" ON "AdminMessage"("isActive");
CREATE INDEX "AdminMessage_createdAt_idx" ON "AdminMessage"("createdAt"); 