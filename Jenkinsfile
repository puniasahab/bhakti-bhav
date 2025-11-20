pipeline {
    agent any
    
    parameters {
        string(
            name: 'SSH_KEY_PATH',
            defaultValue: '/var/lib/jenkins/.ssh/id_ed25519',
            description: 'Path to SSH private key for server access (default: /var/lib/jenkins/.ssh/id_ed25519)'
        )
        string(
            name: 'GAMESTONE_SERVER',
            defaultValue: '195.154.184.2',
            description: 'Gamestone server IP address or hostname'
        )
        string(
            name: 'GAMESTONE_USER',
            defaultValue: 'jenkins',
            description: 'SSH username for gamestone server'
        )
    }
    
    environment {
        GAMESTONE_SERVER = "${params.GAMESTONE_SERVER}"
        GAMESTONE_USER = "${params.GAMESTONE_USER}"
        GAMESTONE_PATH = '/var/www/bhakti-bhav'
        SSH_KEY = "${params.SSH_KEY_PATH ?: '/var/lib/jenkins/.ssh/id_ed25519'}"
        ENV_FILE = '/var/lib/jenkins/.env/bhakti-bhav.env'
        PM2_APP_NAME = 'bhakti-bhav'
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    def selectedBranch = 'main'.replaceFirst('^origin/', '')
                    echo "Deploying branch: ${selectedBranch}"
                    
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/${selectedBranch}"]],
                        userRemoteConfigs: [[
                            url: 'https://github.com/puniasahab/bhakti-bhav.git',
                            credentialsId: 'github-gameofstones'
                        ]]
                    ])
                    
                    sh """
                        git checkout ${selectedBranch}
                        git reset --hard origin/${selectedBranch}
                        git clean -fd
                    """
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci || npm install'
            }
        }
        
        stage('Build Application') {
            steps {
                sh """
                    export NODE_ENV=production
                    npm run build
                """
            }
        }
        
        stage('Deploy to Server') {
            steps {
                sh "rsync -avz --delete --exclude='node_modules' --exclude='.git' --exclude='.env' -e 'ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no -o BatchMode=yes' ./ ${GAMESTONE_USER}@${GAMESTONE_SERVER}:${GAMESTONE_PATH}/"
            }
        }
        
        stage('Upload Environment File') {
            steps {
                sh """
                    scp -i ${SSH_KEY} -o StrictHostKeyChecking=no -o BatchMode=yes ${ENV_FILE} ${GAMESTONE_USER}@${GAMESTONE_SERVER}:${GAMESTONE_PATH}/.env || {
                        echo "⚠️  Warning: .env file not found or upload failed"
                        echo "⚠️  Continuing deployment - .env may need manual setup"
                    }
                """
            }
        }
        
        stage('Install Dependencies on Server') {
            steps {
                sh """
                    ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no -o BatchMode=yes ${GAMESTONE_USER}@${GAMESTONE_SERVER} '
                        cd ${GAMESTONE_PATH}
                        npm ci --production || npm install --production
                    '
                """
            }
        }
        

    }
    
    post {
        success {
            echo "Deployment completed successfully!"
            echo "Server: ${GAMESTONE_USER}@${GAMESTONE_SERVER}"
            echo "Path: ${GAMESTONE_PATH}"
            echo "PM2 App: ${PM2_APP_NAME}"
        }
        failure {
            echo "Deployment failed! Please check the logs."
        }
    }
}
