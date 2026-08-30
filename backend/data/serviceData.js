// =========================================================
// CLOUDEX - DETAILED SERVICE DATA
// =========================================================

const serviceData = {

    // =====================================================
    // AWS
    // =====================================================

    "aws:Amazon EC2": {
        description:
            "Amazon EC2 provides virtual servers that allow applications to run with control over computing resources and the operating system.",
        bestFor:
            "Customizable applications, websites, APIs and workloads that need control over virtual machines.",
        advantages: [
            "Highly configurable",
            "Large range of instance types",
            "Suitable for many workloads",
            "Can scale according to workload requirements"
        ],
        limitations: [
            "Requires more configuration than serverless services",
            "Users may need to manage the operating system"
        ]
    },

    "aws:AWS Lambda": {
        description:
            "AWS Lambda runs application code without requiring users to manage servers.",
        bestFor:
            "Event-driven applications, APIs, automation and short-running workloads.",
        advantages: [
            "No server management",
            "Automatically scales",
            "Pay based on usage",
            "Good for event-driven applications"
        ],
        limitations: [
            "Not ideal for every long-running workload",
            "Execution limits can affect some applications"
        ]
    },

    "aws:Amazon ECS": {
        description:
            "Amazon ECS is a managed container orchestration service used to run and manage containerized applications.",
        bestFor:
            "Applications packaged using Docker containers.",
        advantages: [
            "Managed container orchestration",
            "Integrates strongly with AWS services",
            "Supports scalable container workloads"
        ],
        limitations: [
            "Requires knowledge of containers",
            "Architecture can be more complex than simple hosting"
        ]
    },

    "aws:Amazon S3": {
        description:
            "Amazon S3 is an object storage service for storing files, media, backups, datasets and other unstructured data.",
        bestFor:
            "Images, videos, documents, backups, static websites and large datasets.",
        advantages: [
            "Highly durable storage",
            "Scales to very large amounts of data",
            "Wide ecosystem integration",
            "Suitable for many types of files"
        ],
        limitations: [
            "Object storage is different from a normal filesystem",
            "Costs depend on storage, requests and data transfer"
        ]
    },

    "aws:Amazon EBS": {
        description:
            "Amazon EBS provides persistent block storage volumes that can be attached to EC2 instances.",
        bestFor:
            "Applications running on virtual machines that require persistent disk storage.",
        advantages: [
            "Persistent storage",
            "Multiple performance options",
            "Integrates directly with EC2"
        ],
        limitations: [
            "Primarily designed around EC2",
            "Requires storage planning"
        ]
    },

    "aws:Amazon RDS": {
        description:
            "Amazon RDS is a managed relational database service that handles many database administration tasks.",
        bestFor:
            "Applications requiring SQL databases without wanting to manage database infrastructure manually.",
        advantages: [
            "Managed database administration",
            "Supports common relational database engines",
            "Backup and maintenance features"
        ],
        limitations: [
            "Costs increase with larger database resources",
            "Requires choosing an appropriate database engine"
        ]
    },

    "aws:Amazon DynamoDB": {
        description:
            "Amazon DynamoDB is a managed NoSQL database designed for highly scalable applications.",
        bestFor:
            "Applications requiring fast key-value or document database access at scale.",
        advantages: [
            "Highly scalable",
            "Managed service",
            "Low-latency access",
            "Good for large application workloads"
        ],
        limitations: [
            "Different data model from traditional SQL databases",
            "Requires understanding NoSQL design"
        ]
    },

    "aws:Amazon Bedrock": {
        description:
            "Amazon Bedrock provides access to generative AI models through managed APIs and AI services.",
        bestFor:
            "Applications requiring generative AI, text generation, assistants and AI-powered features.",
        advantages: [
            "Managed generative AI platform",
            "Multiple model options",
            "Integrates with AWS infrastructure"
        ],
        limitations: [
            "AI usage can increase costs",
            "Model capabilities vary"
        ]
    },

    "aws:Amazon SageMaker": {
        description:
            "Amazon SageMaker provides tools for building, training and deploying machine learning models.",
        bestFor:
            "Organizations and developers building custom machine learning workflows.",
        advantages: [
            "Complete ML lifecycle support",
            "Training and deployment capabilities",
            "Strong AWS integration"
        ],
        limitations: [
            "More complex than simple AI APIs",
            "Can require significant ML knowledge"
        ]
    },


    // =====================================================
    // AZURE
    // =====================================================

    "azure:Azure Virtual Machines": {
        description:
            "Azure Virtual Machines provide configurable virtual servers running in Microsoft Azure.",
        bestFor:
            "Applications requiring customizable virtual machines and Microsoft ecosystem integration.",
        advantages: [
            "Highly configurable",
            "Strong Microsoft integration",
            "Multiple operating system options",
            "Scalable infrastructure"
        ],
        limitations: [
            "Requires infrastructure management",
            "Pricing can become complex"
        ]
    },

    "azure:Azure Functions": {
        description:
            "Azure Functions provides serverless execution of application code without requiring traditional server management.",
        bestFor:
            "APIs, automation, event processing and serverless applications.",
        advantages: [
            "Serverless",
            "Automatic scaling",
            "Good Azure integration",
            "Usage-based execution"
        ],
        limitations: [
            "Execution limitations",
            "Not ideal for every long-running workload"
        ]
    },

    "azure:Azure Kubernetes Service": {
        description:
            "Azure Kubernetes Service provides managed Kubernetes clusters for containerized applications.",
        bestFor:
            "Organizations running containerized applications requiring Kubernetes.",
        advantages: [
            "Managed Kubernetes",
            "Strong Azure integration",
            "Scalable container infrastructure"
        ],
        limitations: [
            "Kubernetes has a learning curve",
            "May be unnecessary for simple applications"
        ]
    },

    "azure:Azure Blob Storage": {
        description:
            "Azure Blob Storage is Microsoft's object storage service for unstructured data such as files and media.",
        bestFor:
            "Documents, images, videos, backups and large unstructured datasets.",
        advantages: [
            "Highly scalable",
            "Strong Microsoft integration",
            "Multiple storage tiers"
        ],
        limitations: [
            "Object-storage model requires understanding",
            "Costs depend on storage and data operations"
        ]
    },

    "azure:Azure Disk Storage": {
        description:
            "Azure Disk Storage provides persistent block storage for Azure Virtual Machines.",
        bestFor:
            "Virtual machines requiring persistent disks.",
        advantages: [
            "Persistent storage",
            "Multiple performance levels",
            "Direct VM integration"
        ],
        limitations: [
            "Primarily tied to VM workloads",
            "Performance level affects cost"
        ]
    },

    "azure:Azure SQL Database": {
        description:
            "Azure SQL Database is a managed relational database service based on Microsoft SQL technology.",
        bestFor:
            "Applications requiring SQL databases, especially Microsoft-oriented applications.",
        advantages: [
            "Managed database",
            "Strong Microsoft integration",
            "Built-in management capabilities"
        ],
        limitations: [
            "Can become expensive at larger scales",
            "Best suited to SQL workloads"
        ]
    },

    "azure:Azure Cosmos DB": {
        description:
            "Azure Cosmos DB is a globally distributed NoSQL database designed for scalable applications.",
        bestFor:
            "Globally distributed applications requiring low-latency NoSQL access.",
        advantages: [
            "Global distribution",
            "Scalable NoSQL architecture",
            "Managed service"
        ],
        limitations: [
            "Different from traditional SQL databases",
            "Pricing requires careful planning"
        ]
    },

    "azure:Azure AI Foundry": {
        description:
            "Azure AI Foundry provides tools and services for developing and managing AI applications and models.",
        bestFor:
            "Developers and organizations building AI-powered applications.",
        advantages: [
            "Strong Azure integration",
            "AI development tooling",
            "Enterprise-oriented capabilities"
        ],
        limitations: [
            "Can be complex for beginners",
            "AI service costs depend on usage"
        ]
    },

    "azure:Azure Machine Learning": {
        description:
            "Azure Machine Learning provides tools for developing, training and deploying machine learning models.",
        bestFor:
            "Custom machine learning projects and enterprise ML workflows.",
        advantages: [
            "Complete ML workflow",
            "Model training and deployment",
            "Strong Azure integration"
        ],
        limitations: [
            "Requires ML knowledge",
            "More complex than simple AI APIs"
        ]
    },


    // =====================================================
    // GOOGLE CLOUD
    // =====================================================

    "gcp:Compute Engine": {
        description:
            "Compute Engine provides configurable virtual machines running on Google's infrastructure.",
        bestFor:
            "Applications requiring customizable virtual machines and Google's infrastructure.",
        advantages: [
            "Flexible VM configurations",
            "Strong global infrastructure",
            "Excellent networking capabilities"
        ],
        limitations: [
            "Requires VM management",
            "Can be complex for beginners"
        ]
    },

    "gcp:Cloud Run": {
        description:
            "Cloud Run runs containerized applications as a managed serverless service.",
        bestFor:
            "Web applications, APIs and containerized services that need simple deployment.",
        advantages: [
            "Serverless containers",
            "Automatic scaling",
            "Simple deployment",
            "Pay for usage"
        ],
        limitations: [
            "Container knowledge is useful",
            "Some workloads may require other compute models"
        ]
    },

    "gcp:Google Kubernetes Engine": {
        description:
            "Google Kubernetes Engine provides managed Kubernetes infrastructure.",
        bestFor:
            "Containerized applications requiring Kubernetes orchestration.",
        advantages: [
            "Managed Kubernetes",
            "Strong Google networking",
            "Highly scalable"
        ],
        limitations: [
            "Kubernetes learning curve",
            "Can be excessive for small projects"
        ]
    },

    "gcp:Cloud Storage": {
        description:
            "Google Cloud Storage provides scalable object storage for files, media, backups and datasets.",
        bestFor:
            "Large-scale file and object storage.",
        advantages: [
            "Highly scalable",
            "Multiple storage classes",
            "Strong Google Cloud integration"
        ],
        limitations: [
            "Object-storage model",
            "Usage and transfer costs need consideration"
        ]
    },

    "gcp:Cloud SQL": {
        description:
            "Cloud SQL is a managed relational database service provided by Google Cloud.",
        bestFor:
            "Applications requiring managed SQL databases.",
        advantages: [
            "Managed database administration",
            "Easy integration with Google Cloud",
            "Supports common relational workloads"
        ],
        limitations: [
            "Primarily for relational workloads",
            "Costs depend on database resources"
        ]
    },

    "gcp:Firestore": {
        description:
            "Firestore is a managed NoSQL document database designed for application development.",
        bestFor:
            "Web and mobile applications requiring flexible document-based data storage.",
        advantages: [
            "Developer friendly",
            "Real-time capabilities",
            "Managed service",
            "Good application integration"
        ],
        limitations: [
            "NoSQL data model",
            "Complex queries may require careful design"
        ]
    },

    "gcp:BigQuery": {
        description:
            "BigQuery is a managed cloud data warehouse designed for large-scale analytics.",
        bestFor:
            "Data analytics, reporting and large datasets.",
        advantages: [
            "Excellent analytics performance",
            "Serverless data warehouse",
            "Handles large datasets"
        ],
        limitations: [
            "Designed for analytics rather than normal application transactions",
            "Query usage can create costs"
        ]
    },

    "gcp:Vertex AI": {
        description:
            "Vertex AI provides managed tools for building, training and deploying AI and machine learning applications.",
        bestFor:
            "AI, machine learning and generative AI applications.",
        advantages: [
            "Strong AI ecosystem",
            "Model development and deployment",
            "Excellent data and ML integration"
        ],
        limitations: [
            "Can be complex for beginners",
            "AI usage can increase costs"
        ]
    },


    // =====================================================
    // ORACLE CLOUD
    // =====================================================

    "oracle:OCI Compute": {
        description:
            "OCI Compute provides virtual machine and compute infrastructure on Oracle Cloud.",
        bestFor:
            "Enterprise applications and Oracle workloads requiring configurable compute.",
        advantages: [
            "Strong performance",
            "Enterprise infrastructure",
            "Good Oracle ecosystem integration"
        ],
        limitations: [
            "Smaller ecosystem than hyperscalers",
            "Can require infrastructure knowledge"
        ]
    },

    "oracle:OCI Container Instances": {
        description:
            "OCI Container Instances allows containers to run without managing Kubernetes clusters.",
        bestFor:
            "Containerized workloads that do not require full Kubernetes orchestration.",
        advantages: [
            "Simpler than managing Kubernetes",
            "Managed container execution",
            "Oracle Cloud integration"
        ],
        limitations: [
            "Less flexible than full Kubernetes",
            "Requires container knowledge"
        ]
    },

    "oracle:OCI Object Storage": {
        description:
            "OCI Object Storage provides scalable object storage for files, backups and application data.",
        bestFor:
            "Enterprise files, backups and unstructured data.",
        advantages: [
            "Scalable",
            "Strong Oracle integration",
            "Suitable for large datasets"
        ],
        limitations: [
            "Object-storage model",
            "Costs depend on usage"
        ]
    },

    "oracle:Oracle Autonomous Database": {
        description:
            "Oracle Autonomous Database is a managed database platform designed to automate many database administration tasks.",
        bestFor:
            "Enterprise applications requiring Oracle database technology.",
        advantages: [
            "Managed database operations",
            "Strong Oracle ecosystem",
            "Enterprise capabilities"
        ],
        limitations: [
            "Primarily suited to Oracle workloads",
            "Can be complex for beginners"
        ]
    },

    "oracle:MySQL HeatWave": {
        description:
            "MySQL HeatWave is a managed MySQL database platform with integrated high-performance analytics.",
        bestFor:
            "Applications using MySQL that also need analytics capabilities.",
        advantages: [
            "Managed MySQL",
            "Strong performance",
            "Integrated analytics"
        ],
        limitations: [
            "Primarily focused on MySQL workloads",
            "Requires database knowledge"
        ]
    },

    "oracle:OCI Generative AI": {
        description:
            "OCI Generative AI provides managed generative AI capabilities for applications.",
        bestFor:
            "Applications requiring text generation and other generative AI functionality.",
        advantages: [
            "Managed AI services",
            "Oracle Cloud integration",
            "Enterprise-oriented"
        ],
        limitations: [
            "AI usage costs vary",
            "Model availability can vary"
        ]
    },


    // =====================================================
    // IBM CLOUD
    // =====================================================

    "ibm:IBM Virtual Servers": {
        description:
            "IBM Virtual Servers provide configurable virtual machine infrastructure.",
        bestFor:
            "Enterprise applications requiring virtual server infrastructure.",
        advantages: [
            "Flexible compute",
            "Enterprise infrastructure",
            "Hybrid-cloud integration"
        ],
        limitations: [
            "Less beginner focused",
            "Smaller ecosystem than hyperscalers"
        ]
    },

    "ibm:IBM Code Engine": {
        description:
            "IBM Code Engine provides managed serverless and container application deployment.",
        bestFor:
            "Developers wanting to deploy applications without managing traditional servers.",
        advantages: [
            "Managed deployment",
            "Serverless containers",
            "Good developer experience"
        ],
        limitations: [
            "Container knowledge may help",
            "Service ecosystem is smaller than major hyperscalers"
        ]
    },

    "ibm:IBM Cloud Object Storage": {
        description:
            "IBM Cloud Object Storage provides scalable storage for files, backups and unstructured data.",
        bestFor:
            "Enterprise object storage and large datasets.",
        advantages: [
            "Scalable",
            "Enterprise focused",
            "Suitable for backups and data"
        ],
        limitations: [
            "Object-storage model",
            "Less commonly used by beginners"
        ]
    },

    "ibm:IBM Cloud Databases": {
        description:
            "IBM Cloud Databases provides managed database services for application workloads.",
        bestFor:
            "Applications requiring managed database infrastructure.",
        advantages: [
            "Managed databases",
            "Enterprise capabilities",
            "Simplifies administration"
        ],
        limitations: [
            "Service choices vary",
            "Can be more enterprise oriented"
        ]
    },

    "ibm:Db2": {
        description:
            "IBM Db2 is an enterprise relational database platform.",
        bestFor:
            "Enterprise applications requiring robust relational database capabilities.",
        advantages: [
            "Enterprise reliability",
            "Strong analytics capabilities",
            "Mature database technology"
        ],
        limitations: [
            "More complex for beginners",
            "Primarily enterprise focused"
        ]
    },

    "ibm:watsonx.ai": {
        description:
            "watsonx.ai provides tools for developing generative AI and machine learning applications.",
        bestFor:
            "Enterprise AI and machine learning workloads.",
        advantages: [
            "Enterprise AI capabilities",
            "Model development tools",
            "Strong IBM ecosystem integration"
        ],
        limitations: [
            "Can be complex for beginners",
            "Best suited to more advanced AI projects"
        ]
    },


    // =====================================================
    // DIGITALOCEAN
    // =====================================================

    "digitalocean:Droplets": {
        description:
            "Droplets are DigitalOcean virtual machines designed for simple and predictable application hosting.",
        bestFor:
            "Websites, APIs, student projects and small applications.",
        advantages: [
            "Very simple to deploy",
            "Developer friendly",
            "Predictable infrastructure",
            "Good for beginners"
        ],
        limitations: [
            "Smaller ecosystem",
            "Fewer advanced enterprise services"
        ]
    },

    "digitalocean:App Platform": {
        description:
            "App Platform is a managed application deployment service that reduces infrastructure management.",
        bestFor:
            "Developers who want to deploy applications without managing servers directly.",
        advantages: [
            "Simple deployment",
            "Managed infrastructure",
            "Beginner friendly"
        ],
        limitations: [
            "Less infrastructure control",
            "Fewer advanced capabilities than hyperscalers"
        ]
    },

    "digitalocean:Spaces": {
        description:
            "Spaces provides object storage for files, images, videos and application assets.",
        bestFor:
            "Simple object storage for websites and applications.",
        advantages: [
            "Simple to use",
            "Developer friendly",
            "Predictable storage model"
        ],
        limitations: [
            "Smaller ecosystem",
            "Fewer advanced storage features"
        ]
    },

    "digitalocean:Managed Databases": {
        description:
            "DigitalOcean Managed Databases provides managed database infrastructure without requiring manual server administration.",
        bestFor:
            "Small and medium applications needing a managed database.",
        advantages: [
            "Easy setup",
            "Beginner friendly",
            "Managed administration"
        ],
        limitations: [
            "Fewer database options than large hyperscalers",
            "Less enterprise oriented"
        ]
    },

    "digitalocean:GPU Droplets": {
        description:
            "GPU Droplets provide GPU-powered compute resources for AI and machine learning workloads.",
        bestFor:
            "Smaller AI experiments and GPU-based applications.",
        advantages: [
            "Easy GPU access",
            "Developer friendly",
            "Useful for experimentation"
        ],
        limitations: [
            "Less extensive AI ecosystem",
            "GPU resources can become expensive"
        ]
    },


    // =====================================================
    // ALIBABA CLOUD
    // =====================================================

    "alibaba:Elastic Compute Service": {
        description:
            "Elastic Compute Service provides scalable virtual machines on Alibaba Cloud.",
        bestFor:
            "Applications requiring configurable compute infrastructure, especially in Asian markets.",
        advantages: [
            "Scalable compute",
            "Strong Asian infrastructure",
            "Large service ecosystem"
        ],
        limitations: [
            "Can be complex",
            "Some services vary by region"
        ]
    },

    "alibaba:Function Compute": {
        description:
            "Function Compute provides serverless execution for application functions.",
        bestFor:
            "Event-driven applications and serverless APIs.",
        advantages: [
            "No server management",
            "Automatic scaling",
            "Usage based"
        ],
        limitations: [
            "Execution constraints",
            "Requires serverless architecture understanding"
        ]
    },

    "alibaba:Container Service for Kubernetes": {
        description:
            "Alibaba Cloud's managed Kubernetes service provides container orchestration.",
        bestFor:
            "Large containerized applications requiring Kubernetes.",
        advantages: [
            "Managed Kubernetes",
            "Scalable",
            "Strong Alibaba integration"
        ],
        limitations: [
            "Kubernetes complexity",
            "May be excessive for small applications"
        ]
    },

    "alibaba:Object Storage Service": {
        description:
            "Object Storage Service provides scalable storage for files and unstructured data.",
        bestFor:
            "Large-scale files, backups and application assets.",
        advantages: [
            "Scalable",
            "Durable object storage",
            "Strong regional infrastructure"
        ],
        limitations: [
            "Object-storage model",
            "Pricing varies with usage"
        ]
    },

    "alibaba:ApsaraDB RDS": {
        description:
            "ApsaraDB RDS provides managed relational database services.",
        bestFor:
            "Applications requiring managed SQL databases.",
        advantages: [
            "Managed database",
            "Scalable",
            "Strong Alibaba integration"
        ],
        limitations: [
            "Region-dependent features",
            "Requires database knowledge"
        ]
    },

    "alibaba:PolarDB": {
        description:
            "PolarDB is a cloud-native database service designed for scalable database workloads.",
        bestFor:
            "Applications requiring high-performance managed databases.",
        advantages: [
            "Scalable architecture",
            "Strong performance",
            "Managed service"
        ],
        limitations: [
            "More specialized",
            "Requires database knowledge"
        ]
    },

    "alibaba:PAI": {
        description:
            "PAI is Alibaba Cloud's machine learning and AI platform.",
        bestFor:
            "Machine learning development, training and deployment.",
        advantages: [
            "ML tooling",
            "Training and deployment",
            "Alibaba ecosystem integration"
        ],
        limitations: [
            "Requires ML knowledge",
            "Can be complex for beginners"
        ]
    },


    // =====================================================
    // HUAWEI CLOUD
    // =====================================================

    "huawei:Elastic Cloud Server": {
        description:
            "Elastic Cloud Server provides scalable virtual machine infrastructure.",
        bestFor:
            "Applications requiring configurable cloud compute.",
        advantages: [
            "Flexible compute",
            "Scalable",
            "Strong infrastructure options"
        ],
        limitations: [
            "Regional differences",
            "Requires VM management"
        ]
    },

    "huawei:FunctionGraph": {
        description:
            "FunctionGraph provides serverless function execution.",
        bestFor:
            "Event-driven applications and APIs.",
        advantages: [
            "Serverless",
            "Automatic scaling",
            "No server management"
        ],
        limitations: [
            "Execution limitations",
            "Not suitable for every workload"
        ]
    },

    "huawei:Cloud Container Engine": {
        description:
            "Cloud Container Engine provides managed Kubernetes infrastructure.",
        bestFor:
            "Containerized applications requiring Kubernetes.",
        advantages: [
            "Managed Kubernetes",
            "Scalable",
            "Cloud-native workloads"
        ],
        limitations: [
            "Kubernetes learning curve",
            "May be unnecessary for simple applications"
        ]
    },

    "huawei:Object Storage Service": {
        description:
            "Object Storage Service provides scalable object storage for application files and data.",
        bestFor:
            "Files, media, backups and unstructured data.",
        advantages: [
            "Scalable",
            "Durable",
            "Suitable for large datasets"
        ],
        limitations: [
            "Object-storage model",
            "Regional considerations"
        ]
    },

    "huawei:Relational Database Service": {
        description:
            "Relational Database Service provides managed relational databases.",
        bestFor:
            "Applications requiring managed SQL databases.",
        advantages: [
            "Managed administration",
            "Scalable",
            "Enterprise oriented"
        ],
        limitations: [
            "Database knowledge required",
            "Regional service differences"
        ]
    },

    "huawei:GaussDB": {
        description:
            "GaussDB is a distributed database platform designed for scalable enterprise workloads.",
        bestFor:
            "Large-scale database applications.",
        advantages: [
            "Distributed architecture",
            "Scalable",
            "Enterprise capabilities"
        ],
        limitations: [
            "More complex than basic databases",
            "Less familiar to beginners"
        ]
    },

    "huawei:ModelArts": {
        description:
            "ModelArts provides tools for developing, training and deploying machine learning models.",
        bestFor:
            "AI and machine learning projects.",
        advantages: [
            "ML development tools",
            "Training and deployment",
            "Huawei Cloud integration"
        ],
        limitations: [
            "Requires ML knowledge",
            "Can be complex for beginners"
        ]
    },


    // =====================================================
    // TENCENT CLOUD
    // =====================================================

    "tencent:Cloud Virtual Machine": {
        description:
            "Cloud Virtual Machine provides configurable compute infrastructure on Tencent Cloud.",
        bestFor:
            "Applications requiring traditional virtual machine hosting.",
        advantages: [
            "Flexible compute",
            "Scalable",
            "Strong regional infrastructure"
        ],
        limitations: [
            "Requires VM management",
            "Regional service differences"
        ]
    },

    "tencent:CloudBase": {
        description:
            "CloudBase provides managed backend and serverless application capabilities.",
        bestFor:
            "Web and mobile applications that need simple backend services.",
        advantages: [
            "Developer friendly",
            "Serverless capabilities",
            "Simplifies backend deployment"
        ],
        limitations: [
            "Less control than traditional infrastructure",
            "Best suited to supported application architectures"
        ]
    },

    "tencent:Tencent Kubernetes Engine": {
        description:
            "Tencent Kubernetes Engine provides managed Kubernetes clusters.",
        bestFor:
            "Containerized applications requiring Kubernetes.",
        advantages: [
            "Managed Kubernetes",
            "Scalable",
            "Strong Tencent integration"
        ],
        limitations: [
            "Kubernetes complexity",
            "May be unnecessary for small projects"
        ]
    },

    "tencent:Cloud Object Storage": {
        description:
            "Cloud Object Storage provides scalable object storage for application data and files.",
        bestFor:
            "Images, videos, documents, backups and large datasets.",
        advantages: [
            "Scalable",
            "Suitable for large files",
            "Strong Tencent integration"
        ],
        limitations: [
            "Object-storage model",
            "Usage affects cost"
        ]
    },

    "tencent:TencentDB for MySQL": {
        description:
            "TencentDB for MySQL is a managed MySQL database service.",
        bestFor:
            "Web applications and services using MySQL.",
        advantages: [
            "Managed MySQL",
            "Simplifies database administration",
            "Scalable"
        ],
        limitations: [
            "Designed around MySQL",
            "Database knowledge still required"
        ]
    },

    "tencent:TDSQL": {
        description:
            "TDSQL provides distributed database capabilities for scalable application workloads.",
        bestFor:
            "Large-scale database applications.",
        advantages: [
            "Distributed architecture",
            "Scalable",
            "Enterprise capabilities"
        ],
        limitations: [
            "More complex than basic databases",
            "Best suited to larger workloads"
        ]
    },

    "tencent:Tencent Cloud AI": {
        description:
            "Tencent Cloud AI provides AI and machine learning capabilities for applications.",
        bestFor:
            "Applications requiring managed AI capabilities.",
        advantages: [
            "Managed AI services",
            "Tencent ecosystem integration",
            "Multiple AI capabilities"
        ],
        limitations: [
            "Service availability varies",
            "AI usage can increase costs"
        ]
    },


    // =====================================================
    // VULTR
    // =====================================================

    "vultr:Vultr Cloud Compute": {
        description:
            "Vultr Cloud Compute provides straightforward virtual machines across multiple geographic locations.",
        bestFor:
            "Websites, APIs, development environments and small applications.",
        advantages: [
            "Simple deployment",
            "Developer friendly",
            "Multiple locations",
            "Competitive pricing"
        ],
        limitations: [
            "Smaller managed-service ecosystem",
            "Less enterprise focused"
        ]
    },

    "vultr:Vultr Kubernetes Engine": {
        description:
            "Vultr Kubernetes Engine provides managed Kubernetes infrastructure.",
        bestFor:
            "Containerized applications requiring Kubernetes.",
        advantages: [
            "Managed Kubernetes",
            "Simple cloud integration",
            "Scalable"
        ],
        limitations: [
            "Kubernetes knowledge required",
            "Less extensive ecosystem than hyperscalers"
        ]
    },

    "vultr:Vultr Block Storage": {
        description:
            "Vultr Block Storage provides persistent storage volumes for cloud compute instances.",
        bestFor:
            "Applications requiring persistent disk storage.",
        advantages: [
            "Persistent storage",
            "Easy compute integration",
            "Simple management"
        ],
        limitations: [
            "Primarily infrastructure focused",
            "Performance depends on selected configuration"
        ]
    },

    "vultr:Vultr Object Storage": {
        description:
            "Vultr Object Storage provides scalable storage for files and application assets.",
        bestFor:
            "Images, backups and application files.",
        advantages: [
            "Simple object storage",
            "Developer friendly",
            "Easy integration"
        ],
        limitations: [
            "Fewer advanced features than hyperscalers"
        ]
    },

    "vultr:Vultr Managed Databases": {
        description:
            "Vultr Managed Databases provides managed database infrastructure.",
        bestFor:
            "Applications requiring a simple managed database.",
        advantages: [
            "Easy setup",
            "Managed infrastructure",
            "Developer friendly"
        ],
        limitations: [
            "Smaller database ecosystem",
            "Fewer enterprise capabilities"
        ]
    },

    "vultr:Vultr GPU": {
        description:
            "Vultr GPU provides GPU-powered infrastructure for AI and high-performance workloads.",
        bestFor:
            "AI experimentation, inference and GPU workloads.",
        advantages: [
            "GPU availability",
            "Developer friendly",
            "Useful for AI workloads"
        ],
        limitations: [
            "GPU costs can be significant",
            "Smaller AI ecosystem than major hyperscalers"
        ]
    },


    // =====================================================
    // HETZNER
    // =====================================================

    "hetzner:Hetzner Cloud Servers": {
        description:
            "Hetzner Cloud Servers provide simple and cost-effective virtual machines.",
        bestFor:
            "Websites, APIs, development projects and cost-sensitive applications.",
        advantages: [
            "Very competitive pricing",
            "Strong compute value",
            "Simple infrastructure",
            "Developer friendly"
        ],
        limitations: [
            "Smaller global footprint",
            "Fewer managed services"
        ]
    },

    "hetzner:Hetzner Cloud Kubernetes": {
        description:
            "Hetzner Cloud Kubernetes provides Kubernetes capabilities for containerized workloads.",
        bestFor:
            "Developers who need Kubernetes infrastructure at relatively low infrastructure cost.",
        advantages: [
            "Cost effective",
            "Container support",
            "Simple infrastructure"
        ],
        limitations: [
            "Kubernetes complexity",
            "Smaller ecosystem"
        ]
    },

    "hetzner:Hetzner Volumes": {
        description:
            "Hetzner Volumes provide persistent block storage for cloud servers.",
        bestFor:
            "Applications requiring additional persistent disk capacity.",
        advantages: [
            "Simple storage",
            "Cost effective",
            "Direct server integration"
        ],
        limitations: [
            "Primarily infrastructure focused"
        ]
    },

    "hetzner:Hetzner Object Storage": {
        description:
            "Hetzner Object Storage provides object storage for files and application data.",
        bestFor:
            "Backups, files and application assets.",
        advantages: [
            "Cost effective",
            "Simple object storage",
            "Developer friendly"
        ],
        limitations: [
            "Smaller feature ecosystem"
        ]
    },

    "hetzner:Managed Databases": {
        description:
            "Managed Databases provides managed database infrastructure for applications.",
        bestFor:
            "Applications requiring database hosting without managing database servers directly.",
        advantages: [
            "Simplified administration",
            "Developer friendly",
            "Cost focused"
        ],
        limitations: [
            "Smaller database ecosystem",
            "Fewer advanced enterprise capabilities"
        ]
    },

    "hetzner:GPU Servers": {
        description:
            "GPU Servers provide GPU-enabled infrastructure for computational workloads.",
        bestFor:
            "AI experimentation and GPU-intensive workloads.",
        advantages: [
            "GPU computing",
            "Strong price-to-performance potential",
            "Simple infrastructure"
        ],
        limitations: [
            "Less extensive AI platform ecosystem",
            "GPU availability can vary"
        ]
    },


    // =====================================================
    // OVHCLOUD
    // =====================================================

    "ovhcloud:OVHcloud Public Cloud": {
        description:
            "OVHcloud Public Cloud provides scalable virtual compute infrastructure.",
        bestFor:
            "Applications requiring configurable cloud compute, especially in European regions.",
        advantages: [
            "Competitive infrastructure",
            "Strong European presence",
            "Multiple compute options"
        ],
        limitations: [
            "Smaller ecosystem than hyperscalers",
            "Some services require more technical knowledge"
        ]
    },

    "ovhcloud:Managed Kubernetes Service": {
        description:
            "OVHcloud Managed Kubernetes Service provides managed Kubernetes clusters.",
        bestFor:
            "Containerized applications requiring Kubernetes.",
        advantages: [
            "Managed Kubernetes",
            "European infrastructure",
            "Scalable"
        ],
        limitations: [
            "Kubernetes learning curve",
            "Can be excessive for small applications"
        ]
    },

    "ovhcloud:Object Storage": {
        description:
            "OVHcloud Object Storage provides scalable object storage for files and application data.",
        bestFor:
            "Backups, media, documents and application assets.",
        advantages: [
            "Scalable",
            "Competitive infrastructure",
            "European availability"
        ],
        limitations: [
            "Object-storage model",
            "Features vary by region"
        ]
    },

    "ovhcloud:Block Storage": {
        description:
            "OVHcloud Block Storage provides persistent storage volumes for compute workloads.",
        bestFor:
            "Applications requiring persistent disk storage.",
        advantages: [
            "Persistent storage",
            "Compute integration",
            "Multiple performance options"
        ],
        limitations: [
            "Requires storage planning",
            "Primarily infrastructure focused"
        ]
    },

    "ovhcloud:Managed Databases": {
        description:
            "OVHcloud Managed Databases provides managed database infrastructure.",
        bestFor:
            "Applications requiring managed databases without maintaining database servers.",
        advantages: [
            "Managed administration",
            "European infrastructure",
            "Simplified deployment"
        ],
        limitations: [
            "Smaller ecosystem than hyperscalers"
        ]
    },

    "ovhcloud:AI Endpoints": {
        description:
            "AI Endpoints provides managed access to AI capabilities through APIs.",
        bestFor:
            "Applications that need AI functionality without building complete ML infrastructure.",
        advantages: [
            "Simplifies AI integration",
            "API-based access",
            "Useful for application developers"
        ],
        limitations: [
            "Less control than custom model infrastructure",
            "Usage costs depend on AI requests"
        ]
    },

    "ovhcloud:GPU Instances": {
        description:
            "GPU Instances provide GPU-enabled cloud compute for AI and high-performance workloads.",
        bestFor:
            "Machine learning, AI inference and GPU-intensive workloads.",
        advantages: [
            "GPU infrastructure",
            "Useful for AI workloads",
            "European availability"
        ],
        limitations: [
            "GPU workloads can be expensive",
            "Requires GPU-aware software"
        ]
    },


    // =====================================================
    // CLOUDFLARE
    // =====================================================

    "cloudflare:Cloudflare Workers": {
        description:
            "Cloudflare Workers runs application code at Cloudflare's global edge network.",
        bestFor:
            "APIs, lightweight backend logic, edge applications and globally distributed workloads.",
        advantages: [
            "Very fast edge execution",
            "Global distribution",
            "Serverless architecture",
            "No traditional server management"
        ],
        limitations: [
            "Different programming and deployment model from traditional VMs",
            "Not ideal for every workload"
        ]
    },

    "cloudflare:Cloudflare Pages": {
        description:
            "Cloudflare Pages provides hosting and deployment for modern web applications.",
        bestFor:
            "Static websites and frontend applications.",
        advantages: [
            "Simple deployment",
            "Global edge delivery",
            "Developer friendly"
        ],
        limitations: [
            "Primarily focused on web applications",
            "Complex backend workloads may need other services"
        ]
    },

    "cloudflare:Durable Objects": {
        description:
            "Durable Objects provide stateful serverless objects running at the Cloudflare edge.",
        bestFor:
            "Applications requiring stateful coordination and low-latency edge logic.",
        advantages: [
            "Stateful edge computing",
            "Global distribution",
            "Serverless model"
        ],
        limitations: [
            "Specialized architecture",
            "Requires understanding of Cloudflare's model"
        ]
    },

    "cloudflare:Cloudflare R2": {
        description:
            "Cloudflare R2 provides object storage designed for application data and files.",
        bestFor:
            "Images, videos, backups and application assets.",
        advantages: [
            "Simple object storage",
            "Strong Cloudflare integration",
            "Useful for edge applications"
        ],
        limitations: [
            "Object-storage model",
            "Not a traditional filesystem"
        ]
    },

    "cloudflare:Workers KV": {
        description:
            "Workers KV provides globally distributed key-value storage for edge applications.",
        bestFor:
            "Configuration, cached data and simple key-value application data.",
        advantages: [
            "Global distribution",
            "Simple API",
            "Strong Workers integration"
        ],
        limitations: [
            "Not a traditional relational database",
            "Consistency characteristics differ from SQL databases"
        ]
    },

    "cloudflare:D1": {
        description:
            "D1 is Cloudflare's managed SQL database designed for applications running on Workers.",
        bestFor:
            "Applications requiring relational SQL data close to edge workloads.",
        advantages: [
            "SQL support",
            "Strong Workers integration",
            "Managed service"
        ],
        limitations: [
            "Different from large traditional database platforms",
            "Best suited to Cloudflare-based architectures"
        ]
    },

    "cloudflare:Hyperdrive": {
        description:
            "Hyperdrive provides optimized connectivity between Cloudflare Workers and existing databases.",
        bestFor:
            "Applications that need edge applications to access existing databases efficiently.",
        advantages: [
            "Improves database connectivity",
            "Works with Workers",
            "Useful for distributed applications"
        ],
        limitations: [
            "Not itself a traditional database",
            "Requires an existing database architecture"
        ]
    },

    "cloudflare:Workers AI": {
        description:
            "Workers AI provides AI model inference capabilities through Cloudflare's developer platform.",
        bestFor:
            "Adding AI inference to edge applications.",
        advantages: [
            "Easy AI integration",
            "Edge-oriented",
            "Strong Workers integration"
        ],
        limitations: [
            "Model selection differs from large AI platforms",
            "Not designed for every ML training workload"
        ]
    },

    "cloudflare:Vectorize": {
        description:
            "Vectorize provides vector database capabilities for AI and similarity-search applications.",
        bestFor:
            "AI applications using embeddings, semantic search and retrieval systems.",
        advantages: [
            "AI-focused vector storage",
            "Strong Workers integration",
            "Useful for RAG applications"
        ],
        limitations: [
            "Specialized database",
            "Not a replacement for general SQL databases"
        ]
    },


    // =====================================================
    // AKAMAI
    // =====================================================

    "akamai:Akamai Cloud Compute": {
        description:
            "Akamai Cloud Compute provides virtual compute infrastructure integrated with Akamai's distributed cloud.",
        bestFor:
            "Applications requiring distributed compute and edge-oriented infrastructure.",
        advantages: [
            "Distributed infrastructure",
            "Strong edge ecosystem",
            "Global application delivery"
        ],
        limitations: [
            "Less familiar to beginners",
            "Smaller general-purpose ecosystem"
        ]
    },

    "akamai:Akamai Edge Compute": {
        description:
            "Akamai Edge Compute enables application workloads to run closer to users at distributed edge locations.",
        bestFor:
            "Low-latency applications and globally distributed workloads.",
        advantages: [
            "Low latency",
            "Distributed edge infrastructure",
            "Strong global reach"
        ],
        limitations: [
            "Specialized architecture",
            "Not necessary for simple applications"
        ]
    },

    "akamai:Akamai Cloud Storage": {
        description:
            "Akamai Cloud Storage provides storage capabilities for distributed cloud applications.",
        bestFor:
            "Application data, files and edge-oriented workloads.",
        advantages: [
            "Distributed infrastructure",
            "Application integration",
            "Useful for edge workloads"
        ],
        limitations: [
            "Smaller ecosystem",
            "Less familiar to beginners"
        ]
    },

    "akamai:Managed Databases": {
        description:
            "Managed Databases provides managed database capabilities for cloud applications.",
        bestFor:
            "Applications requiring managed database infrastructure.",
        advantages: [
            "Reduced database administration",
            "Cloud integration",
            "Useful for application workloads"
        ],
        limitations: [
            "Smaller database ecosystem",
            "Less widely used than hyperscaler alternatives"
        ]
    },

    "akamai:GPU Cloud": {
        description:
            "GPU Cloud provides GPU-enabled infrastructure for AI and high-performance workloads.",
        bestFor:
            "AI inference, machine learning and GPU-intensive applications.",
        advantages: [
            "GPU infrastructure",
            "High-performance computing",
            "Distributed cloud capabilities"
        ],
        limitations: [
            "Specialized workload",
            "GPU resources can be expensive"
        ]
    },


    // =====================================================
    // COREWEAVE
    // =====================================================

    "coreweave:GPU Compute": {
        description:
            "CoreWeave GPU Compute provides GPU-accelerated cloud infrastructure optimized for AI and high-performance computing.",
        bestFor:
            "AI training, inference and GPU-intensive workloads.",
        advantages: [
            "Strong GPU infrastructure",
            "AI optimized",
            "High-performance computing"
        ],
        limitations: [
            "Specialized rather than general purpose",
            "GPU workloads can be expensive"
        ]
    },

    "coreweave:CPU Compute": {
        description:
            "CoreWeave CPU Compute provides general-purpose compute resources for supporting cloud workloads.",
        bestFor:
            "Applications that require traditional CPU-based infrastructure alongside AI workloads.",
        advantages: [
            "Flexible compute",
            "Works alongside GPU infrastructure",
            "Useful for supporting AI platforms"
        ],
        limitations: [
            "CoreWeave is primarily AI focused",
            "May not be the simplest option for basic websites"
        ]
    },

    "coreweave:Kubernetes": {
        description:
            "CoreWeave Kubernetes provides container orchestration for high-performance and AI workloads.",
        bestFor:
            "Containerized AI and high-performance applications.",
        advantages: [
            "Kubernetes support",
            "Strong GPU integration",
            "Scalable AI infrastructure"
        ],
        limitations: [
            "Requires Kubernetes knowledge",
            "More complex than simple application hosting"
        ]
    },

    "coreweave:Cloud Storage": {
        description:
            "CoreWeave Cloud Storage provides storage capabilities for cloud and AI workloads.",
        bestFor:
            "Datasets, model files and application data.",
        advantages: [
            "Useful for AI workloads",
            "Integrates with compute infrastructure",
            "Scalable storage"
        ],
        limitations: [
            "Primarily suited to specialized workloads"
        ]
    },

    "coreweave:Block Storage": {
        description:
            "CoreWeave Block Storage provides persistent storage for compute workloads.",
        bestFor:
            "Applications and AI workloads requiring persistent disks.",
        advantages: [
            "Persistent storage",
            "Compute integration",
            "Suitable for high-performance workloads"
        ],
        limitations: [
            "Requires storage planning"
        ]
    },

    "coreweave:Managed Database Options": {
        description:
            "Managed Database Options provide database infrastructure that can support applications running alongside CoreWeave workloads.",
        bestFor:
            "Applications requiring managed data storage alongside compute workloads.",
        advantages: [
            "Reduced database administration",
            "Supports application architectures"
        ],
        limitations: [
            "CoreWeave's main specialization is compute and AI",
            "General database requirements may be better served elsewhere"
        ]
    },

    "coreweave:GPU Cloud": {
        description:
            "GPU Cloud provides specialized GPU infrastructure for artificial intelligence and high-performance computing.",
        bestFor:
            "AI training, inference, large models and GPU-heavy applications.",
        advantages: [
            "Highly optimized GPU infrastructure",
            "AI focused",
            "High-performance computing"
        ],
        limitations: [
            "Not intended for basic application hosting",
            "GPU infrastructure can be costly"
        ]
    },

    "coreweave:AI Infrastructure": {
        description:
            "AI Infrastructure provides cloud resources and services designed specifically for machine learning and artificial intelligence workloads.",
        bestFor:
            "Organizations building or operating large AI workloads.",
        advantages: [
            "AI optimized",
            "GPU focused",
            "Designed for large-scale workloads"
        ],
        limitations: [
            "Requires AI infrastructure knowledge",
            "Overkill for simple applications"
        ]
    }

};


// =========================================================
// HELPER FUNCTIONS
// =========================================================

function getServiceDetails(providerId, serviceName) {

    return serviceData[
        `${providerId}:${serviceName}`
    ];

}


function getAllServiceData() {

    return serviceData;

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {
    serviceData,
    getServiceDetails,
    getAllServiceData
};