import {
  debug as logDebug,
  getIDToken,
  getInput,
  info as logInfo,
  setFailed,
  setOutput,
  setSecret,
  warning as logWarning,
} from '@actions/core';

import axios from 'axios';
import {CloudflareTokenResponse} from './types';

const oidcWarning =
  'GitHub Actions did not inject $ACTIONS_ID_TOKEN_REQUEST_TOKEN or ' +
  '$ACTIONS_ID_TOKEN_REQUEST_URL into this job. This most likely means the ' +
  'GitHub Actions workflow permissions are incorrect, or this job is being ' +
  'run from a fork. For more information, please see https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token';

async function main() {
  const proxy = getInput('proxy', {required: true});
  const assumeGroup = getInput('assumeGroup', {required: true});
  const audience = getInput('audience');

  logDebug(`Using workload identity provider "${proxy}"`);

  const oidcTokenRequestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  const oidcTokenRequestURL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  if (!oidcTokenRequestToken || !oidcTokenRequestURL) {
    throw new Error(oidcWarning);
  }

  const token = await getIDToken(audience);
  if (!token) {
    logWarning(oidcWarning);
    return;
  }

  const oidcClient = await axios.create({
    baseURL: proxy,
    headers: {
      Authorization: `Bearer ${token}`,
      UserAgent: 'github-actions-workload-identity',
    },
  });

  await oidcClient
    .post<CloudflareTokenResponse>('/prod/openid-connect', {
      assumeGroup,
    })
    .then(response => {
      const {data} = response;
      logInfo(`Successfully generated token for ${data.name}`);
      setSecret(data.value);
      setOutput('api_key', data.value);
      setOutput('api_key_expiration', data.expires_on);
      setOutput('api_key_id', data.id);
    })
    .catch(error => {
      throw new Error(`Failed to generate token: ${error}`);
    });
}

main().catch(error => {
  setFailed(`waigel/cf-oidc-proxy-action failed with: ${error}`);
});
