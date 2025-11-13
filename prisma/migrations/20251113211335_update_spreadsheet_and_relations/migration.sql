/*
  Warnings:

  - The values [READ,WRITE] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `sheetId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('VIEW', 'EDIT', 'ADMIN');
ALTER TABLE "Share" ALTER COLUMN "permission" DROP DEFAULT;
ALTER TABLE "Share" ALTER COLUMN "permission" TYPE "Permission_new" USING ("permission"::text::"Permission_new");
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "Permission_old";
ALTER TABLE "Share" ALTER COLUMN "permission" SET DEFAULT 'VIEW';
COMMIT;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "sheetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Share" ALTER COLUMN "permission" SET DEFAULT 'VIEW';

-- AlterTable
ALTER TABLE "Spreadsheet" ALTER COLUMN "data" SET DEFAULT '{"sheets":[{"id":"sheet1","name":"Sheet1","isActive":true,"cells":{},"rowCount":100,"columnCount":26,"frozen":{"rows":0,"columns":0}}],"activeSheetId":"sheet1","charts":[]}';

-- CreateIndex
CREATE INDEX "Comment_spreadsheetId_cellId_sheetId_idx" ON "Comment"("spreadsheetId", "cellId", "sheetId");

-- CreateIndex
CREATE INDEX "Spreadsheet_userId_idx" ON "Spreadsheet"("userId");
