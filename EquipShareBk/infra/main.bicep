// ─────────────────────────────────────────────────────────────────────────────
// EquipShare – Azure Infrastructure (Bicep)
//
// Resources created (all free tier):
//   • Azure Cosmos DB for MongoDB API  — free tier (400 RU/s + 5 GB)
//   • Azure Container Apps Environment — consumption plan ($0 for demo loads)
//   • Azure Container App              — 0.25 vCPU / 0.5 GiB, scale-to-zero
//
// NOTE: Azure allows only ONE free-tier Cosmos DB account per subscription.
//       If you already have one, set FREE_TIER=false in this file and it will
//       use the cheapest paid serverless option instead.
// ─────────────────────────────────────────────────────────────────────────────

@description('Base name used to derive all resource names (e.g. equipshare)')
param appName string

@description('Azure region for all resources')
param location string = 'eastus'

@description('Container image to deploy (e.g. ghcr.io/ibshaya/equipshare:latest)')
param containerImage string

// ── Secrets (injected from GitHub Actions secrets) ────────────────────────────

@secure()
@description('JWT signing key – at least 32 characters')
param jwtAccessSecret string

@description('Frontend URL for CORS (e.g. https://my-app.azurestaticapps.net)')
param frontendUrl string = 'http://localhost:3000'

@secure()
@description('SMTP username for outbound email')
param smtpUser string = ''

@secure()
@description('SMTP password / app password for outbound email')
param smtpPass string = ''

@secure()
@description('Azure Blob Storage connection string (for listing images)')
param azureStorageConnectionString string = ''

@secure()
@description('Stripe secret key (sk_live_... or sk_test_...)')
param stripeSecretKey string = ''

@secure()
@description('GitHub PAT with read:packages scope — used to pull the private ghcr.io image')
param ghcrToken string = ''

// ── Non-secret config ─────────────────────────────────────────────────────────

@description('SMTP host')
param smtpHost string = 'smtp.gmail.com'

@description('SMTP port (string – passed as env var)')
param smtpPort string = '587'

@description('Sender display name for outbound emails')
param smtpFromName string = 'EquipShare'

@description('Sender email address for outbound emails')
param smtpFromEmail string = 'noreply@equipshare.com'

@description('Azure Blob Storage container name for listing images')
param azureStorageContainerName string = 'listings'

@description('Platform service fee rate (0.0 – 1.0)')
param platformServiceFeeRate string = '0.1'

// ── Cosmos DB for MongoDB API (free tier) ─────────────────────────────────────
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${appName}-mongo'
  location: location
  kind: 'MongoDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    enableFreeTier: true              // Free: 400 RU/s + 5 GB — 1 per subscription
    apiProperties: {
      serverVersion: '6.0'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      { name: 'EnableMongo' }
    ]
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 8
        backupStorageRedundancy: 'Local'
      }
    }
    // Disable public network access is NOT set so the Container App can connect
    publicNetworkAccess: 'Enabled'
  }
}

// Create the application database inside Cosmos DB
resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: 'equipshare'
  properties: {
    resource: { id: 'equipshare' }
    options: { throughput: 400 }    // Covered by the free tier allocation
  }
}

// Build the MongoDB connection URI with the database name embedded
// Raw Cosmos DB connection string format:
//   mongodb://{account}:{key}@{account}.mongo.cosmos.azure.com:10255/?ssl=true&...
// We insert the database name before '?':
var rawMongoUri = listConnectionStrings(cosmosAccount.id, '2023-04-15').connectionStrings[0].connectionString
var mongoUri = replace(rawMongoUri, '/?', '/equipshare?')

// ── Container Apps Environment (consumption – free tier) ─────────────────────
resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${appName}-env'
  location: location
  properties: {}
}

// ── Container App ─────────────────────────────────────────────────────────────
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${appName}-api'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
      }
      // All sensitive values stored as Container App secrets
      secrets: [
        { name: 'mongodb-uri',        value: mongoUri }
        { name: 'jwt-access-secret',  value: jwtAccessSecret }
        { name: 'smtp-user',          value: smtpUser }
        { name: 'smtp-pass',          value: smtpPass }
        { name: 'azure-storage-conn', value: azureStorageConnectionString }
        { name: 'stripe-secret-key',  value: stripeSecretKey }
        { name: 'ghcr-token',         value: ghcrToken }
      ]
      // Registry credentials so Container App can pull the private ghcr.io image
      registries: [
        {
          server:            'ghcr.io'
          username:          'ibshaya'
          passwordSecretRef: 'ghcr-token'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: containerImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            // ── Runtime ──────────────────────────────────────────────────────
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT',     value: '8080' }

            // ── MongoDB ───────────────────────────────────────────────────────
            { name: 'MONGODB_URI', secretRef: 'mongodb-uri' }

            // ── JWT ───────────────────────────────────────────────────────────
            { name: 'JWT_ACCESS_SECRET',  secretRef: 'jwt-access-secret' }
            { name: 'JWT_ACCESS_EXPIRES', value: '15m' }
            { name: 'JWT_REFRESH_EXPIRES', value: '7d' }

            // ── CORS / URLs ───────────────────────────────────────────────────
            { name: 'FRONTEND_URL', value: frontendUrl }
            // BASE_URL is set to the Container App's own FQDN automatically
            { name: 'BASE_URL', value: 'https://${appName}-api.${environment.properties.defaultDomain}' }

            // ── SMTP ──────────────────────────────────────────────────────────
            { name: 'SMTP_HOST',       value: smtpHost }
            { name: 'SMTP_PORT',       value: smtpPort }
            { name: 'SMTP_SECURE',     value: 'false' }
            { name: 'SMTP_USER',       secretRef: 'smtp-user' }
            { name: 'SMTP_PASS',       secretRef: 'smtp-pass' }
            { name: 'SMTP_FROM_NAME',  value: smtpFromName }
            { name: 'SMTP_FROM_EMAIL', value: smtpFromEmail }

            // ── Azure Blob Storage ────────────────────────────────────────────
            { name: 'AZURE_STORAGE_CONNECTION_STRING', secretRef: 'azure-storage-conn' }
            { name: 'AZURE_STORAGE_CONTAINER_NAME',    value: azureStorageContainerName }

            // ── Stripe ────────────────────────────────────────────────────────
            { name: 'STRIPE_SECRET_KEY',         secretRef: 'stripe-secret-key' }
            { name: 'PLATFORM_SERVICE_FEE_RATE', value: platformServiceFeeRate }
          ]
        }
      ]
      scale: {
        minReplicas: 0    // Scale to zero when idle — key to staying free
        maxReplicas: 1
      }
    }
  }
}

// ── Outputs ───────────────────────────────────────────────────────────────────
output containerAppUrl  string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output cosmosDbAccount  string = cosmosAccount.name
output containerAppName string = containerApp.name
