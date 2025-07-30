-- Create CustomItem table
CREATE TABLE "CustomItem" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "CustomItem_createdBy_idx" ON "CustomItem"("createdBy");
CREATE INDEX "CustomItem_type_idx" ON "CustomItem"("type");
CREATE INDEX "CustomItem_isActive_idx" ON "CustomItem"("isActive");
CREATE INDEX "CustomItem_order_idx" ON "CustomItem"("order"); 