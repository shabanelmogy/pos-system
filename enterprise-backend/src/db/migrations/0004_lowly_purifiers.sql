CREATE TABLE "order_sequences" (
	"branch_id" uuid NOT NULL,
	"date" date NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "order_sequences_branch_id_date_pk" PRIMARY KEY("branch_id","date")
);
--> statement-breakpoint
ALTER TABLE "order_sequences" ADD CONSTRAINT "order_sequences_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "date_idx" ON "order_sequences" USING btree ("date");