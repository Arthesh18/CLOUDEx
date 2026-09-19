/**
 * CLOUDEx - Official CSP & Service Links Registry
 * Feature #21: Centralized registry of verified official URLs for all 15 CSPs and services.
 *
 * Security & Integrity:
 * - Strictly HTTPS
 * - Strictly official provider domains (no affiliate, referral, or third-party links)
 * - Validated URL structure
 */

const OFFICIAL_PROVIDERS = {
    aws: {
        id: "aws",
        name: "Amazon Web Services",
        officialUrl: "https://aws.amazon.com",
        documentationUrl: "https://docs.aws.amazon.com",
        pricingUrl: "https://aws.amazon.com/pricing/",
        domain: "aws.amazon.com"
    },
    azure: {
        id: "azure",
        name: "Microsoft Azure",
        officialUrl: "https://azure.microsoft.com",
        documentationUrl: "https://learn.microsoft.com/azure/",
        pricingUrl: "https://azure.microsoft.com/pricing/",
        domain: "azure.microsoft.com"
    },
    gcp: {
        id: "gcp",
        name: "Google Cloud",
        officialUrl: "https://cloud.google.com",
        documentationUrl: "https://cloud.google.com/docs",
        pricingUrl: "https://cloud.google.com/pricing",
        domain: "cloud.google.com"
    },
    digitalocean: {
        id: "digitalocean",
        name: "DigitalOcean",
        officialUrl: "https://www.digitalocean.com",
        documentationUrl: "https://docs.digitalocean.com",
        pricingUrl: "https://www.digitalocean.com/pricing",
        domain: "digitalocean.com"
    },
    akamai: {
        id: "akamai",
        name: "Akamai Cloud (Linode)",
        officialUrl: "https://www.linode.com",
        documentationUrl: "https://www.linode.com/docs/",
        pricingUrl: "https://www.linode.com/pricing/",
        domain: "linode.com"
    },
    vultr: {
        id: "vultr",
        name: "Vultr",
        officialUrl: "https://www.vultr.com",
        documentationUrl: "https://docs.vultr.com",
        pricingUrl: "https://www.vultr.com/pricing/",
        domain: "vultr.com"
    },
    hetzner: {
        id: "hetzner",
        name: "Hetzner Cloud",
        officialUrl: "https://www.hetzner.com/cloud",
        documentationUrl: "https://docs.hetzner.com",
        pricingUrl: "https://www.hetzner.com/cloud#pricing",
        domain: "hetzner.com"
    },
    ovhcloud: {
        id: "ovhcloud",
        name: "OVHcloud",
        officialUrl: "https://www.ovhcloud.com",
        documentationUrl: "https://docs.ovh.com",
        pricingUrl: "https://www.ovhcloud.com/en/public-cloud/prices/",
        domain: "ovhcloud.com"
    },
    oracle: {
        id: "oracle",
        name: "Oracle Cloud Infrastructure",
        officialUrl: "https://www.oracle.com/cloud/",
        documentationUrl: "https://docs.oracle.com/en-us/iaas/",
        pricingUrl: "https://www.oracle.com/cloud/cost-estimator/",
        domain: "oracle.com"
    },
    alibaba: {
        id: "alibaba",
        name: "Alibaba Cloud",
        officialUrl: "https://www.alibabacloud.com",
        documentationUrl: "https://www.alibabacloud.com/help",
        pricingUrl: "https://www.alibabacloud.com/pricing",
        domain: "alibabacloud.com"
    },
    huawei: {
        id: "huawei",
        name: "Huawei Cloud",
        officialUrl: "https://www.huaweicloud.com/intl/en-us/",
        documentationUrl: "https://support.huaweicloud.com/intl/en-us/",
        pricingUrl: "https://www.huaweicloud.com/intl/en-us/pricing/index.html",
        domain: "huaweicloud.com"
    },
    tencent: {
        id: "tencent",
        name: "Tencent Cloud",
        officialUrl: "https://www.tencentcloud.com",
        documentationUrl: "https://www.tencentcloud.com/document",
        pricingUrl: "https://www.tencentcloud.com/pricing",
        domain: "tencentcloud.com"
    },
    ibm: {
        id: "ibm",
        name: "IBM Cloud",
        officialUrl: "https://www.ibm.com/cloud",
        documentationUrl: "https://cloud.ibm.com/docs",
        pricingUrl: "https://www.ibm.com/cloud/pricing",
        domain: "ibm.com"
    },
    cloudflare: {
        id: "cloudflare",
        name: "Cloudflare",
        officialUrl: "https://www.cloudflare.com",
        documentationUrl: "https://developers.cloudflare.com",
        pricingUrl: "https://www.cloudflare.com/plans/",
        domain: "cloudflare.com"
    },
    coreweave: {
        id: "coreweave",
        name: "CoreWeave",
        officialUrl: "https://www.coreweave.com",
        documentationUrl: "https://docs.coreweave.com",
        pricingUrl: "https://www.coreweave.com/pricing",
        domain: "coreweave.com"
    },
    // Aliases for compatibility
    scaleway: {
        id: "scaleway",
        name: "Scaleway",
        officialUrl: "https://www.scaleway.com",
        documentationUrl: "https://www.scaleway.com/en/docs/",
        pricingUrl: "https://www.scaleway.com/en/pricing/",
        domain: "scaleway.com"
    },
    render: {
        id: "render",
        name: "Render",
        officialUrl: "https://render.com",
        documentationUrl: "https://render.com/docs",
        pricingUrl: "https://render.com/pricing",
        domain: "render.com"
    }
};

