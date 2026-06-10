"""
Structured skill rubrics with concepts organized by difficulty level.
"""
from typing import Dict, List, Any

SKILL_RUBRICS: Dict[str, Dict[str, Any]] = {
    "python": {
        "category": "backend",
        "beginner": [
            "variables", "data types", "strings", "lists", "dictionaries",
            "tuples", "conditionals", "loops", "functions", "scope",
            "input/output", "file handling", "exception handling", "modules",
            "basic debugging",
        ],
        "intermediate": [
            "list comprehensions", "generators", "decorators", "context managers",
            "lambda functions", "map/filter/reduce", "magic methods",
            "inheritance", "polymorphism", "encapsulation", "abstract classes",
            "duck typing", "packages", "pip", "virtual environments",
            "unit testing", "pytest", "logging",
        ],
        "advanced": [
            "metaclasses", "descriptors", "coroutines", "asyncio", "async/await",
            "event loop", "GIL", "multiprocessing", "threading", "C extensions",
            "memory management", "garbage collection", "weak references",
            "design patterns", "singleton", "factory", "observer",
            "type hints", "mypy", "performance optimization", "profiling",
        ],
        "scenario": [
            "design a REST API", "implement a caching layer",
            "build a data pipeline", "optimize slow queries",
            "design a plugin system", "implement a task queue",
            "database migration strategy", "API rate limiting",
        ],
    },
    ".net": {
        "category": "backend",
        "beginner": [
            "value types", "reference types", "strings", "arrays", "collections",
            "conditionals", "loops", "methods", "properties", "constructors",
            "structs", "enums", "exception handling", "namespaces",
            "basic debugging", "Visual Studio",
        ],
        "intermediate": [
            "classes", "inheritance", "polymorphism", "interfaces",
            "abstract classes", "generics", "extension methods",
            "LINQ", "delegates", "events", "async/await", "Task Parallel Library",
            "dependency injection", "middleware", "routing", "MVC pattern",
            "Entity Framework", "RESTful services", "Web API",
        ],
        "advanced": [
            "CLR internals", "garbage collection", "JIT compilation",
            "reflection", "emitting IL", "expression trees",
            "custom attributes", "threading", "memory barriers",
            "design patterns", "CQRS", "Event Sourcing", "microservices",
            "SignalR", "gRPC", "Blazor", "MAUI",
        ],
        "scenario": [
            "design an ASP.NET Core API", "implement distributed caching",
            "build real-time notifications", "database sharding strategy",
            "implement background jobs", "secure an API with JWT",
        ],
        "topics": {
            "csharp_fundamentals": ["value types vs reference types", "struct vs class", "nullable types", "pattern matching"],
            "oop": ["inheritance", "polymorphism", "interfaces vs abstract classes", "SOLID principles"],
            "generics": ["generic constraints", "covariance/contravariance", "generic methods"],
            "linq": ["query syntax vs method syntax", "deferred execution", "IQueryable vs IEnumerable"],
            "async_await": ["Task vs ValueTask", "ConfigureAwait", "parallel vs sequential", "cancellation tokens"],
            "dependency_injection": ["service lifetimes", "scoped vs transient", "factory pattern", "IServiceProvider"],
            "entity_framework": ["DbContext", "migrations", "change tracking", "query optimization", "raw SQL"],
            "aspnet_core": ["middleware pipeline", "filters", "model binding", "validation", "rate limiting"],
            "threading": ["Thread vs Task", "Parallel.ForEach", "SemaphoreSlim", "lock vs Monitor"],
            "memory": ["GC generations", "IDisposable", "weak references", "stackalloc", "Span<T>"],
            "design_patterns": ["repository", "unit of work", "mediator", "factory", "strategy"],
            "microservices": ["API gateway", "service discovery", "circuit breaker", "distributed tracing"],
        },
    },
    "ai/ml": {
        "category": "data_science",
        "beginner": [
            "supervised learning", "unsupervised learning", "regression",
            "classification", "overfitting", "underfitting", "train/test split",
            "accuracy", "precision", "recall", "confusion matrix",
            "data preprocessing", "feature scaling", "pip install",
        ],
        "intermediate": [
            "decision trees", "random forests", "SVM", "k-means",
            "PCA", "feature engineering", "cross-validation",
            "hyperparameter tuning", "gradient descent", "loss functions",
            "regularization", "L1/L2", "ensemble methods", "bagging", "boosting",
            "XGBoost", "LightGBM", "imbalanced datasets", "SMOTE",
        ],
        "advanced": [
            "neural networks", "deep learning", "CNNs", "RNNs", "LSTMs",
            "transformers", "attention mechanism", "BERT", "GPT",
            "transfer learning", "fine-tuning", "RLHF", "PEFT", "LoRA",
            "GANs", "VAEs", "model deployment", "ONNX", "Triton",
            "distributed training", "mixed precision", "MLOps",
        ],
        "scenario": [
            "build an ML pipeline", "deploy model to production",
            "handle data drift", "A/B test ML models",
            "build a recommendation system", "implement RAG pipeline",
        ],
    },
    "sql": {
        "category": "databases",
        "beginner": [
            "SELECT", "INSERT", "UPDATE", "DELETE", "WHERE", "ORDER BY",
            "GROUP BY", "HAVING", "JOIN", "INNER JOIN", "LEFT JOIN",
            "aggregate functions", "COUNT", "SUM", "AVG", "MIN", "MAX",
            "LIKE", "IN", "BETWEEN", "IS NULL", "DISTINCT",
        ],
        "intermediate": [
            "subqueries", "correlated subqueries", "CTE", "window functions",
            "ROW_NUMBER", "RANK", "LAG", "LEAD", "indexes",
            "clustered index", "non-clustered index", "views",
            "stored procedures", "functions", "transactions", "ACID",
            "normalization", "1NF", "2NF", "3NF", "foreign keys",
        ],
        "advanced": [
            "query optimization", "execution plan analysis", "index tuning",
            "partitioning", "sharding", "replication", "CDC",
            "full-text search", "triggers", "materialized views",
            "locking", "deadlocks", "isolation levels", "concurrency control",
            "backup strategies", "point-in-time recovery",
        ],
        "scenario": [
            "optimize slow query", "design database schema",
            "migrate database with zero downtime", "implement audit logging",
            "design for millions of records",
        ],
        "topics": {
            "querying": ["JOIN types", "subqueries vs CTE", "window functions", "pivot/unpivot"],
            "indexing": ["clustered vs non-clustered", "covering indexes", "filtered indexes", "index maintenance"],
            "transactions": ["ACID", "isolation levels", "deadlocks", "optimistic vs pessimistic locking"],
            "performance": ["execution plans", "statistics", "parameter sniffing", "query store"],
            "design": ["normalization", "denormalization", "partitioning", "temporal tables"],
            "advanced": ["CDC", "replication", "Always On", "columnstore indexes"],
        },
    },
    "frontend": {
        "category": "frontend",
        "beginner": [
            "HTML", "CSS", "JavaScript", "DOM manipulation", "events",
            "forms", "responsive design", "flexbox", "grid",
            "CSS selectors", "box model", "positioning",
        ],
        "intermediate": [
            "React", "Vue", "Angular", "components", "props", "state",
            "hooks", "lifecycle", "context API", "Redux", "routing",
            "HTTP clients", "REST API integration", "async JavaScript",
            "promises", "async/await", "fetch API", "Axios",
            "state management", "unit testing", "Jest",
        ],
        "advanced": [
            "performance optimization", "lazy loading", "code splitting",
            "SSR", "Next.js", "Nuxt.js", "webpack", "Vite",
            "custom hooks", "higher-order components", "render props",
            "TypeScript", "advanced types", "generics",
            "PWA", "service workers", "WebSockets", "Web Workers",
            "accessibility", "WCAG", "security", "XSS", "CSRF",
        ],
        "scenario": [
            "optimize React app performance", "design component library",
            "implement real-time features", "migrate from class to hooks",
            "build a design system",
        ],
    },
    "devops": {
        "category": "devops",
        "beginner": [
            "Linux basics", "command line", "file permissions", "process management",
            "SSH", "git", "basic shell scripting", "cron jobs",
        ],
        "intermediate": [
            "Docker", "Dockerfile", "docker-compose", "container networking",
            "CI/CD pipelines", "Jenkins", "GitHub Actions", "GitLab CI",
            "YAML", "configuration management", "Ansible",
            "monitoring", "Prometheus", "Grafana", "logging", "ELK stack",
        ],
        "advanced": [
            "Kubernetes", "pods", "services", "deployments", "ingress",
            "Helm charts", "service mesh", "Istio", "Kustomize",
            "infrastructure as code", "Terraform", "Pulumi",
            "zero-downtime deployment", "canary releases", "blue-green",
            "chaos engineering", "SLOs", "SLIs", "error budgets",
        ],
        "scenario": [
            "design CI/CD pipeline", "migrate to Kubernetes",
            "implement monitoring strategy", "disaster recovery plan",
            "scale infrastructure for traffic spike",
        ],
    },
    "cloud": {
        "category": "infrastructure",
        "beginner": [
            "cloud computing basics", "IaaS", "PaaS", "SaaS", "regions",
            "availability zones", "virtual machines", "storage accounts",
        ],
        "intermediate": [
            "AWS EC2", "S3", "RDS", "Lambda", "API Gateway", "VPC",
            "Azure VMs", "Blob Storage", "Azure Functions", "App Service",
            "GCP Compute Engine", "Cloud Storage", "Cloud Functions",
            "auto-scaling", "load balancing", "security groups",
            "IAM", "roles", "policies", "managed identities",
        ],
        "advanced": [
            "AWS EKS", "ECS", "Fargate", "Step Functions", "EventBridge",
            "Azure Kubernetes Service", "AKS", "Azure DevOps",
            "GCP GKE", "Cloud Run", "Pub/Sub", "Dataflow",
            "multi-cloud strategy", "cloud cost optimization",
            "cloud security", "encryption at rest/transit", "KMS",
            "serverless architectures", "event-driven design",
        ],
        "scenario": [
            "design cloud architecture", "migrate on-prem to cloud",
            "implement cost optimization", "design for high availability",
            "implement disaster recovery across regions",
        ],
    },
    "data_science": {
        "category": "data",
        "beginner": [
            "data analysis", "descriptive statistics", "data visualization",
            "pandas", "matplotlib", "seaborn", "Jupyter notebooks",
            "data cleaning", "missing values", "outliers",
        ],
        "intermediate": [
            "hypothesis testing", "A/B testing", "statistical significance",
            "correlation", "causation", "Bayesian statistics",
            "time series analysis", "ARIMA", "exponential smoothing",
            "feature selection", "dimensionality reduction",
            "SQL for data analysis", "ETL pipelines", "data warehousing",
        ],
        "advanced": [
            "experimental design", "power analysis", "sample size calculation",
            "causal inference", "instrumental variables", "DAGs",
            "large-scale data processing", "Spark", "Dask",
            "streaming data", "Kafka", "real-time analytics",
            "data governance", "data catalog", "data lineage",
        ],
        "scenario": [
            "design A/B test", "build data pipeline from scratch",
            "analyze user behavior data", "forecast business metrics",
        ],
        "topics": {
            "statistics": ["hypothesis testing", "confidence intervals", "p-values", "effect size"],
            "ml_basics": ["bias-variance tradeoff", "cross-validation", "regularization", "feature importance"],
            "time_series": ["ARIMA", "seasonality", "stationarity", "forecasting evaluation"],
            "data_engineering": ["ETL vs ELT", "data quality", "schema evolution", "data lineage"],
            "experimentation": ["A/B testing", "power analysis", "sample size", "sequential testing"],
            "causal": ["DAGs", "instrumental variables", "propensity scoring", "difference-in-differences"],
        },
    },
}


