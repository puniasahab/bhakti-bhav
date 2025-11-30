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
                    # Sync all files except node_modules and .env, do not preserve owner/group
                    rsync -az --no-o --no-g --times --delete --exclude 'node_modules' --exclude '.env' -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" ./ ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/

                    # Sync dist/ folder separately if it exists
                    if [ -d "dist" ]; then
                        rsync -az --no-o --no-g --times -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" dist/ ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/dist/
                    fi

                    # Preserve Laravel storage symbolic links if they exist
                    if [ -d "storage" ]; then
                        rsync -az --no-o --no-g --times -e "ssh -i ${SSH_KEY} -p ${PROD_PORT}" --links storage/ ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/storage/
                    fi
                """
            }
        }

        /* ------------------------------------------ */
        stage('Copy ENV File to Server') {
            steps {
                echo "Copying .env file to production server..."
                sh """
                    scp -i ${SSH_KEY} -P ${PROD_PORT} \
                        /var/lib/jenkins/.env/bhakti-bhav.env \
                        ${PROD_USER}@${PROD_HOST}:${DEPLOY_DIR}/.env
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

                /* --------------------------------------------------- */
        stage('Reload PM2 Process') {
            steps {
                echo "Reloading PM2 process..."
                sh """
                    ssh -i ${SSH_KEY} -p ${PROD_PORT} ${PROD_USER}@${PROD_HOST} "\
                        sudo pm2 reload bhaktibhav-api;\
                    "
                """
            }
        }

    }
}
