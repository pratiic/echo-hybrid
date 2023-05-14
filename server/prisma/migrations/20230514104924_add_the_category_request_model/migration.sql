-- CreateTable
CREATE TABLE "CategoryRequest" (
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryRequest_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryRequest_name_key" ON "CategoryRequest"("name");

-- AddForeignKey
ALTER TABLE "CategoryRequest" ADD CONSTRAINT "CategoryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