def get_skill_rubric(skill_name: str) -> Dict[str, Any]:
    skill_lower = skill_name.lower()
    for key, rubric in SKILL_RUBRICS.items():
        if key in skill_lower or skill_lower in key:
            return rubric
    return {
        "category": "general",
        "beginner": ["basic concepts", "terminology", "fundamentals"],
        "intermediate": ["practical application", "common tools", "best practices"],
        "advanced": ["architecture", "optimization", "design patterns"],
        "scenario": ["real-world application", "problem solving"],
    }


def get_concept_score(answer_text: str, skill: str, level: str = "intermediate") -> Dict[str, Any]:
    rubric = get_skill_rubric(skill)
    concepts = rubric.get(level, [])
    answer_lower = answer_text.lower()
    matched = []
    missing = []
    for concept in concepts:
        if concept.lower() in answer_lower:
            matched.append(concept)
        else:
            missing.append(concept)
    coverage = (len(matched) / max(len(concepts), 1)) * 100
    depth = 0.0
    for m in matched:
        words = len(m.split())
        depth += min(words / 5, 1.0)
    depth_score = (depth / max(len(matched), 1)) * 100 if matched else 0
    knowledge_score = (coverage * 0.6 + depth_score * 0.4)
    return {
        "matched_concepts": matched,
        "missing_concepts": missing,
        "concept_coverage": round(coverage, 1),
        "concept_depth": round(depth_score, 1),
        "knowledge_score": round(knowledge_score, 1),
    }
