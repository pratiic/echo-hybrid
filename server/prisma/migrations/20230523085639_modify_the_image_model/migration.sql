/*
  Warnings:

  - A unique constraint covering the columns `[replyId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "replyId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Image_replyId_key" ON "Image"("replyId");
