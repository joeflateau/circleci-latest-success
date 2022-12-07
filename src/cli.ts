#!/usr/bin/env node

import { Command } from 'commander';
import { findSuccessRevision, getPipelineFromBuildUrl } from '.';

async function main() {
  await new Command()
    .option('-v, --verbose', 'verbose output')
    .argument('<buildUrl>')
    .argument('<branch>')
    .argument('[defaultBase]')
    .action(
      async (
        buildUrl: string,
        branch: string,
        defaultBase: string | undefined,
        { verbose }: { verbose: boolean }
      ) => {
        const pipeline = getPipelineFromBuildUrl(buildUrl);

        if (verbose) {
          Object.entries({ buildUrl, branch, pipeline }).forEach(
            ([key, value]) => console.error(`${key}: ${value}`)
          );
        }

        try {
          const lastSuccessRevision = await findSuccessRevision(
            pipeline,
            branch,
            process.env.CIRCLE_API_TOKEN ?? ''
          );

          if (lastSuccessRevision) {
            process.stdout.write(lastSuccessRevision);
          } else if (defaultBase) {
            process.stdout.write(defaultBase);
          } else {
            throw new Error(
              'did not find a successful build and no default was provided'
            );
          }
        } catch (err: any) {
          console.error(err.message);
          process.exitCode = 1;
        }
      }
    )
    .parseAsync(process.argv);
}

main();
