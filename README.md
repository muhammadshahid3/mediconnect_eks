# MediConnect — Doctor Appointment Booking System

MediConnect is a full-stack MERN application that connects patients with doctors. Doctors manage a public profile and respond to appointment requests; patients search for doctors and book, track, and manage their appointments — all from responsive dashboards.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Production Deployment on AWS EKS](#production-deployment-on-aws-eks)
  - [1. Configure AWS CLI (IAM User)](#1-configure-aws-cli-iam-user)
  - [2. Create the EKS Cluster](#2-create-the-eks-cluster)
  - [3. Point kubectl at the Cluster](#3-point-kubectl-at-the-cluster)
  - [4. Install the EBS CSI Driver (storage for MongoDB)](#4-install-the-ebs-csi-driver-storage-for-mongodb)
  - [5. Install the AWS Load Balancer Controller (Ingress/ALB)](#5-install-the-aws-load-balancer-controller-ingressalb)
  - [6. Create Namespace, Secret & ConfigMap](#6-create-namespace-secret--configmap)
  - [7. Deploy MongoDB](#7-deploy-mongodb)
  - [8. Deploy Backend & Frontend](#8-deploy-backend--frontend)
  - [9. Deploy the Ingress (ALB)](#9-deploy-the-ingress-alb)
  - [10. Verify the Deployment](#10-verify-the-deployment)
  - [CI/CD with GitHub Actions](#cicd-with-github-actions)
  - [Cleanup / Delete the Cluster](#cleanup--delete-the-cluster)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

**Landing Page**
- Responsive navbar, hero, about section, and search bar
- Featured doctor cards pulled live from the database
- Separate Doctor Login and Patient Login entry points

**Doctor Module**
- Sign up, log in, log out (JWT-based auth)
- Dashboard to view and edit profile: specialization, qualification, experience, clinic address, consultation fee, available days/time, about, and profile picture (via Multer upload)
- Appointment Requests tab to confirm, decline, or mark appointments as completed

**Patient Module**
- Sign up (with confirm password), log in, log out
- Search doctors by name or specialization
- View a doctor's full public profile and book an appointment (date, time, optional notes)
- My Bookings tab showing appointment status (pending, confirmed, completed, cancelled)
- Edit profile (name, phone)

**Cross-cutting**
- JWT authentication with role-based route protection (doctor vs. patient)
- Passwords hashed with bcrypt, never returned by the API
- Toast notifications, loading spinners, and empty/error states throughout
- Dockerized: React (nginx) + Node/Express + MongoDB, deployed to production on AWS EKS (Kubernetes)

---

## Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React 18 (Vite), React Router, Axios, Tailwind CSS, react-toastify |
| Backend        | Node.js, Express.js                 |
| Database       | MongoDB with Mongoose               |
| Authentication | JSON Web Tokens (JWT)               |
| Password Hash  | bcrypt (bcryptjs)                   |
| File Upload    | Multer (doctor profile images)      |
| Containerization | Docker                              |
| Orchestration    | Kubernetes on AWS EKS (Deployments, StatefulSet, HPA, Ingress/ALB) |

---

## Folder Structure

```
mediconnect/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Navbar, Footer, DoctorCard, Loader, ProtectedRoute, PulseDivider
│   │   ├── pages/                # Landing, Doctor/Patient auth & dashboards, DoctorProfileView, NotFound
│   │   ├── services/             # api.js (axios instance) + auth/doctor/patient/appointment services
│   │   ├── hooks/                # useAuth
│   │   ├── context/              # AuthContext
│   │   ├── App.jsx, main.jsx, index.css
│   ├── Dockerfile                # multi-stage build served by nginx
│   ├── nginx.conf
│   └── package.json
│
├── server/                      # Express backend
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # Doctor, Patient, Appointment (Mongoose schemas)
│   ├── controllers/              # doctorController, patientController, appointmentController
│   ├── routes/                   # doctorRoutes, patientRoutes, appointmentRoutes
│   ├── middleware/                # authMiddleware (JWT + roles), uploadMiddleware (Multer), errorMiddleware
│   ├── utils/generateToken.js
│   ├── uploads/                  # doctor profile images (persisted via a PersistentVolume in production)
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
│
├── kubernates/                  # Kubernetes manifests used to deploy to AWS EKS
│   ├── namespace.yaml            # mediconnect namespace
│   ├── backend/
│   │   ├── backend.yaml          # Deployment
│   │   ├── configmap.yaml        # non-secret env vars (NODE_ENV, PORT, CLIENT_URL, ...)
│   │   ├── hpa.yaml               # HorizontalPodAutoscaler (CPU + memory)
│   │   └── service.yaml           # ClusterIP service
│   ├── frontend/
│   │   ├── deployment.yaml        # Deployment
│   │   ├── hpa.yaml                # HorizontalPodAutoscaler (CPU)
│   │   └── service.yaml            # ClusterIP service
│   ├── ingress/
│   │   ├── iam_policy.json         # IAM policy for the AWS Load Balancer Controller
│   │   └── ingress.yaml            # ALB Ingress (routes / to frontend, /api to backend)
│   └── mongodb/
│       ├── gp3-storageclass.yaml   # EBS gp3 StorageClass
│       ├── service.yaml             # Headless service for the StatefulSet
│       └── statefulset.yaml         # MongoDB StatefulSet + PVC template
│
└── README.md
```

---

## Getting Started

Run the app locally with Node.js and a MongoDB instance. For the production setup, see [Production Deployment on AWS EKS](#production-deployment-on-aws-eks) below.

**Prerequisites:** Node.js 18+, npm, and a running MongoDB instance (local or Atlas).

**1. Backend**

```bash
cd server
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev             # starts on http://localhost:5000
```

**2. Frontend**

```bash
cd client
cp .env.example .env   # VITE_API_URL should point at your backend
npm install
npm run dev             # starts on http://localhost:5173
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### `server/.env`

| Variable         | Description                                   | Example                                  |
|------------------|------------------------------------------------|-------------------------------------------|
| `NODE_ENV`       | Environment mode                              | `development`                             |
| `PORT`           | Port the API listens on                       | `5000`                                    |
| `MONGO_URI`      | MongoDB connection string                     | `mongodb://localhost:27017/mediconnect`   |
| `JWT_SECRET`     | Secret used to sign JWTs                      | a long random string                      |
| `JWT_EXPIRES_IN` | Token lifetime                                | `7d`                                      |
| `CLIENT_URL`     | Frontend origin (for reference/CORS tuning)   | `http://localhost:5173`                   |

### `client/.env`

| Variable        | Description                     | Example                          |
|-----------------|----------------------------------|-----------------------------------|
| `VITE_API_URL`  | Base URL of the backend API      | `http://localhost:5000/api`      |

---

## API Documentation

Base URL: `/api`

### Authentication

| Method | Endpoint                | Access | Description                        |
|--------|--------------------------|--------|-------------------------------------|
| POST   | `/doctors/signup`        | Public | Register a new doctor              |
| POST   | `/doctors/login`         | Public | Log in as a doctor                 |
| POST   | `/patients/signup`       | Public | Register a new patient             |
| POST   | `/patients/login`        | Public | Log in as a patient                |

All successful auth responses return `{ token, user }`. Send the token as `Authorization: Bearer <token>` on subsequent requests.

### Doctors

| Method | Endpoint                | Access         | Description                                  |
|--------|--------------------------|----------------|------------------------------------------------|
| GET    | `/doctors`               | Public         | List all doctors; supports `?search=` and `?specialization=` |
| GET    | `/doctors/:id`           | Public         | Get a single doctor's public profile         |
| GET    | `/doctors/profile/me`    | Private (doctor) | Get the logged-in doctor's own profile      |
| PUT    | `/doctors/profile`       | Private (doctor) | Update profile (multipart/form-data; accepts `profileImage` file) |

### Patients

| Method | Endpoint                | Access          | Description                        |
|--------|--------------------------|-----------------|--------------------------------------|
| GET    | `/patients/profile`      | Private (patient) | Get the logged-in patient's profile |
| PUT    | `/patients/profile`      | Private (patient) | Update name/phone                  |

### Appointments

| Method | Endpoint                     | Access           | Description                              |
|--------|-------------------------------|------------------|--------------------------------------------|
| POST   | `/appointments`               | Private (patient) | Book an appointment with a doctor         |
| GET    | `/appointments/patient`       | Private (patient) | List the logged-in patient's appointments |
| GET    | `/appointments/doctor`        | Private (doctor)  | List the logged-in doctor's appointments  |
| PUT    | `/appointments/:id/status`    | Private (doctor)  | Update status: `pending`, `confirmed`, `cancelled`, `completed` |

---

## Production Deployment on AWS EKS

This project is deployed to production on **Amazon EKS (Elastic Kubernetes Service)**. The steps below document exactly how the cluster was set up and how the app was shipped to it — from configuring AWS access, to creating the EKS cluster, to applying every Kubernetes manifest in `kubernates/`.

**Architecture:** GitHub Actions builds the `client` and `server` Docker images and pushes them to Docker Hub → the images are pulled by an EKS cluster running in `ap-south-1` → an AWS Application Load Balancer (provisioned by the AWS Load Balancer Controller via an `Ingress`) exposes the frontend and backend → MongoDB runs inside the cluster as a `StatefulSet` backed by an EBS `gp3` volume.

### Prerequisites

Install these locally before starting:

| Tool | Purpose |
|------|---------|
| [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) | Talk to AWS APIs |
| [eksctl](https://eksctl.io/installation/) | Create/manage the EKS cluster |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | Talk to the Kubernetes API |
| [helm](https://helm.sh/docs/intro/install/) | Install the AWS Load Balancer Controller |
| Docker | Build and push images |

---

### 1. Configure AWS CLI (IAM User)

Deployment uses a dedicated **IAM user** (not the root account) with programmatic access and, at minimum, the following permissions: `AmazonEKSClusterPolicy`, `AmazonEKSServicePolicy`, EC2 full access (for the nodegroup/VPC), IAM permissions to create roles/policies (needed for the Load Balancer Controller and EBS CSI driver service accounts), and CloudFormation access (used internally by `eksctl`).

1. In the AWS Console → **IAM → Users → Add user**, create a user (e.g. `mediconnect-deployer`) with **programmatic access**, attach the policies above, and generate an **Access Key ID / Secret Access Key**.
2. Configure the AWS CLI locally with that IAM user's credentials:

   ```bash
   aws configure
   ```

   You'll be prompted for:

   ```
   AWS Access Key ID [None]: <your-access-key-id>
   AWS Secret Access Key [None]: <your-secret-access-key>
   Default region name [None]: ap-south-1
   Default output format [None]: json
   ```

3. Verify it worked:

   ```bash
   aws sts get-caller-identity
   ```

The same Access Key ID / Secret Access Key are also stored as GitHub Actions secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) so the CI/CD pipeline can deploy on every push — see [CI/CD with GitHub Actions](#cicd-with-github-actions).

---

### 2. Create the EKS Cluster

The cluster (`mediconnect-cluster`) was created with `eksctl`, which provisions the VPC, subnets, control plane, and a managed node group in one command:

```bash
eksctl create cluster \
  --name mediconnect-cluster \
  --region ap-south-1 \
  --version 1.30 \
  --nodegroup-name mediconnect-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

This takes ~15–20 minutes since it spins up CloudFormation stacks for the VPC and the EKS control plane.

---

### 3. Point kubectl at the Cluster

```bash
aws eks update-kubeconfig --region ap-south-1 --name mediconnect-cluster

# sanity check
kubectl get nodes
kubectl cluster-info
```

---

### 4. Install the EBS CSI Driver (storage for MongoDB)

MongoDB runs as a `StatefulSet` and needs a `PersistentVolumeClaim` backed by EBS (see `kubernates/mongodb/gp3-storageclass.yaml`, which defines the `gp3` storage class used by `statefulset.yaml`). The EBS CSI driver must be installed as an EKS add-on first:

```bash
# create an IAM OIDC provider for the cluster (required once per cluster)
eksctl utils associate-iam-oidc-provider \
  --cluster mediconnect-cluster \
  --region ap-south-1 \
  --approve

# create the IAM service account the driver needs
eksctl create iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster mediconnect-cluster \
  --region ap-south-1 \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --role-only \
  --role-name AmazonEKS_EBS_CSI_DriverRole

# install the add-on itself
eksctl create addon \
  --cluster mediconnect-cluster \
  --region ap-south-1 \
  --name aws-ebs-csi-driver \
  --service-account-role-arn arn:aws:iam::<AWS_ACCOUNT_ID>:role/AmazonEKS_EBS_CSI_DriverRole \
  --force
```

Then create the `gp3` storage class used by MongoDB's volume claim:

```bash
kubectl apply -f kubernates/mongodb/gp3-storageclass.yaml
```

---

### 5. Install the AWS Load Balancer Controller (Ingress/ALB)

The `Ingress` in `kubernates/ingress/ingress.yaml` uses `ingressClassName: alb`, which is served by the **AWS Load Balancer Controller**. The exact IAM permissions it needs are defined in `kubernates/ingress/iam_policy.json`:

```bash
# 1. Create the IAM policy from the file in this repo
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://kubernates/ingress/iam_policy.json

# 2. Create the IAM service account bound to that policy
eksctl create iamserviceaccount \
  --cluster mediconnect-cluster \
  --region ap-south-1 \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve \
  --override-existing-serviceaccounts

# 3. Install the controller with Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=mediconnect-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=ap-south-1 \
  --set vpcId=<YOUR_VPC_ID>

# confirm it's running
kubectl get deployment -n kube-system aws-load-balancer-controller
```

> Replace `<AWS_ACCOUNT_ID>` with your 12-digit AWS account ID and `<YOUR_VPC_ID>` with the VPC ID `eksctl` created in step 2 (`aws eks describe-cluster --name mediconnect-cluster --query "cluster.resourcesVpcConfig.vpcId"`).

---

### 6. Create Namespace, Secret & ConfigMap

```bash
# namespace everything lives in
kubectl apply -f kubernates/namespace.yaml

# secret: Mongo URI + JWT secret (not committed to git — create it directly)
kubectl create secret generic mediconnect-secret \
  --namespace mediconnect \
  --from-literal=MONGO_URI="mongodb://mongo.mediconnect.svc.cluster.local:27017/mediconnect" \
  --from-literal=JWT_SECRET="<a-long-random-production-secret>"

# non-secret backend config (NODE_ENV, PORT, JWT_EXPIRES_IN, CLIENT_URL)
kubectl apply -f kubernates/backend/configmap.yaml
```

---

### 7. Deploy MongoDB

```bash
kubectl apply -f kubernates/mongodb/service.yaml
kubectl apply -f kubernates/mongodb/statefulset.yaml

# wait until the pod is Running and the PVC is Bound
kubectl get pods -n mediconnect -l app=mongo
kubectl get pvc -n mediconnect
```

---

### 8. Deploy Backend & Frontend

```bash
# Backend (Deployment, Service, HPA)
kubectl apply -f kubernates/backend/service.yaml
kubectl apply -f kubernates/backend/backend.yaml
kubectl apply -f kubernates/backend/hpa.yaml

# Frontend (Deployment, Service, HPA)
kubectl apply -f kubernates/frontend/service.yaml
kubectl apply -f kubernates/frontend/deployment.yaml
kubectl apply -f kubernates/frontend/hpa.yaml
```

Both deployments pull prebuilt images (`shahiddevops1/mediconnect-backend:latest` and `shahiddevops1/mediconnect-frontend:latest`) from Docker Hub — these are the images the GitHub Actions pipeline builds and pushes on every merge to `main`.

---

### 9. Deploy the Ingress (ALB)

```bash
kubectl apply -f kubernates/ingress/ingress.yaml

# AWS takes a minute or two to provision the ALB; watch for the ADDRESS field
kubectl get ingress mediconnect-ingress -n mediconnect --watch
```

Once the `ADDRESS` column shows the ALB's DNS name, that's the public URL for the app (`/` → frontend, `/api` → backend). Update `CLIENT_URL` in `kubernates/backend/configmap.yaml` with that same ALB DNS name, then re-apply the ConfigMap and restart the backend so CORS reflects the real public URL:

```bash
kubectl apply -f kubernates/backend/configmap.yaml
kubectl rollout restart deployment backend -n mediconnect
```

---

### 10. Verify the Deployment

```bash
kubectl get all -n mediconnect
kubectl get pods -n mediconnect -o wide
kubectl logs -n mediconnect deployment/backend --tail=50
kubectl logs -n mediconnect deployment/frontend --tail=50
kubectl top pods -n mediconnect      # requires metrics-server
kubectl get hpa -n mediconnect
```

---

### CI/CD with GitHub Actions

`.github/workflows/main.yml` runs on every push to `main` and does the following:

1. Checks out the repo.
2. Logs in to Docker Hub and builds/pushes `client` → `mediconnect-frontend:latest` and `server` → `mediconnect-backend:latest`.
3. Configures AWS credentials using the same IAM user set up in [step 1](#1-configure-aws-cli-iam-user).
4. Runs `aws eks update-kubeconfig` to authenticate `kubectl` against `mediconnect-cluster` in `ap-south-1`.
5. Verifies cluster access (`kubectl cluster-info`, `kubectl get nodes`).
6. Runs `kubectl rollout restart deployment frontend/backend -n mediconnect` so the running pods pick up the freshly-pushed `:latest` images, then waits for the rollout to finish with `kubectl rollout status`.

To enable this pipeline in your own fork, add these under **Repo → Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|--------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not your password) |
| `AWS_ACCESS_KEY_ID` | Access key of the IAM deployer user |
| `AWS_SECRET_ACCESS_KEY` | Secret key of the IAM deployer user |

---

### Cleanup / Delete the Cluster

To avoid ongoing AWS charges (EKS control plane + EC2 nodes + ALB + EBS volumes all bill continuously):

```bash
# remove the ALB by deleting the ingress first, otherwise eksctl can leave it orphaned
kubectl delete -f kubernates/ingress/ingress.yaml

# uninstall the load balancer controller
helm uninstall aws-load-balancer-controller -n kube-system

# delete the entire cluster and its nodegroup/VPC stack
eksctl delete cluster --name mediconnect-cluster --region ap-south-1
```

---

## Future Improvements

- Email/SMS reminders for upcoming appointments
- Doctor availability calendar with slot-level conflict prevention
- In-app messaging between doctor and patient
- Ratings and reviews for doctors
- Admin role for platform moderation and doctor verification
- Payment integration for consultation fees
- Automated tests (Jest/Supertest for the API, React Testing Library for the client) and CI

---

## License

This project is provided as-is for educational and portfolio purposes.