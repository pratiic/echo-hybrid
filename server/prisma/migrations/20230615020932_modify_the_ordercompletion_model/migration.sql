-- DropForeignKey
ALTER TABLE "OrderCompletion" DROP CONSTRAINT "OrderCompletion_requestorId_fkey";

-- AddForeignKey
ALTER TABLE "OrderCompletion" ADD CONSTRAINT "OrderCompletion_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
