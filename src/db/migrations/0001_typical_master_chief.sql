CREATE TYPE "public"."architecture_role" AS ENUM('owner', 'contributor', 'consumer');--> statement-breakpoint
CREATE TABLE "architecture_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"architecture_id" text NOT NULL,
	"role" "architecture_role" NOT NULL,
	"granted_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "architecture_membership_user_id_architecture_id_unique" UNIQUE("user_id","architecture_id")
);
--> statement-breakpoint
ALTER TABLE "architecture_membership" ADD CONSTRAINT "architecture_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "architecture_membership" ADD CONSTRAINT "architecture_membership_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;