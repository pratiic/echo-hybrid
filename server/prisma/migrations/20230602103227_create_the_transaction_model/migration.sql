-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "deletedFor" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdMonth" INTEGER NOT NULL,
    "createdYear" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
