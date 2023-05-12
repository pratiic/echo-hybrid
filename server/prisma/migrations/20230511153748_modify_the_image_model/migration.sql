/*
  Warnings:

  - A unique constraint covering the columns `[businessId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "businessId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Image_businessId_key" ON "Image"("businessId");
