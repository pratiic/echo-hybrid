/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Image_uniqueStr_key";

-- CreateIndex
CREATE UNIQUE INDEX "Image_userId_key" ON "Image"("userId");
