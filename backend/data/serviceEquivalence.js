/**
 * CLOUDEx - Service Equivalence Mapping & Comparison Engine
 * Feature #3: Service-to-Service Comparison
 */

const { cloudProviders, getProviderById } = require("./cloudData");

const serviceEquivalenceGroups = [
    {
        key: "virtual-machines",
        title: "Virtual Machines & Core Compute",
        category: "compute",
        icon: "fa-server",
        description: "General-purpose scalable compute instances and virtual machines for application servers and custom operating systems.",
        mappings: {
            aws: "Amazon EC2",
            azure: "Azure Virtual Machines",
            gcp: "Compute Engine",
            oracle: "OCI Compute",
            ibm: "IBM Virtual Servers",
            digitalocean: "Droplets",
            alibaba: "Elastic Compute Service",
            huawei: "Elastic Cloud Server",
            tencent: "Cloud Virtual Machine",
            vultr: "Vultr Cloud Compute",
            hetzner: "Hetzner Cloud Servers",
            ovhcloud: "OVHcloud Public Cloud",
            akamai: "Akamai Cloud Compute",
            coreweave: "CPU Compute"
        }
    },
    {
        key: "managed-kubernetes",
        title: "Managed Containers & Kubernetes",
        category: "compute",
        icon: "fa-cubes",
        description: "Container orchestration and managed Kubernetes clusters for deploying, scaling, and managing containerized microservices.",
        mappings: {
            aws: "Amazon ECS",
            azure: "Azure Kubernetes Service",
            gcp: "Google Kubernetes Engine",
            oracle: "OCI Container Instances",
            ibm: "IBM Code Engine",
            alibaba: "Container Service for Kubernetes",
            huawei: "Cloud Container Engine",
            tencent: "Tencent Kubernetes Engine",
            vultr: "Vultr Kubernetes Engine",
            hetzner: "Hetzner Cloud Kubernetes",
            ovhcloud: "Managed Kubernetes Service",
            coreweave: "Kubernetes"
        }
    },
    {
        key: "serverless-functions",
        title: "Serverless Functions & Scale-to-Zero",
        category: "compute",
        icon: "fa-bolt",
        description: "Event-driven execution environments where code runs on demand without managing or provisioning servers.",
        mappings: {
            aws: "AWS Lambda",
            azure: "Azure Functions",
            gcp: "Cloud Run",
            ibm: "IBM Code Engine",
            digitalocean: "App Platform",
            alibaba: "Function Compute",
            huawei: "FunctionGraph",
            tencent: "CloudBase",
            cloudflare: "Cloudflare Workers",
            akamai: "Akamai Edge Compute"
        }
    },
    {
        key: "object-storage",
        title: "Object Storage",
        category: "storage",
        icon: "fa-box-archive",
        description: "Highly scalable and durable storage for unstructured assets, backups, static websites, and media files.",
        mappings: {
            aws: "Amazon S3",
            azure: "Azure Blob Storage",
            gcp: "Cloud Storage",
            oracle: "OCI Object Storage",
            ibm: "IBM Cloud Object Storage",
            digitalocean: "Spaces",
            alibaba: "Object Storage Service",
            huawei: "Object Storage Service",
            tencent: "Cloud Object Storage",
            vultr: "Vultr Object Storage",
            hetzner: "Hetzner Object Storage",
            ovhcloud: "Object Storage",
            cloudflare: "Cloudflare R2",
            akamai: "Akamai Cloud Storage",
            coreweave: "Cloud Storage"
        }
    },
    {
        key: "block-storage",
        title: "Block Storage & Persistent Volumes",
        category: "storage",
        icon: "fa-hard-drive",
        description: "High-performance block volumes attachable to virtual instances for OS filesystems, transactional databases, and I/O-intensive workloads.",
        mappings: {
            aws: "Amazon EBS",
            azure: "Azure Disk Storage",
            vultr: "Vultr Block Storage",
            hetzner: "Hetzner Volumes",
            ovhcloud: "Block Storage",
            coreweave: "Block Storage"
        }
    },
    {
        key: "relational-database",
        title: "Managed Relational (SQL) Databases",
        category: "database",
        icon: "fa-database",
        description: "Fully managed SQL database engines with automated backups, patching, replication, and high availability.",
        mappings: {
            aws: "Amazon RDS",
            azure: "Azure SQL Database",
            gcp: "Cloud SQL",
            oracle: "Oracle Autonomous Database",
            ibm: "IBM Cloud Databases",
            digitalocean: "Managed Databases",
            alibaba: "ApsaraDB RDS",
            huawei: "Relational Database Service",
            tencent: "TencentDB for MySQL",
            vultr: "Vultr Managed Databases",
            hetzner: "Managed Databases",
            ovhcloud: "Managed Databases",
            cloudflare: "D1",
            akamai: "Managed Databases",
            coreweave: "Managed Database Options"
        }
    },
    {
        key: "nosql-database",
        title: "NoSQL & Distributed Key-Value Datastores",
        category: "database",
        icon: "fa-table-cells",
        description: "Globally distributed, flexible-schema document and key-value datastores built for low latency at massive scale.",
        mappings: {
            aws: "Amazon DynamoDB",
            azure: "Azure Cosmos DB",
            gcp: "Firestore",
            cloudflare: "Workers KV"
        }
    },
    {
        key: "ai-ml-platform",
        title: "AI & Machine Learning Platforms",
        category: "ai",
        icon: "fa-brain",
        description: "Comprehensive machine learning development environments, foundation model fine-tuning, and dedicated GPU computing.",
        mappings: {
            aws: "Amazon SageMaker",
            azure: "Azure Machine Learning",
            gcp: "Vertex AI",
            oracle: "OCI Generative AI",
            ibm: "watsonx.ai",
            digitalocean: "GPU Droplets",
            alibaba: "PAI",
            huawei: "ModelArts",
            tencent: "Tencent Cloud AI",
            vultr: "Vultr GPU",
            hetzner: "GPU Servers",
            ovhcloud: "AI Endpoints",
            cloudflare: "Workers AI",
            akamai: "GPU Cloud",
            coreweave: "AI Infrastructure"
        }
    }
];

