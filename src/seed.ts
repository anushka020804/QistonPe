import * as bcrypt from 'bcrypt';
import { PurchaseOrderStatus } from './common/enums/purchase-order-status.enum';
import { PaymentTerm } from './common/enums/payment-terms.enum';
import appDataSource from './database/data-source';
import { Payment } from './payments/entities/payment.entity';
import { PurchaseOrderItem } from './purchase-orders/entities/purchase-order-item.entity';
import { PurchaseOrder } from './purchase-orders/entities/purchase-order.entity';
import { User } from './users/user.entity';
import { Vendor } from './vendors/entities/vendor.entity';

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  await appDataSource.initialize();

  const userRepo = appDataSource.getRepository(User);
  const vendorRepo = appDataSource.getRepository(Vendor);
  const poRepo = appDataSource.getRepository(PurchaseOrder);
  const itemRepo = appDataSource.getRepository(PurchaseOrderItem);
  const paymentRepo = appDataSource.getRepository(Payment);

  // Cleanup in dependency order - use query for proper cascade
  await appDataSource.query('TRUNCATE TABLE "payments" CASCADE');
  await appDataSource.query('TRUNCATE TABLE "purchase_order_items" CASCADE');
  await appDataSource.query('TRUNCATE TABLE "purchase_orders" CASCADE');
  await appDataSource.query('TRUNCATE TABLE "vendors" CASCADE');
  await appDataSource.query('TRUNCATE TABLE "users" CASCADE');

  const vendorsSeed: Array<Partial<Vendor>> = [
    { name: 'Acme Supplies', email: 'acme@example.com', paymentTerm: PaymentTerm.NET_30 },
    { name: 'Bright Tools', email: 'bright@example.com', paymentTerm: PaymentTerm.NET_15 },
    { name: 'Cobalt Parts', email: 'cobalt@example.com', paymentTerm: PaymentTerm.NET_45 },
    { name: 'Delta Logistics', email: 'delta@example.com', paymentTerm: PaymentTerm.NET_60 },
    { name: 'Evergreen Traders', email: 'evergreen@example.com', paymentTerm: PaymentTerm.IMMEDIATE },
  ];

  const vendors = await vendorRepo.save(vendorsSeed.map((v) => vendorRepo.create(v)));

  const purchaseOrders: PurchaseOrder[] = [];
  let seq = 1;
  for (const vendor of vendors) {
    for (let i = 0; i < 3; i++) {
      const issueDate = addDays(new Date(), -(i + 5));
      const items: PurchaseOrderItem[] = [
        itemRepo.create({ description: `Item ${seq}A`, quantity: 5 + i, unitPrice: 120 + seq * 2, lineTotal: (5 + i) * (120 + seq * 2) }),
        itemRepo.create({ description: `Item ${seq}B`, quantity: 2 + i, unitPrice: 80 + seq, lineTotal: (2 + i) * (80 + seq) }),
      ];
      const totalAmount = Number(items.reduce((sum, it) => sum + it.lineTotal, 0).toFixed(2));

      const po = poRepo.create({
        poNumber: `PO-SEED-${String(seq).padStart(3, '0')}`,
        vendor,
        issueDate,
        dueDate: addDays(issueDate, vendor.paymentTerm),
        status: PurchaseOrderStatus.APPROVED,
        totalAmount,
        paidAmount: 0,
        outstandingAmount: totalAmount,
        note: `Seed PO ${seq}`,
        items,
      });
      purchaseOrders.push(po);
      seq += 1;
    }
  }

  const savedPOs = await poRepo.save(purchaseOrders);

  const paymentPlans: Array<{ poIndex: number; amount: number; dateOffset: number; reference: string }> = [
    { poIndex: 0, amount: savedPOs[0].totalAmount * 0.5, dateOffset: -2, reference: 'ADV-1' },
    { poIndex: 1, amount: savedPOs[1].totalAmount, dateOffset: -1, reference: 'FULL-1' },
    { poIndex: 2, amount: savedPOs[2].totalAmount * 0.25, dateOffset: -1, reference: 'PART-1' },
    { poIndex: 3, amount: savedPOs[3].totalAmount * 0.6, dateOffset: -4, reference: 'PART-2' },
    { poIndex: 4, amount: savedPOs[4].totalAmount * 0.8, dateOffset: -3, reference: 'PART-3' },
    { poIndex: 5, amount: savedPOs[5].totalAmount, dateOffset: -6, reference: 'FULL-2' },
    { poIndex: 6, amount: savedPOs[6].totalAmount * 0.4, dateOffset: -5, reference: 'PART-4' },
    { poIndex: 7, amount: savedPOs[7].totalAmount * 0.7, dateOffset: -2, reference: 'PART-5' },
    { poIndex: 8, amount: savedPOs[8].totalAmount, dateOffset: -7, reference: 'FULL-3' },
    { poIndex: 9, amount: savedPOs[9].totalAmount * 0.3, dateOffset: -8, reference: 'PART-6' },
  ];

  const payments: Payment[] = [];
  for (const plan of paymentPlans) {
    const po = savedPOs[plan.poIndex];
    const payment = paymentRepo.create({
      purchaseOrder: po,
      amount: Number(plan.amount.toFixed(2)),
      paymentDate: addDays(new Date(), plan.dateOffset),
      reference: plan.reference,
    });
    payments.push(payment);

    po.paidAmount = Number((po.paidAmount + payment.amount).toFixed(2));
    po.outstandingAmount = Number((po.totalAmount - po.paidAmount).toFixed(2));
    po.status = po.outstandingAmount <= 0 ? PurchaseOrderStatus.PAID : PurchaseOrderStatus.PARTIALLY_PAID;
  }

  await paymentRepo.save(payments);
  await poRepo.save(savedPOs);

  const passwordHash = await bcrypt.hash('password123', 10);
  const seedUser = userRepo.create({ email: 'admin@vendorpay.io', passwordHash, name: 'Admin User' });
  await userRepo.save(seedUser);

  await appDataSource.destroy();
  // eslint-disable-next-line no-console
  console.log('Seed data inserted');
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', err);
  process.exit(1);
});
