/*
  Warnings:

  - You are about to drop the column `messageType` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeConversation" AS ENUM ('PRIVATE', 'GROUP', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENDING', 'SEND', 'FAILED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "type" "TypeConversation" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "messageType",
ADD COLUMN     "messageStatus" "MessageStatus" NOT NULL DEFAULT 'SENDING';

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "memberRole" "MemberRole" NOT NULL DEFAULT 'MEMBER';

-- DropEnum
DROP TYPE "MessageType";
