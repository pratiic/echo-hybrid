-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_madeById_fkey";

-- DropForeignKey
ALTER TABLE "OrderCompletion" DROP CONSTRAINT "OrderCompletion_requestorId_fkey";

-- AlterTable
ALTER TABLE "Delivery" ALTER COLUMN "madeById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderCompletion" ADD CONSTRAINT "OrderCompletion_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_madeById_fkey" FOREIGN KEY ("madeById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
