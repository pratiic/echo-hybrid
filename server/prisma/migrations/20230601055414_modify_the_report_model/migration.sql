/*
  Warnings:

  - A unique constraint covering the columns `[userId,storeId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Report_userId_storeId_key" ON "Report"("userId", "storeId");
