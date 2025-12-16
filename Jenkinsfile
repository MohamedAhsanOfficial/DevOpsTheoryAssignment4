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
                // Assuming the repo follows the user's namespace convention or is the one we are in
                // Please stick to the simpler checkout scm or specify the exact repo URL if different
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
