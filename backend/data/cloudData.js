// =========================================================
// CLOUDEX - CLOUD PROVIDER DATASET
// 15 CLOUD SERVICE PROVIDERS
// =========================================================

const cloudProviders = [
    {
        "id": "aws",
        "name": "Amazon Web Services",
        "shortName": "AWS",
        "logo": "aws",
        "categories": [
            "ai",
            "enterprise"
        ],
        "description": "A highly scalable cloud platform with a very large range of infrastructure and managed services.",
        "strengths": [
            "Very large service ecosystem",
            "Excellent scalability",
            "Strong enterprise support",
            "Large global infrastructure",
            "Wide range of databases and AI services"
        ],
        "weaknesses": [
            "Can become complex for beginners",
            "Pricing can be difficult to understand",
            "Large number of services may increase architectural complexity"
        ],
        "pricingLevel": "Flexible",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Strong security services and identity/access management for applications and enterprise workloads.",
            "reliability": "Highly reliable infrastructure with multiple availability zones and regions.",
            "performance": "Wide range of compute, networking and storage options for different performance requirements.",
            "compliance": "Strong compliance support for many industries and regulatory requirements.",
            "support": "Multiple support options, including paid technical support plans."
        },
        "beginnerFriendly": 6.4,
        "affordability": 7.2,
        "scalability": 9.8,
        "enterprise": 9.9,
        "aiMl": 9.7,
        "globalReach": 9.8,
        "services": {
            "compute": [
                {
                    "name": "Amazon EC2",
                    "type": "Virtual Machines",
                    "pricingModel": "Pay-as-you-go",
                    "description": "Scalable virtual computing capacity (instances) in the AWS cloud with custom CPU, memory, and storage options.",
                    "bestFor": "General-purpose web servers, background workers, legacy enterprise applications, and custom OS environments.",
                    "advantages": [
                        "Broad instance family selection (compute, memory, GPU)",
                        "Global availability across all AWS regions",
                        "Spot and Reserved instance pricing discounts"
                    ],
                    "limitations": [
                        "Requires manual OS configuration and security patch management",
                        "Complex pricing calculation with bandwidth and EBS charges"
                    ]
                },
                {
                    "name": "AWS Lambda",
                    "type": "Serverless",
                    "pricingModel": "Pay-per-request",
                    "description": "Event-driven serverless compute service that runs code in response to events without provisioning servers.",
                    "bestFor": "REST APIs, event-driven data processing, IoT backends, and scheduled background tasks.",
                    "advantages": [
                        "Zero idle cost — pay only for execution duration",
                        "Automatic scaling to match incoming request volume",
                        "Native integration with S3, DynamoDB, and API Gateway"
                    ],
                    "limitations": [
                        "Cold start latencies on infrequently invoked functions",
                        "15-minute maximum execution time limit"
                    ]
                },
                {
                    "name": "Amazon ECS",
                    "type": "Containers",
                    "pricingModel": "Usage-based",
                    "description": "Fully managed container orchestration service to deploy, manage, and scale containerized applications using Docker.",
                    "bestFor": "Microservices architectures, Dockerized web applications, and batch processing workloads.",
                    "advantages": [
                        "Simpler configuration than Kubernetes",
                        "Deep AWS IAM, CloudWatch, and VPC networking integration",
                        "Supports AWS Fargate for serverless container execution"
                    ],
                    "limitations": [
                        "Vendor-specific orchestration model (AWS only)",
                        "Less portable than standard Kubernetes"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Amazon S3",
                    "type": "Object Storage",
                    "pricingModel": "Pay for storage and requests",
                    "description": "Highly durable, scalable cloud object storage built to store and retrieve any amount of data from anywhere.",
                    "bestFor": "Static website hosting, user uploads, backups, data lakes, and multimedia content delivery.",
                    "advantages": [
                        "Industry-leading 99.999999999% (11 9s) data durability",
                        "Configurable lifecycle tiers (Standard, Glacier, Deep Archive)",
                        "Comprehensive access control policies and encryption"
                    ],
                    "limitations": [
                        "Not designed for high-frequency low-latency file system operations",
                        "Data egress fees apply when transferring data outside AWS"
                    ]
                },
                {
                    "name": "Amazon EBS",
                    "type": "Block Storage",
                    "pricingModel": "Pay for provisioned storage",
                    "description": "High-performance block-level storage volumes designed for use with Amazon EC2 instances for throughput-intensive workloads.",
                    "bestFor": "Primary storage for file systems, relational and NoSQL databases, and OS boot volumes.",
                    "advantages": [
                        "Consistent low-latency performance",
                        "Live volume resizing and volume snapshots to S3",
                        "Choice of SSD (gp3/io2) and HDD storage tiers"
                    ],
                    "limitations": [
                        "Volumes are constrained to a single Availability Zone",
                        "Provisioned capacity is billed regardless of whether it is filled"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Amazon RDS",
                    "type": "Managed SQL Database",
                    "pricingModel": "Instance + storage based",
                    "description": "Managed relational database service supporting PostgreSQL, MySQL, MariaDB, and SQL Server with automated maintenance.",
                    "bestFor": "Transactional web apps, e-commerce, and enterprise business applications requiring relational SQL guarantees.",
                    "advantages": [
                        "Automated backups, OS patching, and routine maintenance",
                        "Multi-AZ high availability deployments with automatic failover",
                        "Read replicas for read-heavy scaling"
                    ],
                    "limitations": [
                        "More expensive than self-hosted database on EC2",
                        "Limited access to low-level database operating system configuration"
                    ]
                },
                {
                    "name": "Amazon DynamoDB",
                    "type": "NoSQL Database",
                    "pricingModel": "Usage based",
                    "description": "Fully managed, serverless, key-value and document NoSQL database designed for single-digit millisecond performance at scale.",
                    "bestFor": "High-scale web applications, gaming leaderboards, mobile backends, and session stores.",
                    "advantages": [
                        "Consistent single-digit millisecond response times",
                        "Serverless auto-scaling on-demand capacity mode",
                        "Built-in TTL (time-to-live) and global multi-region tables"
                    ],
                    "limitations": [
                        "Querying flexibility is limited by chosen partition and sort keys",
                        "Steep learning curve for modeling relational access patterns"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "Amazon Bedrock",
                    "type": "Generative AI",
                    "pricingModel": "Model usage based",
                    "description": "Fully managed service that makes foundation models from leading AI companies available via a single unified API.",
                    "bestFor": "Generative AI applications, intelligent search, chatbots, content generation, and RAG pipelines.",
                    "advantages": [
                        "Access to top models (Claude, Llama, Titan) without managing servers",
                        "Enterprise data privacy — customer data is not used for model training",
                        "Native integration with Knowledge Bases and Agents"
                    ],
                    "limitations": [
                        "Token usage costs can scale quickly with high prompt volume",
                        "Model availability can vary across specific AWS regions"
                    ]
                },
                {
                    "name": "Amazon SageMaker",
                    "type": "Machine Learning",
                    "pricingModel": "Usage based",
                    "description": "Comprehensive machine learning platform to build, train, optimize, and deploy machine learning models at scale.",
                    "bestFor": "End-to-end ML workflows, model training on custom datasets, and real-time inference hosting.",
                    "advantages": [
                        "Full MLOps suite (data preparation, training, deployment, monitoring)",
                        "Managed notebook environments (SageMaker Studio)",
                        "Automatic model tuning and distributed training support"
                    ],
                    "limitations": [
                        "Steep learning curve and complex service interface",
                        "High infrastructure cost for persistent GPU training instances"
                    ]
                }
            ]
        }
    },
    {
        "id": "azure",
        "name": "Microsoft Azure",
        "shortName": "Azure",
        "logo": "azure",
        "categories": [
            "beginner",
            "ai",
            "enterprise"
        ],
        "description": "A broad cloud platform with strong integration with Microsoft technologies and enterprise environments.",
        "strengths": [
            "Excellent Microsoft ecosystem integration",
            "Strong enterprise capabilities",
            "Good hybrid-cloud support",
            "Strong AI and data services",
            "Large global infrastructure"
        ],
        "weaknesses": [
            "Can be complex for beginners",
            "Pricing can vary significantly by service",
            "Best suited to some Microsoft-heavy environments"
        ],
        "pricingLevel": "Flexible",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Strong identity, access management and security services for enterprise applications.",
            "reliability": "Strong availability architecture with multiple regions and availability options.",
            "performance": "Wide range of compute, networking and storage services for different workloads.",
            "compliance": "Extensive compliance capabilities for enterprise and regulated workloads.",
            "support": "Multiple support plans and enterprise support options."
        },
        "beginnerFriendly": 7.1,
        "affordability": 7,
        "scalability": 9.6,
        "enterprise": 9.8,
        "aiMl": 9.2,
        "globalReach": 9.5,
        "services": {
            "compute": [
                {
                    "name": "Azure Virtual Machines",
                    "type": "Virtual Machines",
                    "pricingModel": "Pay-as-you-go",
                    "description": "On-demand, scalable virtual computing resources offering Linux and Windows Server instances.",
                    "bestFor": "Enterprise ERP systems, Windows Server workloads, SQL Server hosting, and hybrid cloud deployments.",
                    "advantages": [
                        "Industry-best Windows Server and Microsoft software license mobility",
                        "Broad range of enterprise instance families",
                        "Seamless hybrid integration with Active Directory"
                    ],
                    "limitations": [
                        "Management complexity for large-scale VM fleets",
                        "Storage and network egress can increase unexpected costs"
                    ]
                },
                {
                    "name": "Azure Functions",
                    "type": "Serverless",
                    "pricingModel": "Consumption based",
                    "description": "Serverless compute service that enables running event-triggered code without explicitly managing infrastructure.",
                    "bestFor": "Backend automation, event-driven integrations, queue processing, and lightweight microservices.",
                    "advantages": [
                        "Consumption plan with zero idle costs",
                        "Extensive trigger bindings (.NET, Node.js, Python, Java)",
                        "Tight integration with Azure Event Grid and Service Bus"
                    ],
                    "limitations": [
                        "Cold starts on standard consumption tier",
                        "Execution timeout limits on consumption plans"
                    ]
                },
                {
                    "name": "Azure Kubernetes Service",
                    "type": "Containers",
                    "pricingModel": "Usage based",
                    "description": "Fully managed container orchestration service that simplifies deploying and managing containerized applications.",
                    "bestFor": "Enterprise microservices architectures, cloud-native migration, and multi-service web platforms.",
                    "advantages": [
                        "Free cluster management plane (no hourly control plane fee)",
                        "Integrated Azure Active Directory role-based access control",
                        "Automated node repairs and cluster upgrades"
                    ],
                    "limitations": [
                        "Requires deep Kubernetes administrative knowledge",
                        "Underlying worker VM and load balancer costs still apply"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Azure Blob Storage",
                    "type": "Object Storage",
                    "pricingModel": "Usage based",
                    "description": "Massively scalable and secure object storage for unstructured data such as media, logs, and backups.",
                    "bestFor": "Serving images/documents directly to browsers, big data analytics, video streaming, and archival storage.",
                    "advantages": [
                        "Tiered storage (Hot, Cool, Cold, Archive) for cost optimization",
                        "Comprehensive security with Azure AD identity and encryption",
                        "High data durability and geo-redundancy options"
                    ],
                    "limitations": [
                        "Egress bandwidth costs when downloading outside Azure",
                        "Not suitable as random-access block storage for databases"
                    ]
                },
                {
                    "name": "Azure Disk Storage",
                    "type": "Block Storage",
                    "pricingModel": "Provisioned capacity",
                    "description": "High-performance, durable block storage disks designed for mission-critical applications running on Azure VMs.",
                    "bestFor": "VM boot disks, transactional relational databases, and enterprise applications requiring high IOPS.",
                    "advantages": [
                        "Consistent single-millisecond latency on Ultra and Premium SSDs",
                        "Shared disk capability for failover clustering",
                        "Instant snapshotting and disk bursting support"
                    ],
                    "limitations": [
                        "Bound to the same availability zone as the parent VM",
                        "Fixed provisioned cost regardless of storage utilization"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Azure SQL Database",
                    "type": "Managed SQL Database",
                    "pricingModel": "Compute + storage based",
                    "description": "Fully managed relational database engine with automated patching, backups, and built-in AI performance tuning.",
                    "bestFor": "Modern SaaS applications, business data stores, and applications built on the Microsoft .NET ecosystem.",
                    "advantages": [
                        "Serverless compute tier with automatic pause/resume",
                        "Built-in automated index tuning and threat detection",
                        "99.995% availability SLA with multi-region replication"
                    ],
                    "limitations": [
                        "Some legacy on-premise SQL Server features are not supported",
                        "High costs on high-end vCore configurations"
                    ]
                },
                {
                    "name": "Azure Cosmos DB",
                    "type": "NoSQL Database",
                    "pricingModel": "Request/capacity based",
                    "description": "Globally distributed, multi-model NoSQL database service offering single-digit millisecond response times worldwide.",
                    "bestFor": "Global retail catalogs, real-time telemetry/IoT, mobile applications, and high-concurrency user profiles.",
                    "advantages": [
                        "Turnkey multi-region data replication with multi-master writes",
                        "Guaranteed single-digit millisecond latency at 99th percentile",
                        "Supports SQL, MongoDB, Cassandra, and Gremlin APIs"
                    ],
                    "limitations": [
                        "Request Unit (RU) pricing model requires careful capacity tuning",
                        "Costs escalate quickly if partitioning is improperly designed"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "Azure AI Foundry",
                    "type": "AI Platform",
                    "pricingModel": "Service/model dependent",
                    "description": "Enterprise-grade studio and unified model catalog providing access to OpenAI models and open-source foundation models.",
                    "bestFor": "Enterprise generative AI assistants, enterprise document analysis, chatbots, and copilot extensions.",
                    "advantages": [
                        "Enterprise access to OpenAI models (GPT-4) with corporate privacy guarantees",
                        "Comprehensive content safety and moderation filters",
                        "Integration with Azure Cognitive Search for enterprise RAG"
                    ],
                    "limitations": [
                        "Token consumption costs can grow rapidly",
                        "Quota limits and regional capacity constraints on select models"
                    ]
                },
                {
                    "name": "Azure Machine Learning",
                    "type": "Machine Learning",
                    "pricingModel": "Usage based",
                    "description": "Cloud service for managing the end-to-end machine learning lifecycle from data preparation to deployment.",
                    "bestFor": "Data science teams training, tracking, and deploying custom models with enterprise compliance.",
                    "advantages": [
                        "Automated Machine Learning (AutoML) for rapid prototyping",
                        "Integrated model registry and MLOps deployment pipelines",
                        "Managed compute targets with auto-scaling capabilities"
                    ],
                    "limitations": [
                        "Steep learning curve for non-data science engineers",
                        "Complex workspace and resource hierarchy configuration"
                    ]
                }
            ]
        }
    },
    {
        "id": "gcp",
        "name": "Google Cloud",
        "shortName": "GCP",
        "logo": "gcp",
        "categories": [
            "beginner",
            "ai"
        ],
        "description": "A cloud platform known for strong data analytics, machine learning, Kubernetes and modern application infrastructure.",
        "strengths": [
            "Excellent data analytics",
            "Strong AI and machine learning",
            "Excellent Kubernetes ecosystem",
            "Modern developer tooling",
            "Strong global network"
        ],
        "weaknesses": [
            "Smaller service ecosystem than AWS",
            "Some services can have complex pricing",
            "Enterprise ecosystem may be less familiar to some organizations"
        ],
        "pricingLevel": "Flexible",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Strong identity, security and infrastructure protection capabilities.",
            "reliability": "Highly distributed infrastructure with strong availability and global networking.",
            "performance": "Strong networking, compute and data-processing performance.",
            "compliance": "Supports a wide range of security and compliance requirements.",
            "support": "Multiple technical support options for different workloads."
        },
        "beginnerFriendly": 8.2,
        "affordability": 8.1,
        "scalability": 9.1,
        "enterprise": 8.7,
        "aiMl": 9.8,
        "globalReach": 9.2,
        "services": {
            "compute": [
                {
                    "name": "Compute Engine",
                    "type": "Virtual Machines",
                    "pricingModel": "Pay-as-you-go",
                    "description": "Customizable virtual machine instances running on Google's secure, high-performance global network.",
                    "bestFor": "Custom application backends, big data clusters, and enterprise workloads requiring custom vCPU/RAM ratios.",
                    "advantages": [
                        "Custom machine sizing — configure exact CPU and memory ratios",
                        "Per-second billing with automatic sustained use discounts",
                        "Live migration technology keeps instances running during host updates"
                    ],
                    "limitations": [
                        "Requires system administration and operating system maintenance",
                        "Disk and network charges are billed separately"
                    ]
                },
                {
                    "name": "Cloud Run",
                    "type": "Serverless Containers",
                    "pricingModel": "Usage based",
                    "description": "Fully managed serverless compute platform that enables running containers directly on Google's scalable infrastructure.",
                    "bestFor": "Web applications, microservices, REST/GraphQL APIs, and asynchronous event processing in any language.",
                    "advantages": [
                        "Automatic scaling from and to zero instances",
                        "Deploy any language or binary packaged in a Docker container",
                        "Extremely fast container cold-start performance"
                    ],
                    "limitations": [
                        "Request timeout limit (up to 60 minutes)",
                        "Stateless model requires external storage for persistent state"
                    ]
                },
                {
                    "name": "Google Kubernetes Engine",
                    "type": "Containers",
                    "pricingModel": "Cluster/resource based",
                    "description": "Leading production-ready managed Kubernetes service engineered by the original creators of Kubernetes.",
                    "bestFor": "Enterprise container orchestration, microservices at scale, and hybrid multi-cloud infrastructure.",
                    "advantages": [
                        "GKE Autopilot mode handles entire node management and security",
                        "Industry-best Kubernetes release velocity and auto-upgrades",
                        "Advanced multi-cluster networking and service mesh integration"
                    ],
                    "limitations": [
                        "Kubernetes concepts require significant technical experience",
                        "Monthly cluster management fee applies on standard clusters"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Cloud Storage",
                    "type": "Object Storage",
                    "pricingModel": "Storage + usage based",
                    "description": "Unified, highly durable object storage service featuring global edge points of presence and strong consistency.",
                    "bestFor": "Serving website assets, storing media, analytics data lakes, and disaster recovery backups.",
                    "advantages": [
                        "High global availability and instant data consistency worldwide",
                        "Auto-class tiering moves data to cheaper tiers automatically",
                        "Single unified API across all storage classes"
                    ],
                    "limitations": [
                        "Egress network charges apply when serving data outside Google Cloud",
                        "Not optimized for traditional POSIX file system mounting"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Cloud SQL",
                    "type": "Managed SQL Database",
                    "pricingModel": "Instance + storage based",
                    "description": "Fully managed relational database service for MySQL, PostgreSQL, and SQL Server with automatic replication.",
                    "bestFor": "Web application backends, CMS systems, e-commerce, and transactional business systems.",
                    "advantages": [
                        "Automated backups, point-in-time recovery, and security patches",
                        "Easy high-availability failover across multiple zones",
                        "Integrated with Cloud Run and Google Kubernetes Engine"
                    ],
                    "limitations": [
                        "Storage volume size limits compared to distributed databases",
                        "Maintenance windows require scheduled downtime or brief switchover"
                    ]
                },
                {
                    "name": "Firestore",
                    "type": "NoSQL Database",
                    "pricingModel": "Usage based",
                    "description": "Serverless NoSQL document database built for automatic scaling, real-time data sync, and offline support.",
                    "bestFor": "Mobile and web applications, real-time collaboration tools, and fast prototyping.",
                    "advantages": [
                        "Real-time data synchronization with client SDKs",
                        "Built-in offline data persistence for mobile applications",
                        "True serverless scaling with generous free tier"
                    ],
                    "limitations": [
                        "Complex queries and deep filtering are constrained compared to SQL",
                        "Write rate limit of 1 write per second per document"
                    ]
                },
                {
                    "name": "BigQuery",
                    "type": "Data Warehouse",
                    "pricingModel": "Query/storage based",
                    "description": "Serverless, cost-effective enterprise data warehouse designed for high-speed SQL queries over petabytes of data.",
                    "bestFor": "Business intelligence, large-scale data analytics, log analysis, and machine learning on SQL data.",
                    "advantages": [
                        "Zero infrastructure setup — queries scale over thousands of workers instantly",
                        "Built-in machine learning (BigQuery ML) using standard SQL",
                        "Separation of storage and compute keeps storage costs minimal"
                    ],
                    "limitations": [
                        "Cost per query can be high for unoptimized full-table scans",
                        "Not designed for single-row low-latency transactional (OLTP) updates"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "Vertex AI",
                    "type": "AI / ML Platform",
                    "pricingModel": "Model and usage based",
                    "description": "Google's unified artificial intelligence platform providing access to Gemini models and complete MLOps tooling.",
                    "bestFor": "Generative AI applications, multimodal analysis (text/image/video), and deploying custom ML models.",
                    "advantages": [
                        "Direct access to Google's state-of-the-art Gemini multimodal models",
                        "Search and Conversation tools for turnkey enterprise RAG",
                        "End-to-end integration with Google Cloud data ecosystem"
                    ],
                    "limitations": [
                        "Model API costs scale with token and context size",
                        "Rapidly evolving API surface requires staying up-to-date with deprecations"
                    ]
                }
            ]
        }
    },
    {
        "id": "oracle",
        "name": "Oracle Cloud Infrastructure",
        "shortName": "OCI",
        "logo": "oracle",
        "categories": [
            "enterprise"
        ],
        "description": "A cloud platform with strong database, enterprise and compute capabilities, particularly useful for Oracle workloads.",
        "strengths": [
            "Strong Oracle database ecosystem",
            "Competitive compute options",
            "Enterprise-focused infrastructure",
            "Good performance for Oracle workloads",
            "Useful free-tier options for experimentation"
        ],
        "weaknesses": [
            "Smaller ecosystem than AWS",
            "Less popular for some modern developer workloads",
            "Some services have a smaller community"
        ],
        "pricingLevel": "Competitive",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Strong identity, database security and enterprise security capabilities.",
            "reliability": "Designed for highly available enterprise and database workloads.",
            "performance": "Strong compute and database performance, particularly for Oracle workloads.",
            "compliance": "Strong support for enterprise and regulated workloads.",
            "support": "Enterprise-oriented technical support and service options."
        },
        "beginnerFriendly": 6.3,
        "affordability": 8,
        "scalability": 8.4,
        "enterprise": 9.1,
        "aiMl": 7.5,
        "globalReach": 8.2,
        "services": {
            "compute": [
                {
                    "name": "OCI Compute",
                    "type": "Virtual Machines",
                    "pricingModel": "Usage based",
                    "description": "High-performance bare metal and virtual cloud compute instances with flexible core and memory allocation.",
                    "bestFor": "Enterprise business software, high-throughput compute, and legacy database migrations.",
                    "advantages": [
                        "Flexible shape configurations — pick exact OCPU and RAM amounts",
                        "Very competitive compute pricing per gigabyte of memory",
                        "True bare-metal instance offerings with zero virtualization overhead"
                    ],
                    "limitations": [
                        "Smaller ecosystem of third-party community automation templates",
                        "Web console interface is less intuitive for beginners"
                    ]
                },
                {
                    "name": "OCI Container Instances",
                    "type": "Containers",
                    "pricingModel": "Usage based",
                    "description": "Serverless container execution platform that runs containers instantly without requiring virtual machine setup.",
                    "bestFor": "Lightweight containerized tasks, CI/CD runners, and short-running batch jobs.",
                    "advantages": [
                        "No VM management or server maintenance required",
                        "Fast container startup time and per-second resource billing",
                        "Full isolation at the hypervisor level"
                    ],
                    "limitations": [
                        "Limited orchestration features compared to Kubernetes",
                        "Not intended for complex multi-tier container networking"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "OCI Object Storage",
                    "type": "Object Storage",
                    "pricingModel": "Storage + usage based",
                    "description": "High-scale, reliable storage platform for storing arbitrary unstructured files and backup archives.",
                    "bestFor": "Oracle database backup storage, long-term logs, and big data analytical inputs.",
                    "advantages": [
                        "Very cost-effective storage pricing and low egress rates",
                        "Auto-tiering moves inactive data to archival storage",
                        "Native integration with Oracle Database backup utilities"
                    ],
                    "limitations": [
                        "Smaller global network of edge locations compared to hyperscalers",
                        "Basic feature set compared to AWS S3"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Oracle Autonomous Database",
                    "type": "Managed Database",
                    "pricingModel": "Usage based",
                    "description": "Fully automated, self-driving database service utilizing machine learning to tune, secure, and patch itself.",
                    "bestFor": "Enterprise mission-critical transaction processing, data warehousing, and Oracle ERP applications.",
                    "advantages": [
                        "Automatic indexing, tuning, and security patching with zero downtime",
                        "Exceptional performance for complex SQL and enterprise data",
                        "Available in an attractive Always-Free tier for students"
                    ],
                    "limitations": [
                        "Proprietary architecture heavily tied to Oracle technology",
                        "Enterprise editions can become expensive as resource consumption grows"
                    ]
                },
                {
                    "name": "MySQL HeatWave",
                    "type": "Managed Database",
                    "pricingModel": "Usage based",
                    "description": "Integrated in-memory query accelerator built into managed MySQL for real-time transactions and analytics.",
                    "bestFor": "Running fast analytics and reporting directly on transactional MySQL without ETL pipelines.",
                    "advantages": [
                        "Eliminates complex ETL data transfer to separate data warehouses",
                        "Orders of magnitude faster query execution than standard MySQL",
                        "Built-in machine learning capabilities inside MySQL"
                    ],
                    "limitations": [
                        "Accelerated in-memory clusters require dedicated cluster sizing",
                        "Primarily beneficial for analytical queries rather than simple lookups"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "OCI Generative AI",
                    "type": "Generative AI",
                    "pricingModel": "Usage based",
                    "description": "Fully managed service integrating enterprise foundation models into business applications via clean APIs.",
                    "bestFor": "Corporate knowledge base chat, document summarization, and internal enterprise automation.",
                    "advantages": [
                        "Dedicated AI clusters ensure predictable inference latency",
                        "Strict enterprise data privacy guarantees",
                        "Fine-tuning capabilities on proprietary business data"
                    ],
                    "limitations": [
                        "Smaller catalog of third-party models compared to AWS or Azure",
                        "Dedicated AI clusters require higher minimum cost commitments"
                    ]
                }
            ]
        }
    },
    {
        "id": "ibm",
        "name": "IBM Cloud",
        "shortName": "IBM",
        "logo": "ibm",
        "categories": [
            "ai",
            "enterprise"
        ],
        "description": "An enterprise-oriented cloud platform with strong hybrid cloud, AI and regulated-industry capabilities.",
        "strengths": [
            "Strong enterprise capabilities",
            "Hybrid cloud support",
            "AI and data services",
            "Strong regulated-industry focus",
            "Good security capabilities"
        ],
        "weaknesses": [
            "Smaller ecosystem than AWS and Azure",
            "Less common among individual developers",
            "Fewer services in some categories"
        ],
        "pricingLevel": "Flexible",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Strong security, identity and enterprise protection capabilities.",
            "reliability": "Enterprise infrastructure designed for reliable and hybrid workloads.",
            "performance": "Compute and infrastructure options for enterprise applications.",
            "compliance": "Strong focus on regulated industries and enterprise compliance.",
            "support": "Enterprise support and technical assistance options."
        },
        "beginnerFriendly": 7,
        "affordability": 6.8,
        "scalability": 8.1,
        "enterprise": 9.2,
        "aiMl": 8.4,
        "globalReach": 8.3,
        "services": {
            "compute": [
                {
                    "name": "IBM Virtual Servers",
                    "type": "Virtual Machines",
                    "pricingModel": "Usage based",
                    "description": "Customizable virtual server instances available on public multi-tenant or dedicated infrastructure.",
                    "bestFor": "Enterprise corporate workloads, regulated financial services, and hybrid cloud architectures.",
                    "advantages": [
                        "High network bandwidth allocation per instance",
                        "Dedicated hosts and isolation for compliance requirements",
                        "Smooth migration path for enterprise IBM customers"
                    ],
                    "limitations": [
                        "Higher base pricing compared to commodity VPS providers",
                        "Smaller global developer community and documentation"
                    ]
                },
                {
                    "name": "IBM Code Engine",
                    "type": "Serverless Containers",
                    "pricingModel": "Usage based",
                    "description": "Fully managed serverless platform that runs containerized workloads, web applications, and batch tasks.",
                    "bestFor": "Developers wanting to deploy containers or source code without managing Kubernetes clusters.",
                    "advantages": [
                        "Auto-scales from zero to thousands of instances",
                        "Supports container images, source code, and scheduled batch jobs",
                        "Generous free monthly tier for developers"
                    ],
                    "limitations": [
                        "Less mature ecosystem of plugins compared to Google Cloud Run",
                        "Fewer third-party CI/CD integrations out-of-the-box"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "IBM Cloud Object Storage",
                    "type": "Object Storage",
                    "pricingModel": "Usage based",
                    "description": "Resilient, highly available cloud storage across geo-dispersed data center locations.",
                    "bestFor": "Long-term data archiving, regulatory compliance data retention, and backup repositories.",
                    "advantages": [
                        "Information Dispersal Algorithm ensures high data resilience",
                        "Built-in data retention compliance policies (WORM storage)",
                        "Flexible storage tiers based on access frequency"
                    ],
                    "limitations": [
                        "API is S3-compatible but has minor behavioral differences",
                        "Data retrieval fees apply on colder storage tiers"
                    ]
                }
            ],
            "database": [
                {
                    "name": "IBM Cloud Databases",
                    "type": "Managed Database",
                    "pricingModel": "Usage based",
                    "description": "Managed open-source database suite providing PostgreSQL, MongoDB, Redis, and Elasticsearch clusters.",
                    "bestFor": "Modern cloud-native apps needing reliable managed open-source data stores with enterprise support.",
                    "advantages": [
                        "Independent scaling of disk, RAM, and vCPU",
                        "Automated daily backups and point-in-time recovery",
                        "High availability configurations across multiple availability zones"
                    ],
                    "limitations": [
                        "Hourly cost is higher than self-hosted open-source options",
                        "Database version upgrade cycles can lag upstream releases"
                    ]
                },
                {
                    "name": "Db2",
                    "type": "Enterprise Database",
                    "pricingModel": "Usage based",
                    "description": "Enterprise-grade relational database optimized for heavy transactional and analytical workloads.",
                    "bestFor": "Banking, financial systems, insurance claims processing, and core enterprise transactional applications.",
                    "advantages": [
                        "Advanced in-memory processing technology (BLU Acceleration)",
                        "Rock-solid data integrity guarantees for financial transactions",
                        "Proven stability under high-concurrency corporate workloads"
                    ],
                    "limitations": [
                        "High licensing cost suitable only for enterprise budgets",
                        "Requires specialized database administration expertise"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "watsonx.ai",
                    "type": "AI Platform",
                    "pricingModel": "Usage based",
                    "description": "Enterprise studio for foundation models, generative AI, and machine learning with rigorous governance.",
                    "bestFor": "Regulated industry AI deployments, domain-specific model fine-tuning, and trusted enterprise AI workflows.",
                    "advantages": [
                        "Transparent AI governance and auditability (watsonx.governance)",
                        "Domain-specific enterprise models optimized for business tasks",
                        "Strong enterprise compliance and IP indemnity protections"
                    ],
                    "limitations": [
                        "Smaller general developer adoption than consumer LLM platforms",
                        "Enterprise-focused licensing and pricing models"
                    ]
                }
            ]
        }
    },
    {
        "id": "digitalocean",
        "name": "DigitalOcean",
        "shortName": "DigitalOcean",
        "logo": "digitalocean",
        "categories": [
            "beginner"
        ],
        "description": "A developer-friendly cloud platform focused on simplicity, predictable infrastructure and smaller applications.",
        "strengths": [
            "Very developer friendly",
            "Simple interface",
            "Easy deployment",
            "Good for startups and student projects",
            "Predictable infrastructure options"
        ],
        "weaknesses": [
            "Smaller service ecosystem",
            "Less suitable for very large enterprises",
            "Fewer advanced AI services"
        ],
        "pricingLevel": "Simple",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides standard cloud security, networking and access-control capabilities.",
            "reliability": "Reliable infrastructure suitable for applications and smaller production workloads.",
            "performance": "Straightforward compute and storage options designed for developer workloads.",
            "compliance": "Provides security and compliance capabilities appropriate for supported workloads.",
            "support": "Developer-oriented support resources and paid support options."
        },
        "beginnerFriendly": 9.6,
        "affordability": 9.3,
        "scalability": 7.2,
        "enterprise": 5.8,
        "aiMl": 6.1,
        "globalReach": 6.7,
        "services": {
            "compute": [
                {
                    "name": "Droplets",
                    "type": "Virtual Machines",
                    "pricingModel": "Monthly/hourly",
                    "description": "Simple, fast-booting SSD-based virtual private servers available in shared and dedicated CPU tiers.",
                    "bestFor": "Small-to-medium web servers, developer side-projects, blogs, and staging environments.",
                    "advantages": [
                        "Clean, developer-friendly interface with straightforward pricing",
                        "Rapid provisioning time (under 55 seconds)",
                        "Predictable monthly pricing with generous included bandwidth"
                    ],
                    "limitations": [
                        "Manual configuration required for OS patching and software updates",
                        "Limited built-in enterprise compliance certifications"
                    ]
                },
                {
                    "name": "App Platform",
                    "type": "Platform as a Service",
                    "pricingModel": "Resource based",
                    "description": "Fully managed Platform as a Service (PaaS) to build, deploy, and scale web applications from Git repositories.",
                    "bestFor": "Full-stack web applications (Node, Python, Go), static websites, and API backends.",
                    "advantages": [
                        "Zero server management — deploy directly from GitHub or GitLab",
                        "Automatic HTTPS SSL certificates and global CDN included",
                        "Seamless auto-scaling and zero-downtime deployments"
                    ],
                    "limitations": [
                        "Less granular control over low-level operating system parameters",
                        "More expensive per resource than raw Droplets as scale grows"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Spaces",
                    "type": "Object Storage",
                    "pricingModel": "Monthly storage + transfer",
                    "description": "Simple S3-compatible object storage with built-in global CDN to store and serve user assets.",
                    "bestFor": "User file uploads, static website assets, media streaming, and affordable backups.",
                    "advantages": [
                        "Flat predictable pricing ($5/mo for 250GB storage + 1TB transfer)",
                        "Built-in CDN at no extra charge",
                        "Standard S3 API compatibility works with existing tooling"
                    ],
                    "limitations": [
                        "Lacks advanced storage lifecycle tiers (like Glacier or Deep Archive)",
                        "Fewer global datacenter regions than hyperscalers"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Managed Databases",
                    "type": "Managed Database",
                    "pricingModel": "Monthly resource based",
                    "description": "Automated, managed open-source databases including PostgreSQL, MySQL, and Kafka.",
                    "bestFor": "Developers who need European data residency with automated database management.",
                    "advantages": [
                        "Built on standard open-source engines with zero proprietary modifications",
                        "Automated backups, scaling, and high-availability options",
                        "No data egress fees within the same OVHcloud project"
                    ],
                    "limitations": [
                        "Fewer database engine variants than major hyperscalers",
                        "Maintenance windows require scheduled switchovers"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "GPU Droplets",
                    "type": "AI / ML Compute",
                    "pricingModel": "Usage based",
                    "description": "On-demand GPU instances powered by NVIDIA H100 and A100 hardware for AI workloads.",
                    "bestFor": "Small-to-medium AI model inference, machine learning experimentation, and rendering.",
                    "advantages": [
                        "Accessible cloud GPU compute with transparent hourly billing",
                        "Pre-configured AI software stacks (PyTorch, TensorFlow)",
                        "No enterprise contract commitment required"
                    ],
                    "limitations": [
                        "Limited availability during high global GPU demand periods",
                        "Smaller cluster networking scale compared to dedicated AI clouds"
                    ]
                }
            ]
        }
    },
    {
        "id": "alibaba",
        "name": "Alibaba Cloud",
        "shortName": "Alibaba Cloud",
        "logo": "alibaba",
        "categories": [
            "ai",
            "enterprise"
        ],
        "description": "A major cloud platform with strong infrastructure, database, analytics and AI capabilities, particularly prominent in Asia.",
        "strengths": [
            "Strong presence in Asia",
            "Large range of cloud services",
            "Strong database and analytics capabilities",
            "AI and machine learning services",
            "Good scalability"
        ],
        "weaknesses": [
            "Less familiar to many beginners outside Asia",
            "Large service ecosystem can be complex",
            "Some services are region dependent"
        ],
        "pricingLevel": "Flexible",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides identity, network and cloud security services for applications.",
            "reliability": "Large distributed infrastructure with strong regional availability.",
            "performance": "Broad compute, networking and storage options for scalable workloads.",
            "compliance": "Provides compliance capabilities across supported regions and industries.",
            "support": "Technical support options for cloud workloads and enterprise customers."
        },
        "beginnerFriendly": 6.5,
        "affordability": 7.8,
        "scalability": 9.2,
        "enterprise": 8.8,
        "aiMl": 8.7,
        "globalReach": 8.4,
        "services": {
            "compute": [
                {
                    "name": "Elastic Compute Service",
                    "type": "Virtual Machines",
                    "pricingModel": "Pay-as-you-go",
                    "description": "High-performance, elastic computing virtual machines backed by an extensive Asia-Pacific infrastructure.",
                    "bestFor": "E-commerce backends, high-concurrency web services, and workloads targeting Asian markets.",
                    "advantages": [
                        "Unmatched infrastructure footprint in China and Southeast Asia",
                        "Wide range of instance types including high-frequency compute",
                        "Competitive pricing in regional Asian datacenters"
                    ],
                    "limitations": [
                        "English documentation and support can be uneven",
                        "Regulatory compliance requirements for hosting in mainland China"
                    ]
                },
                {
                    "name": "Function Compute",
                    "type": "Serverless",
                    "pricingModel": "Usage based",
                    "description": "Serverless event-driven computing service executing code without needing server provisioning.",
                    "bestFor": "Asynchronous processing, webhooks, multimedia processing, and API backends.",
                    "advantages": [
                        "Per-millisecond billing with zero idle cost",
                        "Native integration with Alibaba Cloud Object Storage",
                        "Fast automatic elasticity during flash traffic spikes"
                    ],
                    "limitations": [
                        "Third-party tooling ecosystem is smaller outside of Asia",
                        "Cold start latency on unreserved instances"
                    ]
                },
                {
                    "name": "Container Service for Kubernetes",
                    "type": "Containers",
                    "pricingModel": "Usage based",
                    "description": "Enterprise-grade managed Kubernetes with deep Alibaba Cloud infrastructure optimization.",
                    "bestFor": "Large-scale microservices, hybrid deployments, and containerized enterprise workloads.",
                    "advantages": [
                        "Optimized networking performance with Terway CNI",
                        "Seamless integration with Alibaba Cloud security and monitoring",
                        "High availability multi-zone cluster deployments"
                    ],
                    "limitations": [
                        "Requires experienced Kubernetes operations staff",
                        "Control plane features vary across international regions"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Object Storage Service",
                    "type": "Object Storage",
                    "pricingModel": "Storage + requests",
                    "description": "Massive, highly reliable cloud storage with built-in data processing and image manipulation features.",
                    "bestFor": "Multimedia storage, big data processing, website assets, and data archives.",
                    "advantages": [
                        "Built-in image and media processing directly on storage",
                        "High data durability and flexible lifecycle rules",
                        "Excellent low-latency access throughout Asia"
                    ],
                    "limitations": [
                        "Data egress bandwidth charges apply",
                        "Interface and API naming conventions differ slightly from AWS S3"
                    ]
                }
            ],
            "database": [
                {
                    "name": "ApsaraDB RDS",
                    "type": "Managed SQL Database",
                    "pricingModel": "Instance + storage based",
                    "description": "Fully managed relational database service supporting MySQL, PostgreSQL, and SQL Server with automated operations.",
                    "bestFor": "Enterprise transactional workloads, e-commerce stores, and financial services.",
                    "advantages": [
                        "High-availability dual-node architecture with automatic failover",
                        "Optimized enterprise kernels (AliSQL) offering higher performance",
                        "Automated backups, read replicas, and performance diagnostic tools"
                    ],
                    "limitations": [
                        "Advanced enterprise features require higher tier plans",
                        "Management console is complex for new developers"
                    ]
                },
                {
                    "name": "PolarDB",
                    "type": "Cloud Database",
                    "pricingModel": "Capacity based",
                    "description": "Cloud-native relational database engine with decoupled compute and storage architecture.",
                    "bestFor": "High-concurrency transaction processing and auto-scaling database requirements.",
                    "advantages": [
                        "Up to 6x performance boost over standard MySQL",
                        "Rapid elastic scaling of read replicas in minutes",
                        "Storage auto-expands up to 100TB with zero downtime"
                    ],
                    "limitations": [
                        "Proprietary cloud-native engine tied to Alibaba Cloud",
                        "Higher base cost than entry-level managed RDS"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "PAI",
                    "type": "AI / ML Platform",
                    "pricingModel": "Usage based",
                    "description": "Comprehensive AI and machine learning platform covering dataset labeling, training, and model serving.",
                    "bestFor": "Deep learning training, computer vision models, and large-scale industrial AI.",
                    "advantages": [
                        "Pre-configured distributed training algorithms",
                        "Rich collection of pre-trained models for vision and speech",
                        "Cost-effective GPU training clusters in Asian regions"
                    ],
                    "limitations": [
                        "Documentation and tutorials predominantly focused on Chinese market",
                        "Steeper learning curve for Western developer teams"
                    ]
                }
            ]
        }
    },
    {
        "id": "huawei",
        "name": "Huawei Cloud",
        "shortName": "Huawei Cloud",
        "logo": "huawei",
        "categories": [
            "ai",
            "enterprise"
        ],
        "description": "A global cloud platform offering compute, storage, databases, AI and enterprise cloud services.",
        "strengths": [
            "Strong infrastructure capabilities",
            "Strong presence in Asia",
            "AI and machine learning services",
            "Wide range of cloud products",
            "Good enterprise infrastructure"
        ],
        "weaknesses": [
            "Regional availability can vary",
            "Less familiar to some Western developers",
            "Large catalog can be complex"
        ],
        "pricingLevel": "Flexible",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides cloud security, identity and infrastructure protection services.",
            "reliability": "Distributed infrastructure designed for reliable enterprise workloads.",
            "performance": "Wide range of compute, storage and networking capabilities.",
            "compliance": "Provides security and compliance capabilities for supported regions.",
            "support": "Technical and enterprise support options."
        },
        "beginnerFriendly": 6.4,
        "affordability": 7.7,
        "scalability": 9,
        "enterprise": 8.6,
        "aiMl": 8.5,
        "globalReach": 8,
        "services": {
            "compute": [
                {
                    "name": "Elastic Cloud Server",
                    "type": "Virtual Machines",
                    "pricingModel": "Pay-as-you-go",
                    "description": "Reliable and scalable virtual computing service with diverse CPU architectures (x86 and Kunpeng ARM).",
                    "bestFor": "Enterprise business workloads, web portals, and scientific computing in Asia and emerging markets.",
                    "advantages": [
                        "High compute density and dual-architecture (ARM/x86) options",
                        "Strong enterprise-grade security and isolation",
                        "Competitive pricing in Latin America, Middle East, and Asia"
                    ],
                    "limitations": [
                        "Limited presence in North American datacenter regions",
                        "Smaller global developer community outside primary regions"
                    ]
                },
                {
                    "name": "FunctionGraph",
                    "type": "Serverless",
                    "pricingModel": "Usage based",
                    "description": "Event-driven serverless computing service running code in response to events without server management.",
                    "bestFor": "Microservice backends, real-time file processing, and mobile backend services.",
                    "advantages": [
                        "Millisecond-level billing and rapid autoscaling",
                        "Broad runtime support (Node.js, Python, Java, Go)",
                        "Native event triggers from Huawei Cloud storage and databases"
                    ],
                    "limitations": [
                        "Limited third-party integration with non-Huawei services",
                        "Cold start delays on low-traffic functions"
                    ]
                },
                {
                    "name": "Cloud Container Engine",
                    "type": "Containers",
                    "pricingModel": "Resource based",
                    "description": "High-performance Kubernetes service designed for cloud-native containerized applications.",
                    "bestFor": "Enterprise containerized applications and high-throughput microservices.",
                    "advantages": [
                        "High-speed container networking powered by Huawei hardware",
                        "Enterprise reliability and multi-cluster management",
                        "Certified Kubernetes conformance guarantees compatibility"
                    ],
                    "limitations": [
                        "Complex setup for beginner developers",
                        "Regional feature availability differences"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Object Storage Service",
                    "type": "Object Storage",
                    "pricingModel": "Storage + requests",
                    "description": "Massive, highly reliable cloud storage with built-in data processing and image manipulation features.",
                    "bestFor": "Multimedia storage, big data processing, website assets, and data archives.",
                    "advantages": [
                        "Built-in image and media processing directly on storage",
                        "High data durability and flexible lifecycle rules",
                        "Excellent low-latency access throughout Asia"
                    ],
                    "limitations": [
                        "Data egress bandwidth charges apply",
                        "Interface and API naming conventions differ slightly from AWS S3"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Relational Database Service",
                    "type": "Managed SQL Database",
                    "pricingModel": "Instance based",
                    "description": "Managed relational database service with automated failover, backups, and security patching.",
                    "bestFor": "Standard business applications, web portals, and transactional databases.",
                    "advantages": [
                        "High-availability active/standby setups with automated failover",
                        "Automated daily backups and point-in-time recovery",
                        "Supports standard MySQL, PostgreSQL, and SQL Server"
                    ],
                    "limitations": [
                        "Limited low-level tuning for custom database engines",
                        "Database migration tools require familiarization"
                    ]
                },
                {
                    "name": "GaussDB",
                    "type": "Distributed Database",
                    "pricingModel": "Capacity based",
                    "description": "Enterprise-grade distributed relational database for mission-critical core transactional systems.",
                    "bestFor": "Financial institutions, government records, and massive distributed transactions.",
                    "advantages": [
                        "Massive horizontal scaling for petabyte-scale transactions",
                        "Financial-grade high availability with zero data loss (RPO=0)",
                        "Full ACID compliance across distributed nodes"
                    ],
                    "limitations": [
                        "Designed for enterprise budgets and complex architectures",
                        "Overkill for typical web applications and side projects"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "ModelArts",
                    "type": "AI / ML Platform",
                    "pricingModel": "Usage based",
                    "description": "One-stop AI development platform supporting dataset labeling, model training, and deployment.",
                    "bestFor": "End-to-end AI project lifecycles, computer vision, and industrial automation models.",
                    "advantages": [
                        "Automated data labeling and preprocessing workflows",
                        "High-performance AI accelerators (Ascend chips) support",
                        "Built-in model evaluation and deployment pipelines"
                    ],
                    "limitations": [
                        "Tooling heavily centered on Huawei Ascend AI framework",
                        "Steeper onboarding curve for developers used to open-source ML stacks"
                    ]
                }
            ]
        }
    },
    {
        "id": "tencent",
        "name": "Tencent Cloud",
        "shortName": "Tencent Cloud",
        "logo": "tencent",
        "categories": [
            "ai",
            "enterprise"
        ],
        "description": "A cloud platform with strong infrastructure, networking, databases, media and AI capabilities.",
        "strengths": [
            "Strong infrastructure in Asia",
            "Good networking capabilities",
            "Strong database services",
            "AI and media services",
            "Good support for large-scale applications"
        ],
        "weaknesses": [
            "Less familiar to many developers outside Asia",
            "Regional service availability varies",
            "Smaller global ecosystem than the largest hyperscalers"
        ],
        "pricingLevel": "Flexible",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides identity, network and infrastructure security capabilities.",
            "reliability": "Distributed infrastructure designed for scalable applications.",
            "performance": "Strong networking, compute and media-oriented infrastructure.",
            "compliance": "Provides security and compliance capabilities across supported regions.",
            "support": "Technical support options for developers and enterprises."
        },
        "beginnerFriendly": 6.3,
        "affordability": 7.8,
        "scalability": 8.9,
        "enterprise": 8.3,
        "aiMl": 8.4,
        "globalReach": 7.9,
        "services": {
            "compute": [
                {
                    "name": "Cloud Virtual Machine",
                    "type": "Virtual Machines",
                    "pricingModel": "Pay-as-you-go",
                    "description": "Scalable compute instances backed by high-speed networking and Tencent global infrastructure.",
                    "bestFor": "Online gaming backends, social media apps, and multimedia services.",
                    "advantages": [
                        "Low-latency network peering across Asia",
                        "High I/O performance suitable for real-time game servers",
                        "Extensive instance options with flexible billing"
                    ],
                    "limitations": [
                        "Management portal navigation can feel busy",
                        "Documentation quality varies for English-speaking developers"
                    ]
                },
                {
                    "name": "CloudBase",
                    "type": "Serverless Application Platform",
                    "pricingModel": "Usage based",
                    "description": "Serverless integrated cloud development platform designed for full-stack web and mobile apps.",
                    "bestFor": "Rapid full-stack web and mobile application deployment without server setup.",
                    "advantages": [
                        "Integrated authentication, database, and cloud functions in one package",
                        "Fast setup for web and mobile frontends",
                        "Generous free quotas for early-stage development"
                    ],
                    "limitations": [
                        "Proprietary SDK model creates platform dependency",
                        "Best suited to Asian and WeChat-connected ecosystems"
                    ]
                },
                {
                    "name": "Tencent Kubernetes Engine",
                    "type": "Containers",
                    "pricingModel": "Resource based",
                    "description": "Highly scalable container management service running on Tencent's global cloud backbone.",
                    "bestFor": "Microservices orchestration, continuous delivery pipelines, and game server clusters.",
                    "advantages": [
                        "Optimized for high-concurrency game server deployment",
                        "Integrated with Tencent Cloud monitoring and security services",
                        "Flexible billing options for cluster nodes"
                    ],
                    "limitations": [
                        "Advanced networking features require familiarization",
                        "Enterprise tier pricing for dedicated clusters"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Cloud Object Storage",
                    "type": "Object Storage",
                    "pricingModel": "Storage + requests",
                    "description": "Distributed storage service offering high durability and low-latency file access.",
                    "bestFor": "Mobile application uploads, game client assets, and media archives.",
                    "advantages": [
                        "Integrated data acceleration and multimedia processing",
                        "High reliability and multi-tier storage lifecycle rules",
                        "Cost-effective storage rates in regional datacenters"
                    ],
                    "limitations": [
                        "Data egress fees apply when serving traffic outside Tencent Cloud",
                        "API nuances compared to standard AWS S3"
                    ]
                }
            ],
            "database": [
                {
                    "name": "TencentDB for MySQL",
                    "type": "Managed SQL Database",
                    "pricingModel": "Instance based",
                    "description": "High-availability managed MySQL database with automated backup and real-time monitoring.",
                    "bestFor": "Gaming databases, e-commerce transactions, and general web applications.",
                    "advantages": [
                        "Automatic active-standby replication with sub-second failover",
                        "Integrated performance diagnostic and slow-query analysis tools",
                        "One-click read replica scaling"
                    ],
                    "limitations": [
                        "Version upgrades require scheduled maintenance windows",
                        "Higher monthly cost than self-managed MySQL on a VM"
                    ]
                },
                {
                    "name": "TDSQL",
                    "type": "Distributed Database",
                    "pricingModel": "Capacity based",
                    "description": "Financial-grade distributed database with high availability and cross-region consensus.",
                    "bestFor": "Core banking systems, fintech transaction ledgers, and large-scale online games.",
                    "advantages": [
                        "Distributed consensus protocol ensures zero data loss",
                        "Transparent horizontal scaling of compute and storage",
                        "Strict ACID transactional integrity across shards"
                    ],
                    "limitations": [
                        "High infrastructure cost intended for enterprise deployment",
                        "Complex schema design required to optimize distributed shards"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "Tencent Cloud AI",
                    "type": "AI Platform",
                    "pricingModel": "Usage based",
                    "description": "Comprehensive suite of AI vision, voice, natural language processing, and multimodal services.",
                    "bestFor": "Speech recognition, face detection, media content moderation, and game AI.",
                    "advantages": [
                        "Proven scale powering Tencent's global social and gaming products",
                        "Strong computer vision and voice synthesis models",
                        "Turnkey REST APIs require zero ML infrastructure knowledge"
                    ],
                    "limitations": [
                        "Model customization options are more limited than open-source ML platforms",
                        "Pricing scales with API call volume"
                    ]
                }
            ]
        }
    },
    {
        "id": "vultr",
        "name": "Vultr",
        "shortName": "Vultr",
        "logo": "vultr",
        "categories": [
            "beginner"
        ],
        "description": "A developer-focused cloud platform offering straightforward compute, storage and GPU infrastructure across many locations.",
        "strengths": [
            "Simple developer experience",
            "Straightforward compute offerings",
            "Wide geographic deployment options",
            "Competitive pricing",
            "GPU cloud options"
        ],
        "weaknesses": [
            "Smaller managed-service ecosystem",
            "Less enterprise-focused than major hyperscalers",
            "Fewer advanced platform services"
        ],
        "pricingLevel": "Simple",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides standard cloud networking, access control and infrastructure security.",
            "reliability": "Distributed cloud infrastructure suitable for applications across multiple locations.",
            "performance": "Straightforward compute and GPU options with a focus on developer workloads.",
            "compliance": "Provides security and compliance features appropriate to supported services.",
            "support": "Developer-focused documentation and support resources."
        },
        "beginnerFriendly": 8.7,
        "affordability": 9,
        "scalability": 7.8,
        "enterprise": 6.4,
        "aiMl": 7.5,
        "globalReach": 8.6,
        "services": {
            "compute": [
                {
                    "name": "Vultr Cloud Compute",
                    "type": "Virtual Machines",
                    "pricingModel": "Hourly/monthly",
                    "description": "Fast SSD-backed virtual instances deployed across 30+ global locations in seconds.",
                    "bestFor": "Web hosting, development servers, VPNs, and geographically targeted applications.",
                    "advantages": [
                        "Extensive global coverage with 30+ datacenters across 6 continents",
                        "Simple, transparent hourly and monthly billing",
                        "High-performance AMD and Intel CPUs with NVMe storage"
                    ],
                    "limitations": [
                        "Basic networking features compared to AWS VPC",
                        "Fewer managed platform services outside core compute/storage"
                    ]
                },
                {
                    "name": "Vultr Kubernetes Engine",
                    "type": "Containers",
                    "pricingModel": "Resource based",
                    "description": "Fully managed Kubernetes engine with zero cluster management fees.",
                    "bestFor": "Running containerized workloads with predictable, transparent infrastructure pricing.",
                    "advantages": [
                        "Free control plane — pay only for underlying worker nodes",
                        "Certified CNCF Kubernetes compliance ensures 100% portability",
                        "Rapid cluster deployment in under 10 minutes"
                    ],
                    "limitations": [
                        "Fewer enterprise add-ons compared to GKE or AKS",
                        "Worker node scaling is simpler but less granular than hyperscalers"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Vultr Block Storage",
                    "type": "Block Storage",
                    "pricingModel": "Provisioned capacity",
                    "description": "Scalable, high-performance NVMe storage volumes that attach to compute instances.",
                    "bestFor": "Database storage, persistent stateful containers, and file server expansion.",
                    "advantages": [
                        "Fast NVMe storage delivers high IOPS for databases",
                        "Volumes can be attached and detached dynamically",
                        "Straightforward per-GB monthly pricing"
                    ],
                    "limitations": [
                        "Volumes cannot be shared concurrently across multiple instances",
                        "Regional snapshot replication must be managed manually"
                    ]
                },
                {
                    "name": "Vultr Object Storage",
                    "type": "Object Storage",
                    "pricingModel": "Storage + transfer",
                    "description": "Highly scalable S3-compatible storage built on NVMe caching technology.",
                    "bestFor": "Media assets, backups, static websites, and object storage migrations.",
                    "advantages": [
                        "Low cost ($5/month for 250GB storage and 1TB bandwidth)",
                        "Compatible with all standard AWS S3 libraries and tools",
                        "No complex request pricing tiers to calculate"
                    ],
                    "limitations": [
                        "Available in fewer datacenter regions than Vultr compute",
                        "No automated cold/archive tiering options"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Vultr Managed Databases",
                    "type": "Managed Database",
                    "pricingModel": "Resource based",
                    "description": "Production-ready managed PostgreSQL, MySQL, Redis, and Kafka clusters.",
                    "bestFor": "Developers seeking hassle-free database clustering with transparent monthly billing.",
                    "advantages": [
                        "Automated backups, daily maintenance, and security patching",
                        "Easy point-in-time recovery and one-click standby replicas",
                        "Predictable monthly cost without surprise transaction fees"
                    ],
                    "limitations": [
                        "Fewer database configuration knobs exposed to the user",
                        "No serverless auto-pause mode for idle databases"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "Vultr GPU",
                    "type": "GPU / AI Compute",
                    "pricingModel": "Usage based",
                    "description": "On-demand NVIDIA GPU compute (A100, H100, L40S) for AI inference and model training.",
                    "bestFor": "AI startups, LLM fine-tuning, machine learning workloads, and video transcoding.",
                    "advantages": [
                        "Fractional and full NVIDIA GPU instances with hourly billing",
                        "High-performance NVMe storage co-located with GPUs",
                        "No long-term contracts required for GPU access"
                    ],
                    "limitations": [
                        "High-end GPUs can experience high demand and limited stock",
                        "Multi-node distributed InfiniBand clusters are more limited than specialized AI clouds"
                    ]
                }
            ]
        }
    },
    {
        "id": "hetzner",
        "name": "Hetzner Cloud",
        "shortName": "Hetzner",
        "logo": "hetzner",
        "categories": [
            "beginner"
        ],
        "description": "A cost-focused cloud platform known for straightforward compute, storage and networking services.",
        "strengths": [
            "Competitive pricing",
            "Simple cloud infrastructure",
            "Good performance for the price",
            "Developer friendly",
            "Strong European presence"
        ],
        "weaknesses": [
            "Smaller global footprint than hyperscalers",
            "Smaller managed-service ecosystem",
            "Less suitable for some large enterprise requirements"
        ],
        "pricingLevel": "Simple",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides standard infrastructure security, networking and access controls.",
            "reliability": "Reliable infrastructure suited to applications, servers and developer workloads.",
            "performance": "Strong compute performance relative to cost.",
            "compliance": "Provides security and data-protection capabilities for supported workloads.",
            "support": "Documentation and customer support focused on infrastructure users."
        },
        "beginnerFriendly": 8.5,
        "affordability": 9.6,
        "scalability": 7.7,
        "enterprise": 6.2,
        "aiMl": 6.7,
        "globalReach": 6.9,
        "services": {
            "compute": [
                {
                    "name": "Hetzner Cloud Servers",
                    "type": "Virtual Machines",
                    "pricingModel": "Hourly/monthly",
                    "description": "Inexpensive, high-performance virtual cloud servers with dedicated and shared vCPU options.",
                    "bestFor": "Budget-conscious developers, European hosting, web applications, and hobbyist servers.",
                    "advantages": [
                        "Market-leading price-to-performance ratio in the cloud industry",
                        "Fast modern AMD and Intel processors with NVMe SSDs",
                        "Generous 20TB included traffic per month on most plans"
                    ],
                    "limitations": [
                        "Datacenter locations primarily in Germany, Finland, and USA",
                        "Fewer managed platform services (PaaS/SaaS) available"
                    ]
                },
                {
                    "name": "Hetzner Cloud Kubernetes",
                    "type": "Containers",
                    "pricingModel": "Resource based",
                    "description": "Lightweight, cost-effective container clusters running on Hetzner infrastructure.",
                    "bestFor": "Running self-managed or lightweight container workloads at minimal cost.",
                    "advantages": [
                        "Very low infrastructure cost to run Kubernetes clusters",
                        "Officially supported Hetzner CSI driver and Cloud Controller",
                        "High network throughput across European nodes"
                    ],
                    "limitations": [
                        "Requires more manual administration than GKE or AKS",
                        "No turnkey serverless container offering"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Hetzner Volumes",
                    "type": "Block Storage",
                    "pricingModel": "Provisioned capacity",
                    "description": "Flexible and resilient SSD block storage attachable to Hetzner cloud servers.",
                    "bestFor": "Expanding server disk space, hosting media files, and storing application data.",
                    "advantages": [
                        "Extremely affordable block storage pricing (€0.04/GB/month)",
                        "Expand volumes on the fly without rebooting",
                        "High data reliability with automatic replication"
                    ],
                    "limitations": [
                        "Maximum volume size of 10TB per volume",
                        "Available only in the same datacenter location as the server"
                    ]
                },
                {
                    "name": "Hetzner Object Storage",
                    "type": "Object Storage",
                    "pricingModel": "Storage + transfer",
                    "description": "Simple, S3-compatible cloud object storage located in European datacenters.",
                    "bestFor": "Offsite backups, user uploads, and GDPR-compliant static file hosting.",
                    "advantages": [
                        "European data residency with strict GDPR compliance",
                        "Affordable flat storage pricing with generous bandwidth",
                        "Standard S3 compatibility works with rclone, restic, and AWS SDKs"
                    ],
                    "limitations": [
                        "Newer service with fewer global locations",
                        "No automated cold or deep archive tiers"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Managed Databases",
                    "type": "Managed Database",
                    "pricingModel": "Resource based",
                    "description": "Automated, managed open-source databases including PostgreSQL, MySQL, and Kafka.",
                    "bestFor": "Developers who need European data residency with automated database management.",
                    "advantages": [
                        "Built on standard open-source engines with zero proprietary modifications",
                        "Automated backups, scaling, and high-availability options",
                        "No data egress fees within the same OVHcloud project"
                    ],
                    "limitations": [
                        "Fewer database engine variants than major hyperscalers",
                        "Maintenance windows require scheduled switchovers"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "GPU Servers",
                    "type": "GPU / AI Compute",
                    "pricingModel": "Usage based",
                    "description": "Dedicated and cloud server configurations with GPU acceleration hardware.",
                    "bestFor": "Small-scale deep learning models, 3D rendering tasks, and AI inference experiments.",
                    "advantages": [
                        "Very cost-effective GPU computing compared to hyperscalers",
                        "Dedicated hardware resources with no noisy-neighbor penalty",
                        "High bandwidth European network connectivity"
                    ],
                    "limitations": [
                        "Hardware stock is limited and sells out quickly",
                        "Not designed for massive multi-node distributed AI training"
                    ]
                }
            ]
        }
    },
    {
        "id": "ovhcloud",
        "name": "OVHcloud",
        "shortName": "OVHcloud",
        "logo": "ovhcloud",
        "categories": [
            "enterprise"
        ],
        "description": "A European cloud provider offering public cloud, dedicated infrastructure, storage, networking and AI services.",
        "strengths": [
            "Strong European infrastructure",
            "Competitive infrastructure pricing",
            "Wide range of compute options",
            "Dedicated server offerings",
            "GPU and AI infrastructure"
        ],
        "weaknesses": [
            "Smaller ecosystem than hyperscalers",
            "Some services require more technical knowledge",
            "Regional service differences"
        ],
        "pricingLevel": "Competitive",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides infrastructure, network and application security capabilities.",
            "reliability": "Distributed European and global infrastructure for reliable workloads.",
            "performance": "Broad compute, networking, storage and dedicated infrastructure options.",
            "compliance": "Strong focus on European data protection and supported compliance requirements.",
            "support": "Technical support options for cloud and enterprise customers."
        },
        "beginnerFriendly": 7.2,
        "affordability": 8.8,
        "scalability": 8,
        "enterprise": 7.4,
        "aiMl": 7.7,
        "globalReach": 7.8,
        "services": {
            "compute": [
                {
                    "name": "OVHcloud Public Cloud",
                    "type": "Virtual Machines",
                    "pricingModel": "Hourly/monthly",
                    "description": "Flexible open-standard virtual instances with guaranteed resources and anti-DDoS protection.",
                    "bestFor": "European businesses, GDPR-sensitive data, and cost-effective web hosting.",
                    "advantages": [
                        "World-class built-in anti-DDoS protection included for free",
                        "European data sovereignty guarantees (no US Cloud Act exposure)",
                        "Predictable monthly and hourly pricing"
                    ],
                    "limitations": [
                        "User interface and console can be slower to navigate",
                        "Customer support response times vary on standard tier"
                    ]
                },
                {
                    "name": "Managed Kubernetes Service",
                    "type": "Containers",
                    "pricingModel": "Resource based",
                    "description": "Certified CNCF Kubernetes service with free master nodes and automated updates.",
                    "bestFor": "Microservices architectures requiring data sovereignty and transparent pricing.",
                    "advantages": [
                        "Free Kubernetes master control plane nodes",
                        "Standard upstream Kubernetes ensures zero vendor lock-in",
                        "Native load balancer and persistent volume integrations"
                    ],
                    "limitations": [
                        "Provisioning times can take slightly longer than hyperscalers",
                        "Fewer managed enterprise security integrations"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Object Storage",
                    "type": "Object Storage",
                    "pricingModel": "Storage + transfer",
                    "description": "High-capacity, S3-compatible storage hosted in secure European and international facilities.",
                    "bestFor": "Data archiving, digital preservation, static website assets, and backups.",
                    "advantages": [
                        "Strict European data sovereignty and GDPR compliance",
                        "Zero API request charges on standard storage",
                        "Standard S3 API compatibility"
                    ],
                    "limitations": [
                        "Egress network charges outside OVHcloud network",
                        "Fewer granular IAM role policies compared to AWS S3"
                    ]
                },
                {
                    "name": "Block Storage",
                    "type": "Block Storage",
                    "pricingModel": "Provisioned capacity",
                    "description": "Persistent SSD storage volumes engineered for high I/O throughput and data durability.",
                    "bestFor": "Transactional databases, business applications, and boot storage for virtual servers.",
                    "advantages": [
                        "Triple replication of data blocks across infrastructure",
                        "Consistent IOPS performance on NVMe tiers",
                        "Independent volume lifecycle from virtual instances"
                    ],
                    "limitations": [
                        "Volumes cannot be dynamically shared between multiple servers",
                        "Performance tiers must be selected carefully for database workloads"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Managed Databases",
                    "type": "Managed Database",
                    "pricingModel": "Resource based",
                    "description": "Automated, managed open-source databases including PostgreSQL, MySQL, and Kafka.",
                    "bestFor": "Developers who need European data residency with automated database management.",
                    "advantages": [
                        "Built on standard open-source engines with zero proprietary modifications",
                        "Automated backups, scaling, and high-availability options",
                        "No data egress fees within the same OVHcloud project"
                    ],
                    "limitations": [
                        "Fewer database engine variants than major hyperscalers",
                        "Maintenance windows require scheduled switchovers"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "AI Endpoints",
                    "type": "AI Platform",
                    "pricingModel": "Usage based",
                    "description": "Serverless AI model API endpoints for fast integration of open-source AI models.",
                    "bestFor": "Developers integrating LLM completions, speech-to-text, and embeddings without managing GPUs.",
                    "advantages": [
                        "Pay only for API tokens or requests consumed",
                        "Hosted in Europe with strict data privacy guarantees",
                        "Access to top open-source models (Mistral, Llama) with simple REST calls"
                    ],
                    "limitations": [
                        "Catalog focuses on open-weights models rather than proprietary models",
                        "Custom fine-tuning requires dedicated GPU instances"
                    ]
                },
                {
                    "name": "GPU Instances",
                    "type": "GPU / AI Compute",
                    "pricingModel": "Usage based",
                    "description": "Dedicated GPU compute instances featuring NVIDIA accelerators.",
                    "bestFor": "Machine learning model training, AI inference, and scientific computing.",
                    "advantages": [
                        "Guaranteed GPU resources without shared-tenant contention",
                        "Cost-effective GPU pricing for European workloads",
                        "High-speed internal networking between compute nodes"
                    ],
                    "limitations": [
                        "Limited availability during high global GPU demand",
                        "Requires manual configuration of CUDA and deep learning drivers"
                    ]
                }
            ]
        }
    },
    {
        "id": "cloudflare",
        "name": "Cloudflare",
        "shortName": "Cloudflare",
        "logo": "cloudflare",
        "categories": [
            "beginner",
            "ai",
            "enterprise"
        ],
        "description": "A globally distributed cloud and connectivity platform focused on edge computing, security, networking and developer services.",
        "strengths": [
            "Excellent global edge network",
            "Strong security capabilities",
            "Excellent developer platform",
            "Strong performance for edge applications",
            "Simple serverless deployment"
        ],
        "weaknesses": [
            "Not a traditional full hyperscale cloud",
            "Some workloads are better suited to other providers",
            "Architecture differs from traditional VM-based clouds"
        ],
        "pricingLevel": "Usage based",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Strong security platform covering application protection, networking and access control.",
            "reliability": "Highly distributed edge infrastructure designed for resilient applications.",
            "performance": "Excellent edge performance and globally distributed application delivery.",
            "compliance": "Provides security and compliance capabilities for supported enterprise workloads.",
            "support": "Documentation and paid support options for different customer requirements."
        },
        "beginnerFriendly": 8.8,
        "affordability": 8.6,
        "scalability": 8.8,
        "enterprise": 8.2,
        "aiMl": 7.8,
        "globalReach": 9.8,
        "services": {
            "compute": [
                {
                    "name": "Cloudflare Workers",
                    "type": "Edge Serverless",
                    "pricingModel": "Request/usage based",
                    "description": "Ultra-low-latency serverless JavaScript/WASM execution across Cloudflare's global edge network.",
                    "bestFor": "Edge APIs, request rewriting, authentication checks, and latency-critical services.",
                    "advantages": [
                        "Zero cold starts — execution starts in milliseconds globally",
                        "Runs in 300+ cities worldwide close to end-users",
                        "Extremely generous free tier (100,000 requests/day)"
                    ],
                    "limitations": [
                        "CPU execution time limits per request (10ms on free, 30s on paid)",
                        "Non-Node.js V8 isolates runtime requires compatible libraries"
                    ]
                },
                {
                    "name": "Cloudflare Pages",
                    "type": "Web Application Platform",
                    "pricingModel": "Plan/usage based",
                    "description": "Fast, secure Jamstack web application hosting with automated Git integration.",
                    "bestFor": "Frontend static websites, single-page apps (React, Vue), and documentation sites.",
                    "advantages": [
                        "Unlimited bandwidth and free SSL certificates",
                        "Automatic Git preview deployments on every branch",
                        "Seamless full-stack integration with Cloudflare Workers"
                    ],
                    "limitations": [
                        "Build environment timeout limits for very large projects",
                        "Designed for static/Jamstack architectures rather than monolithic backends"
                    ]
                },
                {
                    "name": "Durable Objects",
                    "type": "Stateful Edge Compute",
                    "pricingModel": "Usage based",
                    "description": "Strongly consistent stateful coordination and storage co-located with edge compute.",
                    "bestFor": "Real-time multiplayer apps, collaborative editing tools, and distributed state coordination.",
                    "advantages": [
                        "Provides globally unique in-memory actors with persistent storage",
                        "Strong consistency without setting up database clusters",
                        "Built-in WebSocket support for real-time collaboration"
                    ],
                    "limitations": [
                        "Requires understanding the actor-model programming pattern",
                        "Single-threaded execution per object instance"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Cloudflare R2",
                    "type": "Object Storage",
                    "pricingModel": "Storage + operations",
                    "description": "S3-compatible zero-egress-fee object storage designed for massive scalability.",
                    "bestFor": "Storing and distributing user assets, media files, and backups without egress fee shock.",
                    "advantages": [
                        "Zero data egress fees — never pay for bandwidth when downloading files",
                        "Full S3 API compatibility works with existing tools",
                        "Automatic multi-region data placement"
                    ],
                    "limitations": [
                        "Slightly higher storage cost per GB than raw archive tiers",
                        "Newer service with fewer third-party ecosystem plugins"
                    ]
                },
                {
                    "name": "Workers KV",
                    "type": "Key-Value Storage",
                    "pricingModel": "Usage based",
                    "description": "Low-latency, globally replicated key-value data store accessible from Workers.",
                    "bestFor": "Configuration lookups, user session caching, and routing rules.",
                    "advantages": [
                        "Ultra-fast read latencies (sub-millisecond when cached at edge)",
                        "Globally distributed across all Cloudflare edge locations",
                        "Simple key-value read/write API"
                    ],
                    "limitations": [
                        "Eventual consistency model — writes take seconds to propagate globally",
                        "Not designed for high-frequency write workloads"
                    ]
                }
            ],
            "database": [
                {
                    "name": "D1",
                    "type": "SQL Database",
                    "pricingModel": "Usage based",
                    "description": "Serverless relational SQL database built on SQLite running right at the edge.",
                    "bestFor": "Web application backends, localized user data, and microservice databases.",
                    "advantages": [
                        "Standard SQL syntax with zero server provisioning",
                        "Co-located with Workers for ultra-low query latency",
                        "Automatic read replication across global locations"
                    ],
                    "limitations": [
                        "Built on SQLite, so complex PostgreSQL/MySQL extensions are not available",
                        "Database size limits apply during current product phase"
                    ]
                },
                {
                    "name": "Hyperdrive",
                    "type": "Database Connectivity",
                    "pricingModel": "Usage based",
                    "description": "High-performance database connection pooler that makes regional databases feel local globally.",
                    "bestFor": "Accelerating connections from serverless edge functions to central SQL databases.",
                    "advantages": [
                        "Reuses database connections to eliminate connection setup overhead",
                        "Caches database query results automatically at the edge",
                        "Works with existing PostgreSQL databases on AWS, Supabase, Neon, etc."
                    ],
                    "limitations": [
                        "Works with supported SQL engines (primarily PostgreSQL currently)",
                        "Does not replace the need for an underlying database host"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "Workers AI",
                    "type": "AI Platform",
                    "pricingModel": "Usage based",
                    "description": "Serverless GPU-powered inference running popular open-source models at the global edge.",
                    "bestFor": "Edge AI tasks like translation, embeddings, sentiment analysis, and text generation.",
                    "advantages": [
                        "Serverless GPU compute with zero model deployment hassle",
                        "Access to open-source models (Llama, Mistral, Whisper) in one line of code",
                        "Low inference latency with GPUs distributed across global datacenters"
                    ],
                    "limitations": [
                        "Inference only — does not support training custom models from scratch",
                        "Context window and token limits on edge model instances"
                    ]
                },
                {
                    "name": "Vectorize",
                    "type": "Vector Database",
                    "pricingModel": "Usage based",
                    "description": "Fully managed vector database for semantic search and Retrieval-Augmented Generation (RAG).",
                    "bestFor": "Storing embeddings and powering AI search pipelines at the edge.",
                    "advantages": [
                        "Native integration with Workers AI embeddings generation",
                        "Ultra-fast vector similarity search at the edge",
                        "Serverless scaling with straightforward pricing"
                    ],
                    "limitations": [
                        "Maximum dimension and index size limits per vector index",
                        "Focused on vector search rather than general document storage"
                    ]
                }
            ]
        }
    },
    {
        "id": "akamai",
        "name": "Akamai Cloud",
        "shortName": "Akamai",
        "logo": "akamai",
        "categories": [
            "enterprise"
        ],
        "description": "A distributed cloud platform built around edge computing, application delivery, security and infrastructure services.",
        "strengths": [
            "Large edge network",
            "Strong security capabilities",
            "Good application delivery",
            "Distributed cloud infrastructure",
            "Strong performance for edge workloads"
        ],
        "weaknesses": [
            "Less familiar to beginners",
            "Smaller general-purpose cloud ecosystem",
            "Best suited to particular distributed workloads"
        ],
        "pricingLevel": "Usage based",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Strong application, network and edge security capabilities.",
            "reliability": "Large distributed edge infrastructure designed for resilient application delivery.",
            "performance": "Strong global edge performance and application delivery capabilities.",
            "compliance": "Enterprise security and compliance capabilities for supported workloads.",
            "support": "Enterprise-oriented technical support and service options."
        },
        "beginnerFriendly": 7,
        "affordability": 7.5,
        "scalability": 8.5,
        "enterprise": 8.4,
        "aiMl": 6.8,
        "globalReach": 9.5,
        "services": {
            "compute": [
                {
                    "name": "Akamai Cloud Compute",
                    "type": "Virtual Machines",
                    "pricingModel": "Hourly/monthly",
                    "description": "Distributed virtual compute instances running close to end-users on Akamai's edge backbone (formerly Linode).",
                    "bestFor": "Low-latency web applications, gaming servers, and streaming media backends.",
                    "advantages": [
                        "Co-located with Akamai's global content delivery network",
                        "Simple, transparent pricing structure inherited from Linode",
                        "Generous included bandwidth bundles with each instance"
                    ],
                    "limitations": [
                        "Fewer specialized enterprise services compared to hyperscalers",
                        "Basic web console interface compared to AWS or Azure"
                    ]
                },
                {
                    "name": "Akamai Edge Compute",
                    "type": "Edge Compute",
                    "pricingModel": "Usage based",
                    "description": "Serverless execution at edge locations directly inside Akamai's CDN points of presence.",
                    "bestFor": "Content customization, header manipulation, and edge security filtering.",
                    "advantages": [
                        "Executes within milliseconds of virtually any internet user globally",
                        "Tight integration with Akamai CDN and web application firewall",
                        "Handles massive request bursts with zero scaling delay"
                    ],
                    "limitations": [
                        "Restricted execution environments designed for lightweight logic",
                        "Requires familiarity with Akamai edge deployment workflows"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Akamai Cloud Storage",
                    "type": "Object Storage",
                    "pricingModel": "Usage based",
                    "description": "S3-compatible object storage integrated with Akamai's global content delivery network.",
                    "bestFor": "Streaming video origins, downloadable media, and global static asset hosting.",
                    "advantages": [
                        "Direct, high-speed routing to Akamai CDN edge servers",
                        "Standard S3 API compatibility",
                        "Affordable flat storage and bandwidth pricing"
                    ],
                    "limitations": [
                        "Fewer lifecycle storage tier automation options",
                        "Targeted at media distribution rather than complex data lakes"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Managed Databases",
                    "type": "Managed Database",
                    "pricingModel": "Resource based",
                    "description": "Automated, managed open-source databases including PostgreSQL, MySQL, and Kafka.",
                    "bestFor": "Developers who need European data residency with automated database management.",
                    "advantages": [
                        "Built on standard open-source engines with zero proprietary modifications",
                        "Automated backups, scaling, and high-availability options",
                        "No data egress fees within the same OVHcloud project"
                    ],
                    "limitations": [
                        "Fewer database engine variants than major hyperscalers",
                        "Maintenance windows require scheduled switchovers"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "GPU Cloud",
                    "type": "GPU / AI Compute",
                    "pricingModel": "Usage based",
                    "description": "Edge-adjacent GPU infrastructure for real-time video processing and AI model inference.",
                    "bestFor": "Real-time video transcoding, computer vision analysis, and low-latency AI inference.",
                    "advantages": [
                        "Fast GPU processing co-located with global CDN distribution",
                        "Low network latency to end users for live video and AI",
                        "Predictable hourly pricing"
                    ],
                    "limitations": [
                        "Smaller fleet of high-end AI training GPUs than specialized AI clouds",
                        "Focused on inference and media rather than massive LLM pretraining"
                    ]
                }
            ]
        }
    },
    {
        "id": "coreweave",
        "name": "CoreWeave",
        "shortName": "CoreWeave",
        "logo": "coreweave",
        "categories": [
            "ai",
            "enterprise"
        ],
        "description": "A specialized cloud platform focused on GPU-accelerated computing, AI training, inference and high-performance workloads.",
        "strengths": [
            "Strong GPU infrastructure",
            "Designed for AI workloads",
            "High-performance computing",
            "Strong AI infrastructure focus",
            "Kubernetes-based cloud infrastructure"
        ],
        "weaknesses": [
            "Specialized rather than general-purpose",
            "Less suitable for simple websites",
            "Smaller general cloud ecosystem",
            "GPU-focused workloads may be more expensive than basic compute"
        ],
        "pricingLevel": "Usage based",
        "officialLinks": {
            "website": "",
            "documentation": "",
            "pricing": ""
        },
        "capabilities": {
            "security": "Provides infrastructure security and access controls for cloud workloads.",
            "reliability": "Designed for high-performance AI and compute workloads.",
            "performance": "Highly optimized GPU infrastructure for AI, machine learning and high-performance computing.",
            "compliance": "Provides security and compliance capabilities appropriate to supported enterprise workloads.",
            "support": "Technical support focused on high-performance and AI infrastructure."
        },
        "beginnerFriendly": 6.2,
        "affordability": 6.8,
        "scalability": 8.7,
        "enterprise": 8,
        "aiMl": 9.9,
        "globalReach": 7.2,
        "services": {
            "compute": [
                {
                    "name": "GPU Compute",
                    "type": "GPU Virtual Machines",
                    "pricingModel": "Usage based",
                    "description": "Specialized, high-performance GPU virtual machines (NVIDIA H100, H200, A100, L40S) for AI.",
                    "bestFor": "Large language model (LLM) training, high-throughput inference, and 3D rendering.",
                    "advantages": [
                        "Access to top-tier NVIDIA GPUs with ultra-fast InfiniBand interconnects",
                        "Up to 35x faster networking than traditional cloud providers",
                        "Significantly more cost-effective per GPU hour than AWS or GCP"
                    ],
                    "limitations": [
                        "Specialized platform — not intended for standard LAMP/CRUD web apps",
                        "Requires deep machine learning infrastructure expertise"
                    ]
                },
                {
                    "name": "CPU Compute",
                    "type": "Virtual Machines",
                    "pricingModel": "Usage based",
                    "description": "High-performance CPU instances designed to feed data into GPU computing clusters.",
                    "bestFor": "Data preprocessing, ingestion pipelines, and ML workflow orchestration.",
                    "advantages": [
                        "High-throughput memory channels and fast local NVMe storage",
                        "Seamless high-speed network connectivity to GPU instances",
                        "Flexible per-second billing"
                    ],
                    "limitations": [
                        "Available primarily in support of AI and compute-intensive workloads",
                        "Not intended as general-purpose business VM hosting"
                    ]
                },
                {
                    "name": "Kubernetes",
                    "type": "Containers",
                    "pricingModel": "Resource based",
                    "description": "Native Kubernetes-orchestrated infrastructure tailored for massive AI cluster training.",
                    "bestFor": "Distributed training jobs, multi-node clusters, and automated model scaling.",
                    "advantages": [
                        "Built from the ground up for containerized machine learning",
                        "Native support for Slurm and Kubernetes ML operators (KubeRay, MPI)",
                        "Bare-metal-like performance with container agility"
                    ],
                    "limitations": [
                        "Requires experienced Kubernetes cluster operators",
                        "Lacks managed consumer PaaS tools for beginner developers"
                    ]
                }
            ],
            "storage": [
                {
                    "name": "Cloud Storage",
                    "type": "Object Storage",
                    "pricingModel": "Usage based",
                    "description": "Unified, highly durable object storage service featuring global edge points of presence and strong consistency.",
                    "bestFor": "Serving website assets, storing media, analytics data lakes, and disaster recovery backups.",
                    "advantages": [
                        "High global availability and instant data consistency worldwide",
                        "Auto-class tiering moves data to cheaper tiers automatically",
                        "Single unified API across all storage classes"
                    ],
                    "limitations": [
                        "Egress network charges apply when serving data outside Google Cloud",
                        "Not optimized for traditional POSIX file system mounting"
                    ]
                },
                {
                    "name": "Block Storage",
                    "type": "Block Storage",
                    "pricingModel": "Provisioned capacity",
                    "description": "Persistent SSD storage volumes engineered for high I/O throughput and data durability.",
                    "bestFor": "Transactional databases, business applications, and boot storage for virtual servers.",
                    "advantages": [
                        "Triple replication of data blocks across infrastructure",
                        "Consistent IOPS performance on NVMe tiers",
                        "Independent volume lifecycle from virtual instances"
                    ],
                    "limitations": [
                        "Volumes cannot be dynamically shared between multiple servers",
                        "Performance tiers must be selected carefully for database workloads"
                    ]
                }
            ],
            "database": [
                {
                    "name": "Managed Database Options",
                    "type": "Managed Database",
                    "pricingModel": "Usage based",
                    "description": "Flexible managed database solutions supporting modern application and pipeline data storage.",
                    "bestFor": "Application metadata, logs, and state storage.",
                    "advantages": [
                        "Automated maintenance and backups",
                        "High reliability and performance",
                        "Simple management"
                    ],
                    "limitations": [
                        "Fewer custom database engines available"
                    ]
                }
            ],
            "ai": [
                {
                    "name": "GPU Cloud",
                    "type": "AI / ML Compute",
                    "pricingModel": "Usage based",
                    "description": "Edge-adjacent GPU infrastructure for real-time video processing and AI model inference.",
                    "bestFor": "Real-time video transcoding, computer vision analysis, and low-latency AI inference.",
                    "advantages": [
                        "Fast GPU processing co-located with global CDN distribution",
                        "Low network latency to end users for live video and AI",
                        "Predictable hourly pricing"
                    ],
                    "limitations": [
                        "Smaller fleet of high-end AI training GPUs than specialized AI clouds",
                        "Focused on inference and media rather than massive LLM pretraining"
                    ]
                },
                {
                    "name": "AI Infrastructure",
                    "type": "AI / ML Platform",
                    "pricingModel": "Usage based",
                    "description": "Full-stack specialized AI hardware, storage, and InfiniBand networking for high-scale computing.",
                    "bestFor": "Training frontier AI models and massive scale distributed computing.",
                    "advantages": [
                        "NVIDIA Quantum-2 InfiniBand architecture delivers 3.2Tbps per node",
                        "Validated reference designs for large-scale distributed training",
                        "Dedicated infrastructure engineers specializing in AI workloads"
                    ],
                    "limitations": [
                        "High minimum commitments for dedicated AI supercomputer clusters",
                        "Specialized purely for artificial intelligence research and production"
                    ]
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