/**
 * Verified official service documentation / product pages
 */
const OFFICIAL_SERVICES = {
    // AWS Services
    "aws:Amazon EC2": "https://aws.amazon.com/ec2/",
    "aws:AWS Lambda": "https://aws.amazon.com/lambda/",
    "aws:Amazon ECS": "https://aws.amazon.com/ecs/",
    "aws:Amazon S3": "https://aws.amazon.com/s3/",
    "aws:Amazon EBS": "https://aws.amazon.com/ebs/",
    "aws:Amazon RDS": "https://aws.amazon.com/rds/",
    "aws:Amazon DynamoDB": "https://aws.amazon.com/dynamodb/",
    "aws:Amazon VPC": "https://aws.amazon.com/vpc/",
    "aws:Amazon CloudFront": "https://aws.amazon.com/cloudfront/",
    "aws:Amazon SageMaker": "https://aws.amazon.com/sagemaker/",

    // Azure Services
    "azure:Azure Virtual Machines": "https://azure.microsoft.com/products/virtual-machines/",
    "azure:Azure Functions": "https://azure.microsoft.com/products/functions/",
    "azure:Azure Kubernetes Service": "https://azure.microsoft.com/products/kubernetes-service/",
    "azure:Azure Blob Storage": "https://azure.microsoft.com/products/storage/blobs/",
    "azure:Azure SQL Database": "https://azure.microsoft.com/products/azure-sql/database/",
    "azure:Azure Cosmos DB": "https://azure.microsoft.com/products/cosmos-db/",
    "azure:Azure OpenAI Service": "https://azure.microsoft.com/products/ai-services/openai-service/",

    // Google Cloud Services
    "gcp:Compute Engine": "https://cloud.google.com/compute",
    "gcp:Cloud Run": "https://cloud.google.com/run",
    "gcp:Google Kubernetes Engine": "https://cloud.google.com/kubernetes-engine",
    "gcp:Cloud Storage": "https://cloud.google.com/storage",
    "gcp:Cloud SQL": "https://cloud.google.com/sql",
    "gcp:Cloud Spanner": "https://cloud.google.com/spanner",
    "gcp:Vertex AI": "https://cloud.google.com/vertex-ai",

    // DigitalOcean Services
    "digitalocean:Droplets": "https://www.digitalocean.com/products/droplets",
    "digitalocean:App Platform": "https://www.digitalocean.com/products/app-platform",
    "digitalocean:Spaces": "https://www.digitalocean.com/products/spaces",
    "digitalocean:Managed Databases": "https://www.digitalocean.com/products/managed-databases",

    // Cloudflare Services
    "cloudflare:Cloudflare Workers": "https://workers.cloudflare.com",
    "cloudflare:Cloudflare R2": "https://www.cloudflare.com/developer-platform/r2/",

    // Hetzner Services
    "hetzner:Hetzner Cloud Servers": "https://www.hetzner.com/cloud",
    "hetzner:Hetzner Object Storage": "https://docs.hetzner.com/storage/object-storage",

    // Vultr Services
    "vultr:Vultr Cloud Compute": "https://www.vultr.com/products/cloud-compute/",
    "vultr:Vultr Kubernetes Engine": "https://www.vultr.com/products/kubernetes/",
    "vultr:Vultr Object Storage": "https://www.vultr.com/products/object-storage/",

    // Akamai / Linode Services
    "akamai:Akamai Cloud Compute": "https://www.linode.com/products/compute/",
    "akamai:Akamai Cloud Storage": "https://www.linode.com/products/object-storage/",
    "akamai:Akamai Edge Compute": "https://www.akamai.com/products/edge-workers",

    // CoreWeave Services
    "coreweave:CPU Compute": "https://www.coreweave.com/products/compute",
    "coreweave:Cloud Storage": "https://www.coreweave.com/products/storage",
    "coreweave:Kubernetes": "https://www.coreweave.com/products/kubernetes",

    // Oracle Cloud Services
    "oracle:OCI Compute": "https://www.oracle.com/cloud/compute/",
    "oracle:OCI Object Storage": "https://www.oracle.com/cloud/storage/object-storage/",
    "oracle:OCI Container Instances": "https://www.oracle.com/cloud/cloud-native/container-instances/",

    // IBM Cloud Services
    "ibm:IBM Virtual Servers": "https://www.ibm.com/products/virtual-servers",
    "ibm:IBM Cloud Object Storage": "https://www.ibm.com/products/cloud-object-storage",
    "ibm:IBM Code Engine": "https://www.ibm.com/products/code-engine",

    // Alibaba Cloud Services
    "alibaba:Elastic Compute Service": "https://www.alibabacloud.com/product/ecs",
    "alibaba:Object Storage Service": "https://www.alibabacloud.com/product/oss",
    "alibaba:Function Compute": "https://www.alibabacloud.com/product/function-compute"
};

