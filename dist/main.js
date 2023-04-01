"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const axios_1 = require("axios");
const oidcWarning = 'GitHub Actions did not inject $ACTIONS_ID_TOKEN_REQUEST_TOKEN or ' +
    '$ACTIONS_ID_TOKEN_REQUEST_URL into this job. This most likely means the ' +
    'GitHub Actions workflow permissions are incorrect, or this job is being ' +
    'run from a fork. For more information, please see https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token';
async function main() {
    const proxyUrl = (0, core_1.getInput)('proxy-url', { required: true });
    const roleToAssume = (0, core_1.getInput)('role-to-assume', { required: true });
    const proxyUrlPath = (0, core_1.getInput)('proxy-url-path', { required: true });
    let audience = (0, core_1.getInput)('custom-audience');
    if (!audience) {
        audience = 'api.cloudflare.com';
    }
    (0, core_1.debug)(`Using workload identity provider "${proxyUrl}"`);
    const oidcTokenRequestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
    const oidcTokenRequestURL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
    if (!oidcTokenRequestToken || !oidcTokenRequestURL) {
        throw new Error(oidcWarning);
    }
    const token = await (0, core_1.getIDToken)(audience);
    if (!token) {
        (0, core_1.warning)(oidcWarning);
        return;
    }
    const oidcClient = await axios_1.default.create({
        baseURL: proxyUrl,
        headers: {
            Authorization: `Bearer ${token}`,
            UserAgent: 'github-actions-workload-identity',
            'Content-Type': 'application/json',
        },
    });
    await oidcClient
        .post(proxyUrlPath, {
        roleToAssume,
    })
        .then(response => {
        const { data } = response;
        (0, core_1.info)(`Successfully generated token for ${data.name}`);
        (0, core_1.setSecret)(data.value);
        (0, core_1.setOutput)('api_token', data.value);
        (0, core_1.setOutput)('api_token_expiration', data.expires_on);
        (0, core_1.setOutput)('api_token_id', data.id);
    })
        .catch(error => {
        throw new Error(`Failed to generate token: ${error}`);
    });
}
main().catch(error => {
    (0, core_1.setFailed)(`waigel/cf-oidc-proxy-action failed with: ${error}`);
});
//# sourceMappingURL=main.js.map