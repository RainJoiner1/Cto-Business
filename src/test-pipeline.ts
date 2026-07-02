import { PrismaClient } from '@prisma/client';
import { runOptimizationPipeline } from './lib/pipeline.js';

const prisma = new PrismaClient();

async function test() {
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error("No organization found in DB. Run seed first.");
    return;
  }

  console.log(`Testing pipeline for ${org.name} (${org.id})`);
  const plan = await runOptimizationPipeline(org.id);
  
  if (plan) {
    const recommendations = await prisma.recommendation.findMany({
      where: { executionPlanId: plan.id }
    });
    console.log("Plan created successfully!");
    console.log("Recommendations:", recommendations);
  } else {
    console.log("Pipeline finished but no plan was created.");
  }

  await prisma.$disconnect();
}

test().catch(console.error);
