-- AlterEnum
ALTER TYPE "Priority" ADD VALUE 'URGENT';

-- DropForeignKey
ALTER TABLE "boards" DROP CONSTRAINT "boards_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "columns" DROP CONSTRAINT "columns_board_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_column_id_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "position" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "columns" ADD CONSTRAINT "columns_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
