-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalAmount" DROP DEFAULT,
ALTER COLUMN "totalItems" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "productId" SET DATA TYPE TEXT,
ALTER COLUMN "price" DROP DEFAULT,
ALTER COLUMN "quantity" DROP DEFAULT;
