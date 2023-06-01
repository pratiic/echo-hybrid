/*
  Warnings:

  - A unique constraint covering the columns `[creatorId,productId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[creatorId,storeId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropIndex
DROP INDEX "Report_userId_productId_key";

-- DropIndex
DROP INDEX "Report_userId_storeId_key";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Report_creatorId_productId_key" ON "Report"("creatorId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_creatorId_storeId_key" ON "Report"("creatorId", "storeId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
