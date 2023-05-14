/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,storeId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stars` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "productId" INTEGER,
ADD COLUMN     "stars" INTEGER NOT NULL,
ADD COLUMN     "storeId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_productId_key" ON "Rating"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_storeId_key" ON "Rating"("userId", "storeId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
