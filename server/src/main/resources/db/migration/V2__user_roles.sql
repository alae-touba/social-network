-- User roles: the app currently has no admin features, so everyone gets
-- USER. The column exists so moderation features can be added later and so
-- JWTs can carry a standard authority claim.
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("role" IN ('USER', 'ADMIN'));
