#!/usr/bin/env node

import { Command } from 'commander';
import { findSuccessRevision, getPipelineFromBuildUrl } from '.';

async function main() {
  await new Command()
    .option('-v, --verbose', 'verbose output')
    .argument('<buildUrl>')
    .argument('<branch>')
    .action(async (buildUrl, branch, { verbose }) => {
      const pipeline = getPipelineFromBuildUrl(buildUrl);

      if (verbose) {
        Object.entries({ buildUrl, branch, pipeline }).forEach(([key, value]) =>
          console.error(`${key}: ${value}`)
        );
      }

      try {
        const lastSuccessRevision = await findSuccessRevision(
          pipeline,
          branch,
          process.env.CIRCLE_API_TOKEN ?? ''
        );

        if (!lastSuccessRevision) {
          throw new Error('did not find a successful build');
        }

        process.stdout.write(lastSuccessRevision);
      } catch (err: any) {
        console.error(err.message);
        process.exitCode = 1;
      }
    })
    .parseAsync(process.argv);
}

main();
