#!/usr/bin/env node

import { findSuccessRevision, getPipelineFromBuildUrl } from '.';

async function printLastSuccessRevision(buildUrl: string, branch: string) {
  try {
    const pipeline = getPipelineFromBuildUrl(buildUrl);
    console.error({ buildUrl, branch, pipeline });
    const success = await findSuccessRevision(
      pipeline,
      branch,
      process.env.CIRCLE_API_TOKEN ?? ''
    );
    console.log(success);
  } catch (err) {
    console.error(err);
  }
}

printLastSuccessRevision(process.argv[2], process.argv[3]);
