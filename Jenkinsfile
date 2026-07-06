pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Testes') {
            agent {
                docker {
                    image 'node:22-slim'
                    args '-u root'
                }
            }
            steps {
                sh '''
                    npm install -g npm@11
                    apt-get update && apt-get install -y --no-install-recommends unzip ca-certificates
                    npx --yes @puppeteer/browsers install chrome@stable --path /opt/chrome --install-deps --format '{{path}}' > /opt/chrome-path.txt
                    ln -s "$(cat /opt/chrome-path.txt)" /usr/local/bin/chrome-for-testing
                '''
                sh 'npm ci'
                sh 'CHROME_BIN=/usr/local/bin/chrome-for-testing npx ng test --no-watch --no-progress --browsers=ChromeHeadlessNoSandbox --code-coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=trampohub-frontend -Dsonar.sources=src -Dsonar.javascript.lcov.reportPaths=coverage/trampohub-frontend/lcov.info"
                    }
                }
            }
        }

        stage('Build da imagem Docker') {
            steps {
                sh 'docker build -t trampohub-frontend:homolog .'
            }
        }

        stage('Deploy Homologação') {
            steps {
                sh 'docker compose --project-name trampohub-frontend-homolog -f docker-compose.homolog.yml down'
                sh 'docker compose --project-name trampohub-frontend-homolog -f docker-compose.homolog.yml up -d'
            }
        }
    }

    post {
        success {
            echo 'Pipeline executado com sucesso! Ambiente de homologação atualizado.'
        }
        failure {
            echo 'Pipeline falhou. Verifique os logs acima.'
        }
    }
}
