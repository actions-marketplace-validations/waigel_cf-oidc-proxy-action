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
  const proxyUrl = getInput('proxy-url', {required: true});
  const roleToAssume = getInput('role-to-assume', {required: true});
  const proxyUrlPath = getInput('proxy-url-path', {required: true});
  let audience = getInput('custom-audience');
  if (!audience) {
    audience = 'api.cloudflare.com';
  }

  logDebug(`Using workload identity provider "${proxyUrl}"`);

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
    baseURL: proxyUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      UserAgent: 'github-actions-workload-identity',
      'Content-Type': 'application/json',
    },
  });

  await oidcClient
    .post<CloudflareTokenResponse>(proxyUrlPath, {
      roleToAssume,
    })
    .then(response => {
      const {data} = response;
      logInfo(`Successfully generated token for ${data.name}`);
      setSecret(data.value);
      setOutput('api_token', data.value);
      setOutput('api_token_expiration', data.expires_on);
      setOutput('api_token_id', data.id);
    })
    .catch(error => {
      throw new Error(`Failed to generate token: ${error}`);
    });
}

main().catch(error => {
  setFailed(`waigel/cf-oidc-proxy-action failed with: ${error}`);
});
