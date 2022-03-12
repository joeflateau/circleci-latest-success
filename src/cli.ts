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
        const success = await findSuccessRevision(
          pipeline,
          branch,
          process.env.CIRCLE_API_TOKEN ?? ''
        );

        process.stdout.write(success);
      } catch (err: any) {
        console.error(err.message);
      }
    })
    .parseAsync(process.argv);
}

main();
