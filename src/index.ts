import Axios from 'axios';

async function printLastSuccessRevision(pipeline: string, branch: string) {
  try {
    const success = await findSuccessRevision(pipeline, branch);
    console.log(success);
  } catch (err) {
    console.error(err);
  }
}

async function findSuccessRevision(pipeline: string, branch: string) {
  let nextPageToken: string | null = null;
  do {
    const { data: response } = await Axios.get<{
      next_page_token: string | null;
      items: {
        id: string;
        vcs: { revision: string };
      }[];
    }>(
      `https://circleci.com/api/v2/project/${pipeline}/pipeline?branch=${branch}`,
      {
        headers: { 'Circle-Token': process.env.CIRCLE_API_TOKEN ?? '' },
      }
    );

    nextPageToken = response.next_page_token;

    for (const item of response.items) {
      if (await wasSuccessful(item.id)) {
        return item.vcs.revision;
      }
    }
  } while (nextPageToken != null);
}

async function wasSuccessful(pipelineId: string) {
  const workflow = await Axios.get<{ items: { status: string }[] }>(
    `https://circleci.com/api/v2/pipeline/${pipelineId}/workflow`,
    {
      headers: { 'Circle-Token': process.env.CIRCLE_API_TOKEN ?? '' },
    }
  );
  return workflow.data.items.every((wf) => wf.status === 'success');
}

printLastSuccessRevision(process.argv[2], process.argv[3]);
