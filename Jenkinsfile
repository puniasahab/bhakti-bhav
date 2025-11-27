pipeline {
    agent any

    environment {
        PROD_USER = "jenkins"
        PROD_HOST = "195.154.184.2"
        PROD_PORT = "20238"
        DEPLOY_DIR = "/var/www/bhakti-bhav"
        SSH_KEY = "/var/lib/jenkins/.ssh/id_ed25519"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "Pulling code from GitHub..."
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'git@github.com:puniasahab/bhakti-bhav.git'
                    ]]
                ])
            }
        }

        /* --------------------------------------------------- */

        stage('Install & Build Next.js') {
            steps {
                echo "Installing dependencies..."

                echo "Building Next.js project..."
                sh 'CI=false npm run build'
            }
        }


        stage('Deploy Build to Server') {
            steps {
                echo "Deploying build to production server..."
                sh """
                    rsync -az --delete -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" build ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/
                """
            }
        }

    }
}
