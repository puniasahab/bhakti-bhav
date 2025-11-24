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
        /*   DEBUG STAGES — Immediately After Git Checkout     */
        /* --------------------------------------------------- */

        stage('Debug User') {
            steps {
                sh 'whoami'
                sh 'pwd'
                sh 'ls -la'
            }
        }

        stage('Debug Node') {
            steps {
                sh 'which node'
                sh 'node -v'
                sh 'which npm'
                sh 'npm -v'
            }
        }

        stage('Debug Path') {
            steps {
                sh 'echo $PATH'
            }
        }

        /* --------------------------------------------------- */

        stage('Install & Build Next.js') {
            steps {
                echo "Installing dependencies..."
                sh 'npm install'

                echo "Building Next.js project..."
                sh 'npm run build'
            }
        }

        stage('Upload .env file to Server') {
            steps {
                echo "Uploading ENV file..."
                sh """
                    ssh -i ${SSH_KEY} -p ${PROD_PORT} ${PROD_USER}@${PROD_HOST} 'mkdir -p ${DEPLOY_DIR}'
                    ssh -i ${SSH_KEY} -p ${PROD_PORT} ${PROD_USER}@${PROD_HOST} 'echo "NEXT_PUBLIC_API_URL=https://example.com/api" > ${DEPLOY_DIR}/.env'
                """
            }
        }

        stage('Deploy Build to Server') {
            steps {
                echo "Deploying build to production server..."
                sh """
                    rsync -az --delete -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" .next ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/
                    rsync -az --delete -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" public ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/
                    rsync -az --delete -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" package.json ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/
                """
            }
        }

        stage('Install Production Node Modules (Server)') {
            steps {
                echo "Installing production node modules..."
                sh """
                    ssh -i ${SSH_KEY} -p ${PROD_PORT} ${PROD_USER}@${PROD_HOST} '
                        cd ${DEPLOY_DIR} &&
                        npm install --omit=dev
                    '
                """
            }
        }
    }
}
