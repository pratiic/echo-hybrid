-- CreateTable
CREATE TABLE "Suspension" (
    "id" SERIAL NOT NULL,
    "cause" TEXT NOT NULL,
    "productId" INTEGER,
    "storeId" INTEGER,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suspension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Suspension_productId_key" ON "Suspension"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Suspension_storeId_key" ON "Suspension"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Suspension_userId_key" ON "Suspension"("userId");

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
