// ─────────────────────────────────────────────────────────────────────────────
// EquipShare – Azure Static Web App Infrastructure (Bicep)
//
// Resources created (free tier):
//   • Azure Static Web App — Free SKU (100 GB bandwidth/month, custom domains)
//
// Deployment flow:
//   1. GitHub Actions deploys this Bicep to create/update the Static Web App.
//   2. The workflow then retrieves the deployment API key via az CLI.
//   3. `azure/static-web-apps-deploy@v1` builds and uploads the React app.
// ─────────────────────────────────────────────────────────────────────────────

@description('Base name used to derive all resource names (e.g. equipshare)')
param appName string

@description('Azure region for the Static Web App')
@allowed([
  'eastus2'
  'westus2'
  'centralus'
  'eastasia'
  'eastus'
  'westeurope'
  'southeastasia'
])
param location string = 'eastus2'

@description('Backend API base URL injected as REACT_APP_API_URL (e.g. https://equipshare-api.bluerock-abc.eastus.azurecontainerapps.io)')
param apiUrl string = ''

// ── Azure Static Web App ──────────────────────────────────────────────────────
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${appName}-web'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

// ── App Settings (env vars available to the React build and runtime) ──────────
resource appSettings 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    REACT_APP_API_URL: apiUrl
    REACT_APP_API_BASE_URL: apiUrl
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output staticWebAppUrl  string = 'https://${staticWebApp.properties.defaultHostname}'
output staticWebAppName string = staticWebApp.name
