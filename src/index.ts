import Axios from 'axios';

async function printLastSuccessRevision(buildUrl: string, branch: string) {
  try {
    const pipeline = getPipelineFromBuildUrl(buildUrl);
    console.error({ buildUrl, branch, pipeline });
    const success = await findSuccessRevision(pipeline, branch);
    console.log(success);
  } catch (err) {
    console.error(err);
  }
}

async function findSuccessRevision(pipeline: string, branch: string) {
  let nextPageToken: string | null = null;
  do {
    const fetchUrl = `https://circleci.com/api/v2/project/${pipeline}/pipeline?branch=${branch}`;
    const response: {
      data: {
        next_page_token: string | null;
        items: {
          id: string;
          vcs: { revision: string };
        }[];
      };
    } = await Axios.get(fetchUrl, {
      params: { next_page_token: nextPageToken || undefined },
      headers: { 'Circle-Token': process.env.CIRCLE_API_TOKEN ?? '' },
    });

    const data = response.data;

    nextPageToken = data.next_page_token;

    for (const item of data.items) {
      if (await wasSuccessful(item.id)) {
        return item.vcs.revision;
      }
    }
  } while (nextPageToken != null);
}

async function wasSuccessful(pipelineId: string) {
  const fetchUrl = `https://circleci.com/api/v2/pipeline/${pipelineId}/workflow`;
  const workflow = await Axios.get<{ items: { status: string }[] }>(fetchUrl, {
    headers: { 'Circle-Token': process.env.CIRCLE_API_TOKEN ?? '' },
  });
  return workflow.data.items.every((wf) => wf.status === 'success');
}

function getPipelineFromBuildUrl(buildUrl: string) {
  // https://circleci.com/[platform]]/[username]/[repo]/tree/master
  return buildUrl.split('circleci.com/')[1].split('/').slice(0, 3).join('/');
}

printLastSuccessRevision(process.argv[2], process.argv[3]);
