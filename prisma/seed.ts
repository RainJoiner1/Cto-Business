import { PrismaClient, CloudProvider, PlanStatus, LogStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clear existing data
  await prisma.transactionLog.deleteMany();
  await prisma.executionPlan.deleteMany();
  await prisma.reservationPortfolio.deleteMany();
  await prisma.usageMetric.deleteMany();
  await prisma.organization.deleteMany();

  const orgNames = [
    'Acme Corp', 'Globex Corporation', 'Soylent Corp', 'Initech', 'Umbrella Corp',
    'Massive Dynamic', 'Hooli', 'Pied Piper', 'Stark Industries', 'Wayne Enterprises'
  ];

  const providers: CloudProvider[] = ['AWS', 'AZURE', 'GCP'];

  for (const name of orgNames) {
    const org = await prisma.organization.create({
      data: { name }
    });

    console.log(`Created organization: ${org.name}`);

    // Create Usage Metrics for the last 90 days
    const metricsData = [];
    const now = new Date();
    for (let i = 0; i < 90; i++) {
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - i);
      
      for (const provider of providers) {
        // Generate some synthetic usage data
        // Base usage + some seasonality + some noise
        const baseUsage = provider === 'AWS' ? 100 : (provider === 'AZURE' ? 70 : 50);
        const seasonality = Math.sin((i / 7) * 2 * Math.PI) * 20; // 7-day seasonality
        const noise = (Math.random() - 0.5) * 10;
        const usageValue = Math.max(10, baseUsage + seasonality + noise);
        
        metricsData.push({
          orgId: org.id,
          provider,
          computeUnit: usageValue,
          cost: usageValue * 0.1,
          usage: usageValue * 1.5,
          timestamp
        });
      }
    }

    await prisma.usageMetric.createMany({
      data: metricsData
    });

    // Create some Reservation Portfolios
    await prisma.reservationPortfolio.create({
      data: {
        orgId: org.id,
        provider: 'AWS',
        instanceType: 't3.medium',
        region: 'us-east-1',
        count: 5,
        normalizedUnitsPerInstance: 2.0,
        expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });

    await prisma.reservationPortfolio.create({
      data: {
        orgId: org.id,
        provider: 'AZURE',
        instanceType: 'Standard_D2s_v3',
        region: 'eastus',
        count: 3,
        normalizedUnitsPerInstance: 2.0,
        expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
