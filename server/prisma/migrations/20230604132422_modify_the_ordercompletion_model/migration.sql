/*
  Warnings:

  - Added the required column `requestorId` to the `OrderCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderCompletion" ADD COLUMN     "requestorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderCompletion" ADD CONSTRAINT "OrderCompletion_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
