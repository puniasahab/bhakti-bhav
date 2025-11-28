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

        /* --------------------------------------------------- */
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
                sh 'npm install'
                echo "Building Next.js project..."
                sh 'CI=false npm run build'
            }
        }

        /* --------------------------------------------------- */
        stage('Deploy Project to Server') {
            steps {
                echo "Deploying full project to production server..."
                sh """
                    # Sync all files except node_modules and .env
                    rsync -az --times --delete --exclude 'node_modules' --exclude '.env' -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" ./ ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/

                    # Sync dist/ folder if it exists
                    if [ -d "dist" ]; then
                        rsync -az --times -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" dist/ ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/dist/
                    fi
                """
            }
        }

        /* --------------------------------------------------- */
        stage('Set Permissions on Server') {
            steps {
                echo "Setting correct permissions on production server..."
                sh """
                    ssh -i ${SSH_KEY} -p ${PROD_PORT} ${PROD_USER}@${PROD_HOST} "\
                        echo 'Changing owner to jenkins:www-data'; \
                        sudo chown -R jenkins:www-data ${DEPLOY_DIR}; \
                        echo 'Setting directory permissions to 775'; \
                        sudo find ${DEPLOY_DIR} -type d -exec chmod 775 {} \\\\; ; \
                        echo 'Setting file permissions to 664'; \
                        sudo find ${DEPLOY_DIR} -type f -exec chmod 664 {} \\\\; ; \
                        echo 'Permissions updated!'; \
                    "
                """
            }
        }
    }
}
