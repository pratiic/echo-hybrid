/*
  Warnings:

  - A unique constraint covering the columns `[uniqueStr]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Image_uniqueStr_key" ON "Image"("uniqueStr");
