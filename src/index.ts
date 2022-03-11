import Axios from 'axios';

export async function findSuccessRevision(
  pipeline: string,
  branch: string,
  apiToken: string
) {
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
      params: { 'page-token': nextPageToken || undefined },
      headers: { 'Circle-Token': apiToken },
    });

    const data = response.data;

    nextPageToken = data.next_page_token;

    for (const item of data.items) {
      if (await wasSuccessful(item.id, apiToken)) {
        return item.vcs.revision;
      }
    }
  } while (nextPageToken != null);
}

export async function wasSuccessful(pipelineId: string, apiToken: string) {
  const fetchUrl = `https://circleci.com/api/v2/pipeline/${pipelineId}/workflow`;
  const workflow = await Axios.get<{ items: { status: string }[] }>(fetchUrl, {
    headers: { 'Circle-Token': apiToken },
  });
  return workflow.data.items.every((wf) => wf.status === 'success');
}

export function getPipelineFromBuildUrl(buildUrl: string) {
  // https://circleci.com/[platform]]/[username]/[repo]/tree/master
  return buildUrl.split('circleci.com/')[1].split('/').slice(0, 3).join('/');
}
