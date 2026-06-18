import { PrismaClient, CloudProvider, CommitmentTerm, OfferingClass, PlanStatus, SyncStatus } from '@prisma/client';

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

  for (let i = 0; i < orgNames.length; i++) {
    const name = orgNames[i];
    const org = await prisma.organization.create({
      data: {
        name: name!,
        billingAccountId: `billing-${i}`,
        riskTolerance: 0.2 + (Math.random() * 0.3),
      }
    });

    console.log(`Created organization: ${org.name}`);

    // Create 1-2 Cloud Accounts per Org
    const numAccounts = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < numAccounts; j++) {
      const provider = providers[(i + j) % providers.length] as CloudProvider;
      const account = await prisma.cloudAccount.create({
        data: {
          orgId: org.id,
          provider,
          accountAlias: `${name}-${provider}-${j}`,
          credentials: { apiKey: 'mock-key', secret: 'mock-secret' },
        }
      });

      // Create Usage Metrics for the last 90 days
      const metricsData = [];
      const instanceFamilies = provider === 'AWS' ? ['m5.large', 't3.medium'] : (provider === 'AZURE' ? ['Standard_D2s_v3', 'Standard_B2s'] : ['n1-standard-1', 'f1-micro']);
      
      for (let d = 0; d < 90; d++) {
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - d);
        
        for (const family of instanceFamilies) {
          metricsData.push({
            accountId: account.id,
            timestamp: new Date(timestamp),
            instanceFamily: family,
            region: 'us-east-1',
            normalizedUnits: Math.floor(100 + Math.random() * 500),
            onDemandCost: 50.0 + (Math.random() * 100),
          });
        }
      }
      await prisma.usageMetric.createMany({ data: metricsData });

      // Create 2-3 Reservation Portfolios
      for (let k = 0; k < 2; k++) {
        await prisma.reservationPortfolio.create({
          data: {
            accountId: account.id,
            reservationId: `res-${account.id}-${k}`,
            termYears: 'ONE_YEAR',
            offeringClass: 'STANDARD',
            hourlyRate: 0.05,
            totalUpfront: 1000.0,
            state: 'ACTIVE',
            expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6), // 6 months from now
          }
        });
      }
    }

    // Create 1 Execution Plan
    const plan = await prisma.executionPlan.create({
      data: {
        organizationId: org.id,
        totalEstimatedSavings: 500.0,
        status: 'DRAFT',
      }
    });

    // Create 2 Recommendations
    await prisma.recommendation.create({
      data: {
        executionPlanId: plan.id,
        instanceFamily: 'm5.large',
        region: 'us-east-1',
        recommendedQuantity: 5,
        term: 'ONE_YEAR',
        roiScore: 0.85,
        estimatedMonthlySavings: 200.0,
        status: 'DRAFT',
      }
    });
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
