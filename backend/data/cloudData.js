// =========================================================
// CLOUDEX - CLOUD PROVIDER DATASET
// 15 CLOUD SERVICE PROVIDERS
// =========================================================

const cloudProviders = [

    // =====================================================
    // 1. AWS
    // =====================================================

    {
        id: "aws",
        name: "Amazon Web Services",
        shortName: "AWS",
        logo: "aws",

        categories: [
            "ai",
            "enterprise"
        ],

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

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Strong security services and identity/access management for applications and enterprise workloads.",

            reliability:
                "Highly reliable infrastructure with multiple availability zones and regions.",

            performance:
                "Wide range of compute, networking and storage options for different performance requirements.",

            compliance:
                "Strong compliance support for many industries and regulatory requirements.",

            support:
                "Multiple support options, including paid technical support plans."
        },

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
    // 2. MICROSOFT AZURE
    // =====================================================

    {
        id: "azure",
        name: "Microsoft Azure",
        shortName: "Azure",
        logo: "azure",

        categories: [
            "beginner",
            "ai",
            "enterprise"
        ],

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

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Strong identity, access management and security services for enterprise applications.",

            reliability:
                "Strong availability architecture with multiple regions and availability options.",

            performance:
                "Wide range of compute, networking and storage services for different workloads.",

            compliance:
                "Extensive compliance capabilities for enterprise and regulated workloads.",

            support:
                "Multiple support plans and enterprise support options."
        },

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
    // 3. GOOGLE CLOUD
    // =====================================================

    {
        id: "gcp",
        name: "Google Cloud",
        shortName: "GCP",
        logo: "gcp",

        categories: [
            "beginner",
            "ai"
        ],

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

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Strong identity, security and infrastructure protection capabilities.",

            reliability:
                "Highly distributed infrastructure with strong availability and global networking.",

            performance:
                "Strong networking, compute and data-processing performance.",

            compliance:
                "Supports a wide range of security and compliance requirements.",

            support:
                "Multiple technical support options for different workloads."
        },

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
    // 4. ORACLE CLOUD
    // =====================================================

    {
        id: "oracle",
        name: "Oracle Cloud Infrastructure",
        shortName: "OCI",
        logo: "oracle",

        categories: [
            "enterprise"
        ],

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

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Strong identity, database security and enterprise security capabilities.",

            reliability:
                "Designed for highly available enterprise and database workloads.",

            performance:
                "Strong compute and database performance, particularly for Oracle workloads.",

            compliance:
                "Strong support for enterprise and regulated workloads.",

            support:
                "Enterprise-oriented technical support and service options."
        },

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
    // 5. IBM CLOUD
    // =====================================================

    {
        id: "ibm",
        name: "IBM Cloud",
        shortName: "IBM",
        logo: "ibm",

        categories: [
            "ai",
            "enterprise"
        ],

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

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Strong security, identity and enterprise protection capabilities.",

            reliability:
                "Enterprise infrastructure designed for reliable and hybrid workloads.",

            performance:
                "Compute and infrastructure options for enterprise applications.",

            compliance:
                "Strong focus on regulated industries and enterprise compliance.",

            support:
                "Enterprise support and technical assistance options."
        },

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
    // 6. DIGITALOCEAN
    // =====================================================

    {
        id: "digitalocean",
        name: "DigitalOcean",
        shortName: "DigitalOcean",
        logo: "digitalocean",

        categories: [
            "beginner"
        ],

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

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides standard cloud security, networking and access-control capabilities.",

            reliability:
                "Reliable infrastructure suitable for applications and smaller production workloads.",

            performance:
                "Straightforward compute and storage options designed for developer workloads.",

            compliance:
                "Provides security and compliance capabilities appropriate for supported workloads.",

            support:
                "Developer-oriented support resources and paid support options."
        },

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
    },


    // =====================================================
    // 7. ALIBABA CLOUD
    // =====================================================

    {
        id: "alibaba",
        name: "Alibaba Cloud",
        shortName: "Alibaba Cloud",
        logo: "alibaba",

        categories: [
            "ai",
            "enterprise"
        ],

        description:
            "A major cloud platform with strong infrastructure, database, analytics and AI capabilities, particularly prominent in Asia.",

        strengths: [
            "Strong presence in Asia",
            "Large range of cloud services",
            "Strong database and analytics capabilities",
            "AI and machine learning services",
            "Good scalability"
        ],

        weaknesses: [
            "Less familiar to many beginners outside Asia",
            "Large service ecosystem can be complex",
            "Some services are region dependent"
        ],

        pricingLevel: "Flexible",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides identity, network and cloud security services for applications.",

            reliability:
                "Large distributed infrastructure with strong regional availability.",

            performance:
                "Broad compute, networking and storage options for scalable workloads.",

            compliance:
                "Provides compliance capabilities across supported regions and industries.",

            support:
                "Technical support options for cloud workloads and enterprise customers."
        },

        beginnerFriendly: 6.5,
        affordability: 7.8,
        scalability: 9.2,
        enterprise: 8.8,
        aiMl: 8.7,
        globalReach: 8.4,

        services: {

            compute: [
                {
                    name: "Elastic Compute Service",
                    type: "Virtual Machines",
                    pricingModel: "Pay-as-you-go"
                },
                {
                    name: "Function Compute",
                    type: "Serverless",
                    pricingModel: "Usage based"
                },
                {
                    name: "Container Service for Kubernetes",
                    type: "Containers",
                    pricingModel: "Usage based"
                }
            ],

            storage: [
                {
                    name: "Object Storage Service",
                    type: "Object Storage",
                    pricingModel: "Storage + requests"
                }
            ],

            database: [
                {
                    name: "ApsaraDB RDS",
                    type: "Managed SQL Database",
                    pricingModel: "Instance + storage based"
                },
                {
                    name: "PolarDB",
                    type: "Cloud Database",
                    pricingModel: "Capacity based"
                }
            ],

            ai: [
                {
                    name: "PAI",
                    type: "AI / ML Platform",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 8. HUAWEI CLOUD
    // =====================================================

    {
        id: "huawei",
        name: "Huawei Cloud",
        shortName: "Huawei Cloud",
        logo: "huawei",

        categories: [
            "ai",
            "enterprise"
        ],

        description:
            "A global cloud platform offering compute, storage, databases, AI and enterprise cloud services.",

        strengths: [
            "Strong infrastructure capabilities",
            "Strong presence in Asia",
            "AI and machine learning services",
            "Wide range of cloud products",
            "Good enterprise infrastructure"
        ],

        weaknesses: [
            "Regional availability can vary",
            "Less familiar to some Western developers",
            "Large catalog can be complex"
        ],

        pricingLevel: "Flexible",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides cloud security, identity and infrastructure protection services.",

            reliability:
                "Distributed infrastructure designed for reliable enterprise workloads.",

            performance:
                "Wide range of compute, storage and networking capabilities.",

            compliance:
                "Provides security and compliance capabilities for supported regions.",

            support:
                "Technical and enterprise support options."
        },

        beginnerFriendly: 6.4,
        affordability: 7.7,
        scalability: 9.0,
        enterprise: 8.6,
        aiMl: 8.5,
        globalReach: 8.0,

        services: {

            compute: [
                {
                    name: "Elastic Cloud Server",
                    type: "Virtual Machines",
                    pricingModel: "Pay-as-you-go"
                },
                {
                    name: "FunctionGraph",
                    type: "Serverless",
                    pricingModel: "Usage based"
                },
                {
                    name: "Cloud Container Engine",
                    type: "Containers",
                    pricingModel: "Resource based"
                }
            ],

            storage: [
                {
                    name: "Object Storage Service",
                    type: "Object Storage",
                    pricingModel: "Storage + requests"
                }
            ],

            database: [
                {
                    name: "Relational Database Service",
                    type: "Managed SQL Database",
                    pricingModel: "Instance based"
                },
                {
                    name: "GaussDB",
                    type: "Distributed Database",
                    pricingModel: "Capacity based"
                }
            ],

            ai: [
                {
                    name: "ModelArts",
                    type: "AI / ML Platform",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 9. TENCENT CLOUD
    // =====================================================

    {
        id: "tencent",
        name: "Tencent Cloud",
        shortName: "Tencent Cloud",
        logo: "tencent",

        categories: [
            "ai",
            "enterprise"
        ],

        description:
            "A cloud platform with strong infrastructure, networking, databases, media and AI capabilities.",

        strengths: [
            "Strong infrastructure in Asia",
            "Good networking capabilities",
            "Strong database services",
            "AI and media services",
            "Good support for large-scale applications"
        ],

        weaknesses: [
            "Less familiar to many developers outside Asia",
            "Regional service availability varies",
            "Smaller global ecosystem than the largest hyperscalers"
        ],

        pricingLevel: "Flexible",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides identity, network and infrastructure security capabilities.",

            reliability:
                "Distributed infrastructure designed for scalable applications.",

            performance:
                "Strong networking, compute and media-oriented infrastructure.",

            compliance:
                "Provides security and compliance capabilities across supported regions.",

            support:
                "Technical support options for developers and enterprises."
        },

        beginnerFriendly: 6.3,
        affordability: 7.8,
        scalability: 8.9,
        enterprise: 8.3,
        aiMl: 8.4,
        globalReach: 7.9,

        services: {

            compute: [
                {
                    name: "Cloud Virtual Machine",
                    type: "Virtual Machines",
                    pricingModel: "Pay-as-you-go"
                },
                {
                    name: "CloudBase",
                    type: "Serverless Application Platform",
                    pricingModel: "Usage based"
                },
                {
                    name: "Tencent Kubernetes Engine",
                    type: "Containers",
                    pricingModel: "Resource based"
                }
            ],

            storage: [
                {
                    name: "Cloud Object Storage",
                    type: "Object Storage",
                    pricingModel: "Storage + requests"
                }
            ],

            database: [
                {
                    name: "TencentDB for MySQL",
                    type: "Managed SQL Database",
                    pricingModel: "Instance based"
                },
                {
                    name: "TDSQL",
                    type: "Distributed Database",
                    pricingModel: "Capacity based"
                }
            ],

            ai: [
                {
                    name: "Tencent Cloud AI",
                    type: "AI Platform",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 10. VULTR
    // =====================================================

    {
        id: "vultr",
        name: "Vultr",
        shortName: "Vultr",
        logo: "vultr",

        categories: [
            "beginner"
        ],

        description:
            "A developer-focused cloud platform offering straightforward compute, storage and GPU infrastructure across many locations.",

        strengths: [
            "Simple developer experience",
            "Straightforward compute offerings",
            "Wide geographic deployment options",
            "Competitive pricing",
            "GPU cloud options"
        ],

        weaknesses: [
            "Smaller managed-service ecosystem",
            "Less enterprise-focused than major hyperscalers",
            "Fewer advanced platform services"
        ],

        pricingLevel: "Simple",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides standard cloud networking, access control and infrastructure security.",

            reliability:
                "Distributed cloud infrastructure suitable for applications across multiple locations.",

            performance:
                "Straightforward compute and GPU options with a focus on developer workloads.",

            compliance:
                "Provides security and compliance features appropriate to supported services.",

            support:
                "Developer-focused documentation and support resources."
        },

        beginnerFriendly: 8.7,
        affordability: 9.0,
        scalability: 7.8,
        enterprise: 6.4,
        aiMl: 7.5,
        globalReach: 8.6,

        services: {

            compute: [
                {
                    name: "Vultr Cloud Compute",
                    type: "Virtual Machines",
                    pricingModel: "Hourly/monthly"
                },
                {
                    name: "Vultr Kubernetes Engine",
                    type: "Containers",
                    pricingModel: "Resource based"
                }
            ],

            storage: [
                {
                    name: "Vultr Block Storage",
                    type: "Block Storage",
                    pricingModel: "Provisioned capacity"
                },
                {
                    name: "Vultr Object Storage",
                    type: "Object Storage",
                    pricingModel: "Storage + transfer"
                }
            ],

            database: [
                {
                    name: "Vultr Managed Databases",
                    type: "Managed Database",
                    pricingModel: "Resource based"
                }
            ],

            ai: [
                {
                    name: "Vultr GPU",
                    type: "GPU / AI Compute",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 11. HETZNER CLOUD
    // =====================================================

    {
        id: "hetzner",
        name: "Hetzner Cloud",
        shortName: "Hetzner",
        logo: "hetzner",

        categories: [
            "beginner"
        ],

        description:
            "A cost-focused cloud platform known for straightforward compute, storage and networking services.",

        strengths: [
            "Competitive pricing",
            "Simple cloud infrastructure",
            "Good performance for the price",
            "Developer friendly",
            "Strong European presence"
        ],

        weaknesses: [
            "Smaller global footprint than hyperscalers",
            "Smaller managed-service ecosystem",
            "Less suitable for some large enterprise requirements"
        ],

        pricingLevel: "Simple",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides standard infrastructure security, networking and access controls.",

            reliability:
                "Reliable infrastructure suited to applications, servers and developer workloads.",

            performance:
                "Strong compute performance relative to cost.",

            compliance:
                "Provides security and data-protection capabilities for supported workloads.",

            support:
                "Documentation and customer support focused on infrastructure users."
        },

        beginnerFriendly: 8.5,
        affordability: 9.6,
        scalability: 7.7,
        enterprise: 6.2,
        aiMl: 6.7,
        globalReach: 6.9,

        services: {

            compute: [
                {
                    name: "Hetzner Cloud Servers",
                    type: "Virtual Machines",
                    pricingModel: "Hourly/monthly"
                },
                {
                    name: "Hetzner Cloud Kubernetes",
                    type: "Containers",
                    pricingModel: "Resource based"
                }
            ],

            storage: [
                {
                    name: "Hetzner Volumes",
                    type: "Block Storage",
                    pricingModel: "Provisioned capacity"
                },
                {
                    name: "Hetzner Object Storage",
                    type: "Object Storage",
                    pricingModel: "Storage + transfer"
                }
            ],

            database: [
                {
                    name: "Managed Databases",
                    type: "Managed Database",
                    pricingModel: "Resource based"
                }
            ],

            ai: [
                {
                    name: "GPU Servers",
                    type: "GPU / AI Compute",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 12. OVHCLOUD
    // =====================================================

    {
        id: "ovhcloud",
        name: "OVHcloud",
        shortName: "OVHcloud",
        logo: "ovhcloud",

        categories: [
            "enterprise"
        ],

        description:
            "A European cloud provider offering public cloud, dedicated infrastructure, storage, networking and AI services.",

        strengths: [
            "Strong European infrastructure",
            "Competitive infrastructure pricing",
            "Wide range of compute options",
            "Dedicated server offerings",
            "GPU and AI infrastructure"
        ],

        weaknesses: [
            "Smaller ecosystem than hyperscalers",
            "Some services require more technical knowledge",
            "Regional service differences"
        ],

        pricingLevel: "Competitive",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides infrastructure, network and application security capabilities.",

            reliability:
                "Distributed European and global infrastructure for reliable workloads.",

            performance:
                "Broad compute, networking, storage and dedicated infrastructure options.",

            compliance:
                "Strong focus on European data protection and supported compliance requirements.",

            support:
                "Technical support options for cloud and enterprise customers."
        },

        beginnerFriendly: 7.2,
        affordability: 8.8,
        scalability: 8.0,
        enterprise: 7.4,
        aiMl: 7.7,
        globalReach: 7.8,

        services: {

            compute: [
                {
                    name: "OVHcloud Public Cloud",
                    type: "Virtual Machines",
                    pricingModel: "Hourly/monthly"
                },
                {
                    name: "Managed Kubernetes Service",
                    type: "Containers",
                    pricingModel: "Resource based"
                }
            ],

            storage: [
                {
                    name: "Object Storage",
                    type: "Object Storage",
                    pricingModel: "Storage + transfer"
                },
                {
                    name: "Block Storage",
                    type: "Block Storage",
                    pricingModel: "Provisioned capacity"
                }
            ],

            database: [
                {
                    name: "Managed Databases",
                    type: "Managed Database",
                    pricingModel: "Resource based"
                }
            ],

            ai: [
                {
                    name: "AI Endpoints",
                    type: "AI Platform",
                    pricingModel: "Usage based"
                },
                {
                    name: "GPU Instances",
                    type: "GPU / AI Compute",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 13. CLOUDFLARE
    // =====================================================

    {
        id: "cloudflare",
        name: "Cloudflare",
        shortName: "Cloudflare",
        logo: "cloudflare",

        categories: [
            "beginner",
            "ai",
            "enterprise"
        ],

        description:
            "A globally distributed cloud and connectivity platform focused on edge computing, security, networking and developer services.",

        strengths: [
            "Excellent global edge network",
            "Strong security capabilities",
            "Excellent developer platform",
            "Strong performance for edge applications",
            "Simple serverless deployment"
        ],

        weaknesses: [
            "Not a traditional full hyperscale cloud",
            "Some workloads are better suited to other providers",
            "Architecture differs from traditional VM-based clouds"
        ],

        pricingLevel: "Usage based",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Strong security platform covering application protection, networking and access control.",

            reliability:
                "Highly distributed edge infrastructure designed for resilient applications.",

            performance:
                "Excellent edge performance and globally distributed application delivery.",

            compliance:
                "Provides security and compliance capabilities for supported enterprise workloads.",

            support:
                "Documentation and paid support options for different customer requirements."
        },

        beginnerFriendly: 8.8,
        affordability: 8.6,
        scalability: 8.8,
        enterprise: 8.2,
        aiMl: 7.8,
        globalReach: 9.8,

        services: {

            compute: [
                {
                    name: "Cloudflare Workers",
                    type: "Edge Serverless",
                    pricingModel: "Request/usage based"
                },
                {
                    name: "Cloudflare Pages",
                    type: "Web Application Platform",
                    pricingModel: "Plan/usage based"
                },
                {
                    name: "Durable Objects",
                    type: "Stateful Edge Compute",
                    pricingModel: "Usage based"
                }
            ],

            storage: [
                {
                    name: "Cloudflare R2",
                    type: "Object Storage",
                    pricingModel: "Storage + operations"
                },
                {
                    name: "Workers KV",
                    type: "Key-Value Storage",
                    pricingModel: "Usage based"
                }
            ],

            database: [
                {
                    name: "D1",
                    type: "SQL Database",
                    pricingModel: "Usage based"
                },
                {
                    name: "Hyperdrive",
                    type: "Database Connectivity",
                    pricingModel: "Usage based"
                }
            ],

            ai: [
                {
                    name: "Workers AI",
                    type: "AI Platform",
                    pricingModel: "Usage based"
                },
                {
                    name: "Vectorize",
                    type: "Vector Database",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 14. AKAMAI CLOUD
    // =====================================================

    {
        id: "akamai",
        name: "Akamai Cloud",
        shortName: "Akamai",
        logo: "akamai",

        categories: [
            "enterprise"
        ],

        description:
            "A distributed cloud platform built around edge computing, application delivery, security and infrastructure services.",

        strengths: [
            "Large edge network",
            "Strong security capabilities",
            "Good application delivery",
            "Distributed cloud infrastructure",
            "Strong performance for edge workloads"
        ],

        weaknesses: [
            "Less familiar to beginners",
            "Smaller general-purpose cloud ecosystem",
            "Best suited to particular distributed workloads"
        ],

        pricingLevel: "Usage based",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Strong application, network and edge security capabilities.",

            reliability:
                "Large distributed edge infrastructure designed for resilient application delivery.",

            performance:
                "Strong global edge performance and application delivery capabilities.",

            compliance:
                "Enterprise security and compliance capabilities for supported workloads.",

            support:
                "Enterprise-oriented technical support and service options."
        },

        beginnerFriendly: 7.0,
        affordability: 7.5,
        scalability: 8.5,
        enterprise: 8.4,
        aiMl: 6.8,
        globalReach: 9.5,

        services: {

            compute: [
                {
                    name: "Akamai Cloud Compute",
                    type: "Virtual Machines",
                    pricingModel: "Hourly/monthly"
                },
                {
                    name: "Akamai Edge Compute",
                    type: "Edge Compute",
                    pricingModel: "Usage based"
                }
            ],

            storage: [
                {
                    name: "Akamai Cloud Storage",
                    type: "Object Storage",
                    pricingModel: "Usage based"
                }
            ],

            database: [
                {
                    name: "Managed Databases",
                    type: "Managed Database",
                    pricingModel: "Resource based"
                }
            ],

            ai: [
                {
                    name: "GPU Cloud",
                    type: "GPU / AI Compute",
                    pricingModel: "Usage based"
                }
            ]
        }
    },


    // =====================================================
    // 15. COREWEAVE
    // =====================================================

    {
        id: "coreweave",
        name: "CoreWeave",
        shortName: "CoreWeave",
        logo: "coreweave",

        categories: [
            "ai",
            "enterprise"
        ],

        description:
            "A specialized cloud platform focused on GPU-accelerated computing, AI training, inference and high-performance workloads.",

        strengths: [
            "Strong GPU infrastructure",
            "Designed for AI workloads",
            "High-performance computing",
            "Strong AI infrastructure focus",
            "Kubernetes-based cloud infrastructure"
        ],

        weaknesses: [
            "Specialized rather than general-purpose",
            "Less suitable for simple websites",
            "Smaller general cloud ecosystem",
            "GPU-focused workloads may be more expensive than basic compute"
        ],

        pricingLevel: "Usage based",

        officialLinks: {
            website: "",
            documentation: "",
            pricing: ""
        },

        capabilities: {
            security:
                "Provides infrastructure security and access controls for cloud workloads.",

            reliability:
                "Designed for high-performance AI and compute workloads.",

            performance:
                "Highly optimized GPU infrastructure for AI, machine learning and high-performance computing.",

            compliance:
                "Provides security and compliance capabilities appropriate to supported enterprise workloads.",

            support:
                "Technical support focused on high-performance and AI infrastructure."
        },

        beginnerFriendly: 6.2,
        affordability: 6.8,
        scalability: 8.7,
        enterprise: 8.0,
        aiMl: 9.9,
        globalReach: 7.2,

        services: {

            compute: [
                {
                    name: "GPU Compute",
                    type: "GPU Virtual Machines",
                    pricingModel: "Usage based"
                },
                {
                    name: "CPU Compute",
                    type: "Virtual Machines",
                    pricingModel: "Usage based"
                },
                {
                    name: "Kubernetes",
                    type: "Containers",
                    pricingModel: "Resource based"
                }
            ],

            storage: [
                {
                    name: "Cloud Storage",
                    type: "Object Storage",
                    pricingModel: "Usage based"
                },
                {
                    name: "Block Storage",
                    type: "Block Storage",
                    pricingModel: "Provisioned capacity"
                }
            ],

            database: [
                {
                    name: "Managed Database Options",
                    type: "Managed Database",
                    pricingModel: "Usage based"
                }
            ],

            ai: [
                {
                    name: "GPU Cloud",
                    type: "AI / ML Compute",
                    pricingModel: "Usage based"
                },
                {
                    name: "AI Infrastructure",
                    type: "AI / ML Platform",
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

        Object.entries(
            provider.services
        ).forEach(
            ([category, categoryServices]) => {

                categoryServices.forEach(
                    service => {

                        services.push({

                            provider:
                                provider.shortName,

                            providerId:
                                provider.id,

                            category,

                            ...service
                        });

                    }
                );

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