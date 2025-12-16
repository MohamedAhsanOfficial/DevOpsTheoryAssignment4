# DevOps Lab Project: Collage ERP Automation

**Student Name:** Mohamed Ahsan 
**Roll Number:** FA22-BCT-001
**Subject:** DevOps Lab Project
**Submission Date:** 16-12-25

---

## 1. Project Implementation Report
This report documents the step-by-step process followed to automate the CI/CD pipeline for the "Collage ERP" application using Jenkins, Docker, Kubernetes, Prometheus, and Grafana.

### Step 1: Web Application Development
I developed a simple Node.js web application for a College ERP system.
-   **Framework**: Express.js
-   **Database**: SQLite (for data persistence)
-   **Frontend**: EJS templates
-   **Observability**: Integrated `prom-client` to expose metrics for Prometheus monitoring.

### Step 2: Containerization with Docker
I containerized the application to ensure consistency across environments.
-   Created a `Dockerfile` based on `node:18-alpine`.
-   Created a `.dockerignore` file to exclude local `node_modules` (Windows binaries) to prevent "Exec format errors" in the Linux container.
-   Verified the build locally.

### Step 3: Kubernetes Configuration
I created a set of Kubernetes manifests to deploy the application on Minikube.
-   **`pvc.yaml`**: Configured a Persistent Volume Claim to ensure database records are saved even if pods restart.
-   **`deployment.yaml`**: Defined the application deployment with volume mounts for the database.
-   **`service.yaml`**: Exposed the application on NodePort 30007.

### Step 4: Jenkins CI/CD Pipeline
I configured a strict Jenkins pipeline to automate the workflow.
-   **Code Fetch**: Jenkins pulls the latest code from GitHub.
-   **Build**: Jenkins builds the Docker image and tags it.
-   **Push**: the image is pushed to Docker Hub (`mohamedahsan00/collage-erp`).
-   **Deploy**: Jenkins applies the Kubernetes manifests to the cluster and updates the deployment.
-   **Credentials**: Configured DockerHub and Kubeconfig credentials securely in Jenkins.

### Step 5: Monitoring Setup
I deployed a monitoring stack to observe the application.
-   **Prometheus**: Configured to scrape metrics from the application service.
-   **Grafana**: Deployed to visualize the data collected by Prometheus.

---

## 2. Configuration & Screenshots

### Setup Dockerhub credentials on jenkins
*(Paste screenshot of Jenkins Credentials page showing DockerHub entry)*
![Dockerhub Credentials](path/to/screenshot)

### Setup kubeconfig-credentials file on Jenkins credentials
*(Paste screenshot of Jenkins Credentials page showing Secret File entry for kubeconfig)*
![Kubeconfig Credentials](path/to/screenshot)

### Starting minikube
*(Paste screenshot of terminal running `minikube start`)*
![Minikube Start](path/to/screenshot)

### Running pods
*(Paste screenshot of `kubectl get pods` showing running status)*
![Running Pods](path/to/screenshot)

### Port forwarding
*(Paste screenshot of the background port-forward commands)*
![Port Forwarding](path/to/screenshot)

### Jenkins pipeline output
*(Paste screenshot of the successful Jenkins Stage View)*
![Jenkins Output](path/to/screenshot)

### Jenkins Configuration (Source Code)
**Jenkinsfile:**
```groovy
pipeline {
    agent any

    environment {
        // Local image name (Using project specific name)
        IMAGE_NAME = "collage-erp"

        // Docker Hub registry components
        DOCKERHUB_REGISTRY = "docker.io"
        DOCKERHUB_NAMESPACE = "mohamedahsan00"
        DOCKERHUB_IMAGE = "collage-erp"
        DOCKERHUB_TAG = "latest"

        // Credentials IDs
        DOCKERHUB_CREDENTIALS_ID = "user1"
        KUBECONFIG_CREDENTIALS_ID = "kubeconfig-credentials"
    }

    stages {
        stage('Code Fetch') {
            steps {
                git branch: 'main', url: 'https://github.com/MohamedAhsanOfficial/Collage_ERP.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build with the full registry tag
                    sh "docker build -t ${DOCKERHUB_REGISTRY}/${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}:${DOCKERHUB_TAG} ."
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} ${DOCKERHUB_REGISTRY}"
                        sh "docker push ${DOCKERHUB_REGISTRY}/${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}:${DOCKERHUB_TAG}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: env.KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    sh 'kubectl apply -f k8s/pvc.yaml'
                    sh 'kubectl apply -f k8s/deployment.yaml'
                    sh 'kubectl apply -f k8s/service.yaml'
                    // Apply Monitoring
                    sh 'kubectl apply -f monitoring/'
                    
                    // Restart deployment to pick up new image (since tag is 'latest')
                    sh "kubectl rollout restart deployment/collage-erp-deployment"
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
```

### Web application
*(Paste screenshot of the Collage ERP website running)*
![Web Application](path/to/screenshot)

### Prometheus
*(Paste screenshot of Prometheus Targets or Graph)*
![Prometheus](path/to/screenshot)

### Grafana
*(Paste screenshot of Grafana Dashboard)*
![Grafana](path/to/screenshot)
