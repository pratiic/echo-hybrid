-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "binary" BYTEA NOT NULL,
    "src" TEXT NOT NULL,
    "uniqueStr" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);