function getEquivalenceGroups() {
    return serviceEquivalenceGroups.map(g => ({
        key: g.key,
        title: g.title,
        category: g.category,
        icon: g.icon,
        description: g.description,
        supportedProvidersCount: Object.keys(g.mappings).length
    }));
}

function getEquivalentService(groupKey, providerId) {
    const group = serviceEquivalenceGroups.find(g => g.key === groupKey);
    if (!group) return null;

    const provider = getProviderById(providerId);
    if (!provider) return null;

    const mappedServiceName = group.mappings[providerId];
    if (!mappedServiceName) {
        return {
            hasEquivalent: false,
            provider: {
                id: provider.id,
                name: provider.name,
                shortName: provider.shortName,
                icon: provider.icon || "fa-cloud"
            },
            service: null,
            message: `${provider.shortName || provider.name} does not currently have a mapped equivalent for ${group.title}.`
        };
    }

    const allServices = Object.values(provider.services || {}).flat();
    const service = allServices.find(s => s.name === mappedServiceName) || null;

    if (!service) {
        return {
            hasEquivalent: false,
            provider: {
                id: provider.id,
                name: provider.name,
                shortName: provider.shortName,
                icon: provider.icon || "fa-cloud"
            },
            service: null,
            message: `${provider.shortName || provider.name} does not currently have a mapped equivalent for ${group.title}.`
        };
    }

    return {
        hasEquivalent: true,
        provider: {
            id: provider.id,
            name: provider.name,
            shortName: provider.shortName,
            icon: provider.icon || "fa-cloud"
        },
        service: {
            ...service,
            groupKey: group.key,
            groupTitle: group.title
        }
    };
}

function compareEquivalentServices(groupKey, providerIds = []) {
    const group = serviceEquivalenceGroups.find(g => g.key === groupKey);
    if (!group) return null;

    const pIds = Array.isArray(providerIds) && providerIds.length > 0
        ? providerIds
        : cloudProviders.map(p => p.id);

    const comparisons = pIds.map(pId => getEquivalentService(groupKey, pId)).filter(Boolean);

    return {
        group: {
            key: group.key,
            title: group.title,
            category: group.category,
            icon: group.icon,
            description: group.description
        },
        comparisons
    };
}

function findEquivalenceGroupForService(serviceName, providerId) {
    for (const group of serviceEquivalenceGroups) {
        if (group.mappings[providerId] === serviceName) {
            return group;
        }
    }
    return null;
}

module.exports = {
    serviceEquivalenceGroups,
    getEquivalenceGroups,
    getEquivalentService,
    compareEquivalentServices,
    findEquivalenceGroupForService
};