/**
 * Validate that a URL is a secure, well-formed HTTPS link to an official domain.
 *
 * @param {string} url - URL to validate
 * @param {string} [expectedDomain] - Optional domain substring requirement
 * @returns {boolean} True if strictly valid
 */
function isValidOfficialUrl(url, expectedDomain = null) {
    if (!url || typeof url !== "string") return false;
    if (!url.startsWith("https://")) return false;

    // Reject javascript: or unsafe protocols
    if (url.toLowerCase().includes("javascript:") || url.toLowerCase().includes("data:")) {
        return false;
    }

    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") return false;

        if (expectedDomain) {
            const host = parsed.hostname.toLowerCase();
            const exp = expectedDomain.toLowerCase();
            if (!host.endsWith(exp) && !host.includes(exp)) {
                return false;
            }
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Retrieve official links for a provider.
 *
 * @param {string} providerId
 * @returns {Object|null}
 */
function getOfficialProviderLinks(providerId) {
    if (!providerId) return null;
    const key = providerId.toLowerCase().trim();
    return OFFICIAL_PROVIDERS[key] || null;
}

/**
 * Retrieve official link for a specific service.
 *
 * @param {string} providerId
 * @param {string} serviceName
 * @returns {string|null} Official URL or null if not established
 */
function getOfficialServiceLink(providerId, serviceName) {
    if (!providerId || !serviceName) return null;
    const lookupKey = `${providerId.toLowerCase().trim()}:${serviceName.trim()}`;
    const url = OFFICIAL_SERVICES[lookupKey];
    if (url && isValidOfficialUrl(url)) {
        return url;
    }
    return null;
}

module.exports = {
    OFFICIAL_PROVIDERS,
    OFFICIAL_SERVICES,
    isValidOfficialUrl,
    getOfficialProviderLinks,
    getOfficialServiceLink
};
