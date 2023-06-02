-- CreateTable
CREATE TABLE "OrderCompletion" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "madeById" INTEGER NOT NULL,
    "madeToId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderCompletion_orderId_key" ON "OrderCompletion"("orderId");

-- AddForeignKey
ALTER TABLE "OrderCompletion" ADD CONSTRAINT "OrderCompletion_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
