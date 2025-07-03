-- CreateTable
CREATE TABLE "fedex_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'fedex',
    "accessToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
