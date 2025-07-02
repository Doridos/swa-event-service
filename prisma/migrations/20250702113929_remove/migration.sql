/*
  Warnings:

  - You are about to drop the column `soldTickets` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `validatedTickets` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "soldTickets",
DROP COLUMN "validatedTickets";
