# Local Testing Instructions

Before pushing to GitHub, you can verify your application works locally using the following methods:

## 1. Test Node.js Application Directly
This verifies the code logic without containers.

1.  **Install Dependencies** (if you haven't yet):
    ```powershell
    npm install
    ```
2.  **Start the Server**:
    ```powershell
    npm start
    ```
3.  **Access the App**:
    - Open your browser to [http://localhost:3000](http://localhost:3000).
    - Try adding a student and deleting a student.
    - Check metrics at [http://localhost:3000/metrics](http://localhost:3000/metrics).
4.  **Stop the Server**:
    - Press `Ctrl + C` in the terminal.

## 2. Test Docker Build & Run
This verifies the Dockerfile and container environment.

1.  **Build the Image**:
    ```powershell
    docker build -t collage-erp-test .
    ```
2.  **Run the Container**:
    ```powershell
    docker run -d -p 3000:3000 --name test-app collage-erp-test
    ```
3.  **Verify**:
    - Access [http://localhost:3000](http://localhost:3000) again.
    - If it works here, your Dockerfile is correct.
4.  **Cleanup**:
    ```powershell
    docker stop test-app
    docker rm test-app
    docker rmi collage-erp-test
    ```

