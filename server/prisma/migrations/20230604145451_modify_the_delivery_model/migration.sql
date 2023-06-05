/*
  Warnings:

  - A unique constraint covering the columns `[deletedFor]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Delivery_deletedFor_key" ON "Delivery"("deletedFor");
