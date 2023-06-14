/*
  Warnings:

  - Added the required column `reviewId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reviewId" INTEGER NOT NULL,
ADD COLUMN     "targetType" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
