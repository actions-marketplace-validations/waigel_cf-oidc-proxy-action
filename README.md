# cf-oidc-proxy-action
The GitHub Action for the cf-oidc-proxy

## Action
You can use this CF-OIDC-Proxy in combination with the waigel/cf-oidc-proxy-action@main Example Workflow to get Cloudflare short-lived api token over OIDC proxy:
```yml
name: Cloudflare OIDC Test
on:
  workflow_dispatch:
  
permissions:
  id-token: write
jobs:
  cloudflare:
    runs-on: ubuntu-latest
    steps:
      - uses: waigel/cf-oidc-proxy-action@main
        id: cloudflare
        with:
          proxy-url: https://<lambda-id>.execute-api.eu-central-1.amazonaws.com
          role-to-assume: dns
      - name: Verify API token is valid
        run: |
          curl "https://api.cloudflare.com/client/v4/user/tokens/verify" \
          -H  "Authorization: Bearer ${{ steps.cloudflare.outputs.api_token }}" \
          | grep -o '"message":"[^"]*"' | sed 's/"message":"\(.*\)"/\1/
```

---
Licensed under MIT License.
