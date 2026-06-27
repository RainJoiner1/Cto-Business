import { PrismaClient, CloudProvider, CommitmentTerm, OfferingClass, PlanStatus, SyncStatus } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clear existing data in reverse order of dependencies
  await prisma.transactionLog.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.executionPlan.deleteMany();
  await prisma.reservationPortfolio.deleteMany();
  await prisma.usageMetric.deleteMany();
  await prisma.cloudAccount.deleteMany();
  await prisma.organization.deleteMany();

  const orgNames = [
    'Acme Corp', 'Globex Corporation', 'Soylent Corp', 'Initech', 'Umbrella Corp',
    'Massive Dynamic', 'Hooli', 'Pied Piper', 'Stark Industries', 'Wayne Enterprises'
  ];

  const providers: CloudProvider[] = ['AWS', 'AZURE', 'GCP'];
  const regions = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1'];

  for (let i = 0; i < orgNames.length; i++) {
    const name = orgNames[i]!;
    const org = await prisma.organization.create({
      data: {
        name,
        billingAccountId: `billing-${i}-${crypto.randomUUID().substring(0, 8)}`,
        riskTolerance: 0.1 + (Math.random() * 0.4),
      }
    });

    console.log(`Created organization: ${org.name}`);

    // Create 1-2 Cloud Accounts per Org
    const numAccounts = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < numAccounts; j++) {
      const provider = providers[(i + j) % providers.length]!;
      const account = await prisma.cloudAccount.create({
        data: {
          orgId: org.id,
          provider,
          accountAlias: `${name}-${provider}-${j}`,
          credentials: { apiKey: crypto.randomUUID(), secret: crypto.randomUUID() },
        }
      });

      // Create Usage Metrics for the last 90 days
      const metricsData = [];
      const instanceFamilies = provider === 'AWS' ? ['m5.large', 'c5.xlarge', 'r5.2xlarge'] : 
                              (provider === 'AZURE' ? ['Standard_D2s_v3', 'Standard_F4s'] : ['n1-standard-1', 'e2-medium']);
      
      const region = regions[Math.floor(Math.random() * regions.length)]!;

      for (let d = 0; d < 90; d++) {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - d);
        timestamp.setHours(0, 0, 0, 0);

        const seasonality = 1.0 + 0.3 * Math.sin((2 * Math.PI * d) / 7);
        
        for (const family of instanceFamilies) {
          const baseUnits = 100 + Math.floor(Math.random() * 200);
          const units = Math.floor(baseUnits * seasonality);
          const costPerUnit = 0.05 + (Math.random() * 0.05);

          metricsData.push({
            accountId: account.id,
            timestamp: new Date(timestamp),
            instanceFamily: family,
            region,
            normalizedUnits: units,
            onDemandCost: units * costPerUnit,
          });
        }
      }
      await prisma.usageMetric.createMany({ data: metricsData });

      for (let k = 0; k < 2; k++) {
        await prisma.reservationPortfolio.create({
          data: {
            accountId: account.id,
            reservationId: `res-${crypto.randomUUID().substring(0, 12)}`,
            termYears: k % 2 === 0 ? 'ONE_YEAR' : 'THREE_YEAR',
            offeringClass: 'STANDARD',
            hourlyRate: 0.02 + (Math.random() * 0.03),
            totalUpfront: 500.0 + (Math.random() * 1000),
            state: 'ACTIVE',
            expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (30 + Math.random() * 300)),
          }
        });
      }
    }

    const plan = await prisma.executionPlan.create({
      data: {
        organizationId: org.id,
        totalEstimatedSavings: 1000.0 + (Math.random() * 5000),
        status: i % 3 === 0 ? 'COMPLETED' : (i % 3 === 1 ? 'APPROVED' : 'DRAFT'),
      }
    });

    for (let r = 0; r < 2; r++) {
      await prisma.recommendation.create({
        data: {
          executionPlanId: plan.id,
          instanceFamily: i % 2 === 0 ? 'm5.large' : 'c5.xlarge',
          region: regions[r % regions.length]!,
          recommendedQuantity: 5 + Math.floor(Math.random() * 10),
          term: r % 2 === 0 ? 'ONE_YEAR' : 'THREE_YEAR',
          roiScore: 0.7 + (Math.random() * 0.25),
          estimatedMonthlySavings: 100.0 + (Math.random() * 400),
          status: plan.status,
        }
      });
    }

    if (plan.status === 'COMPLETED') {
      await prisma.transactionLog.create({
        data: {
          idempotencyKey: crypto.randomUUID(),
          executionPlanId: plan.id,
          vendorResponse: { orderId: crypto.randomUUID(), status: 'confirmed' },
          status: 'SUCCESS',
        }
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
