import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query("CREATE TYPE \"vendors_payment_term_enum\" AS ENUM('0','15','30','45','60')");
    await queryRunner.query(
      "CREATE TABLE \"vendors\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" character varying NOT NULL, \"email\" character varying NOT NULL, \"payment_term\" \"vendors_payment_term_enum\" NOT NULL DEFAULT '30', \"is_active\" boolean NOT NULL DEFAULT true, \"created_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"deleted_at\" TIMESTAMP WITH TIME ZONE, CONSTRAINT \"UQ_vendor_name\" UNIQUE (\"name\"), CONSTRAINT \"UQ_vendor_email\" UNIQUE (\"email\"), CONSTRAINT \"PK_vendor_id\" PRIMARY KEY (\"id\"))",
    );

    await queryRunner.query(
      "CREATE TYPE \"purchase_orders_status_enum\" AS ENUM('DRAFT','APPROVED','PARTIALLY_PAID','PAID','CANCELLED')",
    );
    await queryRunner.query(
      "CREATE TABLE \"purchase_orders\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"po_number\" character varying NOT NULL, \"issue_date\" date NOT NULL, \"due_date\" date NOT NULL, \"status\" \"purchase_orders_status_enum\" NOT NULL DEFAULT 'APPROVED', \"total_amount\" numeric(14,2) NOT NULL, \"paid_amount\" numeric(14,2) NOT NULL DEFAULT '0', \"outstanding_amount\" numeric(14,2) NOT NULL DEFAULT '0', \"note\" text, \"created_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"deleted_at\" TIMESTAMP WITH TIME ZONE, \"vendorId\" uuid, CONSTRAINT \"PK_purchase_orders_id\" PRIMARY KEY (\"id\"), CONSTRAINT \"UQ_purchase_orders_po_number\" UNIQUE (\"po_number\"))",
    );

    await queryRunner.query(
      "CREATE TABLE \"purchase_order_items\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"description\" character varying NOT NULL, \"quantity\" integer NOT NULL, \"unit_price\" numeric(14,2) NOT NULL, \"line_total\" numeric(14,2) NOT NULL, \"created_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"deleted_at\" TIMESTAMP WITH TIME ZONE, \"purchaseOrderId\" uuid, CONSTRAINT \"PK_purchase_order_items_id\" PRIMARY KEY (\"id\"))",
    );

    await queryRunner.query(
      "CREATE TABLE \"users\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"email\" character varying NOT NULL, \"password_hash\" character varying NOT NULL, \"name\" character varying, \"created_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"deleted_at\" TIMESTAMP WITH TIME ZONE, CONSTRAINT \"UQ_users_email\" UNIQUE (\"email\"), CONSTRAINT \"PK_users_id\" PRIMARY KEY (\"id\"))",
    );

    await queryRunner.query(
      "CREATE TABLE \"payments\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"amount\" numeric(14,2) NOT NULL, \"payment_date\" date NOT NULL, \"reference\" character varying, \"created_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"updated_at\" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \"deleted_at\" TIMESTAMP WITH TIME ZONE, \"purchaseOrderId\" uuid, CONSTRAINT \"PK_payments_id\" PRIMARY KEY (\"id\"))",
    );

    await queryRunner.query(
      'ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_purchase_orders_vendor" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_purchase_order_items_po" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_po" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_po"');
    await queryRunner.query('ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_purchase_order_items_po"');
    await queryRunner.query('ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_purchase_orders_vendor"');

    await queryRunner.query('DROP TABLE "payments"');
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TABLE "purchase_order_items"');
    await queryRunner.query('DROP TABLE "purchase_orders"');
    await queryRunner.query('DROP TABLE "vendors"');

    await queryRunner.query('DROP TYPE "purchase_orders_status_enum"');
    await queryRunner.query('DROP TYPE "vendors_payment_term_enum"');
  }
}
