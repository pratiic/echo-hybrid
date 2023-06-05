-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "deletedFor" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
