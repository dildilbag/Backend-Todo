pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                 withCredentials([usernamePassword(credentialsId: 'dockerhubcredentails2', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]){
                  sh'''
                  docker login -u $USERNAME -p $PASSWORD
                  docker build -t 152028/project-demo:${BUILD_NUMBER} .
                  docker push 152028/project-demo:${BUILD_NUMBER}
                  ''' 
                }
                
            }
        }
    }
}