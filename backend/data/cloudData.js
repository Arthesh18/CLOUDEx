// =========================================================
// CLOUDEX - CLOUD PROVIDER DATASET
// =========================================================

const cloudProviders = [

    // =====================================================
    // AWS
    // =====================================================

    {
        id: "aws",
        name: "Amazon Web Services",
        shortName: "AWS",
        logo: "aws",

        description:
            "A highly scalable cloud platform with a very large range of infrastructure and managed services.",

        strengths: [
            "Very large service ecosystem",
            "Excellent scalability",
            "Strong enterprise support",
            "Large global infrastructure",
            "Wide range of databases and AI services"
        ],

        weaknesses: [
            "Can become complex for beginners",
            "Pricing can be difficult to understand",
            "Large number of services may increase architectural complexity"
        ],

        pricingLevel: "Flexible",

        // CLOUDEx comparison scores
        beginnerFriendly: 6.4,
        affordability: 7.2,
        scalability: 9.8,
        enterprise: 9.9,
        aiMl: 9.7,
        globalReach: 9.8,

        services: {

            compute: [
                {
                    name: "Amazon EC2",
                    type: "Virtual Machines",
                    pricingModel: "Pay-as-you-go"
                },
                {
                    name: "AWS Lambda",
                    type: "Serverless",
                    pricingModel: "Pay-per-request"
                },
                {
                    name: "Amazon ECS",
                    type: "Containers",
                    pricingModel: "Usage-based"
                }
            ],

            storage: [
                {
                    name: "Amazon S3",
                    type: "Object Storage",
                    pricingModel: "Pay for storage and requests"
                },
                {
                    name: "Amazon EBS",
                    type: "Block Storage",
                    pricingModel: "Pay for provisioned storage"
                }
            ],

            database: [
                {
                    name: "Amazon RDS",
                    type: "Managed SQL Database",
                    pricingModel: "Instance + storage based"
                },
                {
                    name: "Amazon DynamoDB",
                    type: "NoSQL Database",
                    pricingModel: "Usage based"
                }
            ],

            ai: [
                {
                    name: "Amazon Bedrock",
                    type: "Generative AI",
                    pricingModel: "Model usage based"
                },
                {
                    name: "Amazon SageMaker",
                    type: "Machine Learning",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // MICROSOFT AZURE
    // =====================================================

    {
        id: "azure",
        name: "Microsoft Azure",
        shortName: "Azure",
        logo: "azure",

        description:
            "A broad cloud platform with strong integration with Microsoft technologies and enterprise environments.",

        strengths: [
            "Excellent Microsoft ecosystem integration",
            "Strong enterprise capabilities",
            "Good hybrid-cloud support",
            "Strong AI and data services",
            "Large global infrastructure"
        ],

        weaknesses: [
            "Can be complex for beginners",
            "Pricing can vary significantly by service",
            "Best suited to some Microsoft-heavy environments"
        ],

        pricingLevel: "Flexible",

        beginnerFriendly: 7.1,
        affordability: 7.0,
        scalability: 9.6,
        enterprise: 9.8,
        aiMl: 9.2,
        globalReach: 9.5,

        services: {

            compute: [
                {
                    name: "Azure Virtual Machines",
                    type: "Virtual Machines",
                    pricingModel: "Pay-as-you-go"
                },
                {
                    name: "Azure Functions",
                    type: "Serverless",
                    pricingModel: "Consumption based"
                },
                {
                    name: "Azure Kubernetes Service",
                    type: "Containers",
                    pricingModel: "Usage based"
                }
            ],

            storage: [
                {
                    name: "Azure Blob Storage",
                    type: "Object Storage",
                    pricingModel: "Usage based"
                },
                {
                    name: "Azure Disk Storage",
                    type: "Block Storage",
                    pricingModel: "Provisioned capacity"
                }
            ],

            database: [
                {
                    name: "Azure SQL Database",
                    type: "Managed SQL Database",
                    pricingModel: "Compute + storage based"
                },
                {
                    name: "Azure Cosmos DB",
                    type: "NoSQL Database",
                    pricingModel: "Request/capacity based"
                }
            ],

            ai: [
                {
                    name: "Azure AI Foundry",
                    type: "AI Platform",
                    pricingModel: "Service/model dependent"
                },
                {
                    name: "Azure Machine Learning",
                    type: "Machine Learning",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // GOOGLE CLOUD
    // =====================================================

    {
        id: "gcp",
        name: "Google Cloud",
        shortName: "GCP",
        logo: "gcp",

        description:
            "A cloud platform known for strong data analytics, machine learning, Kubernetes and modern application infrastructure.",

        strengths: [
            "Excellent data analytics",
            "Strong AI and machine learning",
            "Excellent Kubernetes ecosystem",
            "Modern developer tooling",
            "Strong global network"
        ],

        weaknesses: [
            "Smaller service ecosystem than AWS",
            "Some services can have complex pricing",
            "Enterprise ecosystem may be less familiar to some organizations"
        ],

        pricingLevel: "Flexible",

        beginnerFriendly: 8.2,
        affordability: 8.1,
        scalability: 9.1,
        enterprise: 8.7,
        aiMl: 9.8,
        globalReach: 9.2,

        services: {

            compute: [
                {
                    name: "Compute Engine",
                    type: "Virtual Machines",
                    pricingModel: "Pay-as-you-go"
                },
                {
                    name: "Cloud Run",
                    type: "Serverless Containers",
                    pricingModel: "Usage based"
                },
                {
                    name: "Google Kubernetes Engine",
                    type: "Containers",
                    pricingModel: "Cluster/resource based"
                }
            ],

            storage: [
                {
                    name: "Cloud Storage",
                    type: "Object Storage",
                    pricingModel: "Storage + usage based"
                }
            ],

            database: [
                {
                    name: "Cloud SQL",
                    type: "Managed SQL Database",
                    pricingModel: "Instance + storage based"
                },
                {
                    name: "Firestore",
                    type: "NoSQL Database",
                    pricingModel: "Usage based"
                },
                {
                    name: "BigQuery",
                    type: "Data Warehouse",
                    pricingModel: "Query/storage based"
                }
            ],

            ai: [
                {
                    name: "Vertex AI",
                    type: "AI / ML Platform",
                    pricingModel: "Model and usage based"
                }
            ]
        }
    },


    // =====================================================
    // ORACLE CLOUD
    // =====================================================

    {
        id: "oracle",
        name: "Oracle Cloud Infrastructure",
        shortName: "OCI",
        logo: "oracle",

        description:
            "A cloud platform with strong database, enterprise and compute capabilities, particularly useful for Oracle workloads.",

        strengths: [
            "Strong Oracle database ecosystem",
            "Competitive compute options",
            "Enterprise-focused infrastructure",
            "Good performance for Oracle workloads",
            "Useful free-tier options for experimentation"
        ],

        weaknesses: [
            "Smaller ecosystem than AWS",
            "Less popular for some modern developer workloads",
            "Some services have a smaller community"
        ],

        pricingLevel: "Competitive",

        beginnerFriendly: 6.3,
        affordability: 8.0,
        scalability: 8.4,
        enterprise: 9.1,
        aiMl: 7.5,
        globalReach: 8.2,

        services: {

            compute: [
                {
                    name: "OCI Compute",
                    type: "Virtual Machines",
                    pricingModel: "Usage based"
                },
                {
                    name: "OCI Container Instances",
                    type: "Containers",
                    pricingModel: "Usage based"
                }
            ],

            storage: [
                {
                    name: "OCI Object Storage",
                    type: "Object Storage",
                    pricingModel: "Storage + usage based"
                }
            ],

            database: [
                {
                    name: "Oracle Autonomous Database",
                    type: "Managed Database",
                    pricingModel: "Usage based"
                },
                {
                    name: "MySQL HeatWave",
                    type: "Managed Database",
                    pricingModel: "Usage based"
                }
            ],

            ai: [
                {
                    name: "OCI Generative AI",
                    type: "Generative AI",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // IBM CLOUD
    // =====================================================

    {
        id: "ibm",
        name: "IBM Cloud",
        shortName: "IBM",
        logo: "ibm",

        description:
            "An enterprise-oriented cloud platform with strong hybrid cloud, AI and regulated-industry capabilities.",

        strengths: [
            "Strong enterprise capabilities",
            "Hybrid cloud support",
            "AI and data services",
            "Strong regulated-industry focus",
            "Good security capabilities"
        ],

        weaknesses: [
            "Smaller ecosystem than AWS and Azure",
            "Less common among individual developers",
            "Fewer services in some categories"
        ],

        pricingLevel: "Flexible",

        beginnerFriendly: 7.0,
        affordability: 6.8,
        scalability: 8.1,
        enterprise: 9.2,
        aiMl: 8.4,
        globalReach: 8.3,

        services: {

            compute: [
                {
                    name: "IBM Virtual Servers",
                    type: "Virtual Machines",
                    pricingModel: "Usage based"
                },
                {
                    name: "IBM Code Engine",
                    type: "Serverless Containers",
                    pricingModel: "Usage based"
                }
            ],

            storage: [
                {
                    name: "IBM Cloud Object Storage",
                    type: "Object Storage",
                    pricingModel: "Usage based"
                }
            ],

            database: [
                {
                    name: "IBM Cloud Databases",
                    type: "Managed Database",
                    pricingModel: "Usage based"
                },
                {
                    name: "Db2",
                    type: "Enterprise Database",
                    pricingModel: "Usage based"
                }
            ],

            ai: [
                {
                    name: "watsonx.ai",
                    type: "AI Platform",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // DIGITALOCEAN
    // =====================================================

    {
        id: "digitalocean",
        name: "DigitalOcean",
        shortName: "DigitalOcean",
        logo: "digitalocean",

        description:
            "A developer-friendly cloud platform focused on simplicity, predictable infrastructure and smaller applications.",

        strengths: [
            "Very developer friendly",
            "Simple interface",
            "Easy deployment",
            "Good for startups and student projects",
            "Predictable infrastructure options"
        ],

        weaknesses: [
            "Smaller service ecosystem",
            "Less suitable for very large enterprises",
            "Fewer advanced AI services"
        ],

        pricingLevel: "Simple",

        beginnerFriendly: 9.6,
        affordability: 9.3,
        scalability: 7.2,
        enterprise: 5.8,
        aiMl: 6.1,
        globalReach: 6.7,

        services: {

            compute: [
                {
                    name: "Droplets",
                    type: "Virtual Machines",
                    pricingModel: "Monthly/hourly"
                },
                {
                    name: "App Platform",
                    type: "Platform as a Service",
                    pricingModel: "Resource based"
                }
            ],

            storage: [
                {
                    name: "Spaces",
                    type: "Object Storage",
                    pricingModel: "Monthly storage + transfer"
                }
            ],

            database: [
                {
                    name: "Managed Databases",
                    type: "Managed Database",
                    pricingModel: "Monthly resource based"
                }
            ],

            ai: [
                {
                    name: "GPU Droplets",
                    type: "AI / ML Compute",
                    pricingModel: "Usage based"
                }
            ]
        }
    }

];


// =========================================================
// HELPER FUNCTIONS
// =========================================================

function getAllProviders() {
    return cloudProviders;
}


function getProviderById(id) {

    return cloudProviders.find(
        provider => provider.id === id
    );

}


function getAllServices() {

    const services = [];

    cloudProviders.forEach(provider => {

        Object.entries(provider.services).forEach(
            ([category, categoryServices]) => {

                categoryServices.forEach(service => {

                    services.push({
                        provider: provider.shortName,
                        providerId: provider.id,
                        category,
                        ...service
                    });

                });

            }
        );

    });

    return services;

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {
    cloudProviders,
    getAllProviders,
    getProviderById,
    getAllServices
};