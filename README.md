# **💎 TixVibe Microservices**

**TixVibe Microservices** is an advanced, distributed event-ticketing platform designed with the scalability, resilience, and efficiency needed to handle millions of users, built with best practices and patterns inspired by industry leaders like Google, Meta, Amazon, and Uber.

This project follows microservices architecture and modern distributed system principles to ensure reliability, scalability, and maintainability in a high-traffic environment. Key features include event-driven communication, eventual consistency, fault isolation, and a cloud-native deployment model. The platform leverages modern tools like Kubernetes, Docker, NATS Streaming, Redis, and Bull.js to handle the complexities of asynchronous communication and distributed job management.

![tixvibe microservices](https://i.imgur.com/4D8YzgF.png)

![tixvibe microservices](https://i.imgur.com/NGeWBY1.png)

![tixvibe microservices](https://i.imgur.com/awAHZiw.png)

![tixvibe microservices](https://i.imgur.com/HUZetG7.png)

![tixvibe microservices](https://i.imgur.com/gMlwJDW.png)

![tixvibe microservices](https://i.imgur.com/oP90GFC.png)

---

## **Table of Contents**

- [**💎 TixVibe Microservices**](#-tixvibe-microservices)
  - [**Table of Contents**](#table-of-contents)
  - [**Introduction**](#introduction)
  - [**Architecture Overview**](#architecture-overview)
    - [**Service Design and Communication**](#service-design-and-communication)
      - [**Microservices Isolation**](#microservices-isolation)
      - [**Service Communication**](#service-communication)
      - [**API Design Consistency**](#api-design-consistency)
      - [**Optimistic Concurrency Control (OCC)**](#optimistic-concurrency-control-occ)
    - [**Event-Driven Microservices**](#event-driven-microservices)
      - [**Publishers and Listeners**](#publishers-and-listeners)
      - [**Handling Failures and Retries**](#handling-failures-and-retries)
    - [**Database Strategy**](#database-strategy)
    - [**Design Patterns and Best Practices**](#design-patterns-and-best-practices)
      - [**Singleton Pattern**](#singleton-pattern)
      - [**Event Sourcing**](#event-sourcing)
  - [**Features**](#features)
  - [**Development and Deployment**](#development-and-deployment)
    - [**Local Development with Minikube**](#local-development-with-minikube)
    - [**Cloud Deployment on GCP and AWS**](#cloud-deployment-on-gcp-and-aws)
      - [**Google Cloud Kubernetes Engine (GKE)**](#google-cloud-kubernetes-engine-gke)
      - [**AWS EKS**](#aws-eks)
  - [**Testing and CI/CD**](#testing-and-cicd)
  - [**Common Library (`@tixvibe/common`)**](#common-library-tixvibecommon)
  - [**Installation and Running Instructions**](#installation-and-running-instructions)
  - [**Links and References**](#links-and-references)
  - [Screenshots](#screenshots)
  - [Screenshots II](#screenshots-ii)
  - [Screenshots III](#screenshots-iii)
  - [Screenshots IV](#screenshots-iv)

---

## **Introduction**

**TixVibe Microservices** is built with a clear focus on delivering a high-performance, scalable platform capable of supporting millions of users. At its core, it adopts **microservices** architecture to decouple domains and scale independently while maintaining system reliability and performance under heavy traffic.

This project is driven by modern best practices in **distributed systems** and **cloud-native** technologies, integrating **Kubernetes**, **Docker**, **Redis**, **Bull.js**, and **NATS Streaming** to enable efficient service discovery, container orchestration, and asynchronous communication.

Key aspects of the design include:

- **Optimistic Concurrency Control (OCC)** to manage distributed transactions safely.
- **Database-per-service** approach to ensure domain isolation, which is key for scaling and fault tolerance.
- **Event-driven architecture** with NATS Streaming to ensure decoupled, asynchronous communication between services.
- A **shared common library** (`@tixvibe/common`) used across all services to ensure code consistency and reuse.

---

## **Architecture Overview**

### **Service Design and Communication**

The architecture is designed around the following principles:

#### **Microservices Isolation**

Each service is isolated with its own database and domain logic. This pattern, also known as **Database-per-Service**, ensures:

- **Fault isolation**: Failures in one service do not affect others.
- **Independent scaling**: Services can scale independently based on load and traffic.
- **Independent deployments**: New versions of services can be deployed independently without impacting others.

#### **Service Communication**

Services interact using **HTTP** for synchronous communication and **NATS Streaming** for asynchronous, event-driven communication. The use of NATS ensures:

- **Loose coupling** between services, allowing for easy extensibility and scalability.
- **Eventual consistency** in the system, as services handle events independently and asynchronously.

![tixvibe microservices](https://i.imgur.com/SA59RMg.png)

#### **API Design Consistency**

To provide consistency and flexibility, all services expose standardized **REST APIs** that:

- Use **JSON** as the data format, with fields such as `_id` parsed to `id` for easier integration with NoSQL databases.
- Return standardized error responses, which simplify handling errors in the frontend (Next.js).

#### **Optimistic Concurrency Control (OCC)**

For all services handling concurrent updates to critical resources (such as tickets or orders), we use **Optimistic Concurrency Control** (OCC). This approach helps:

- Mitigate race conditions in distributed systems.
- Safeguard data integrity by validating the state of resources before committing changes.

---

### **Event-Driven Microservices**

At the heart of **TixVibe** is an **event-driven architecture** that leverages **NATS Streaming Server** for reliable, asynchronous message passing between services. This approach allows decoupled communication, where services publish events and subscribe to others' events, enabling eventual consistency.

#### **Publishers and Listeners**

Each service implements a **publisher** to emit events and a **listener** to handle events emitted by other services. The events propagate business logic changes (e.g., a new ticket being created or an order being placed), ensuring that all services are eventually synchronized with the latest state.

The core of the event-driven system is the **Base Publisher** and **Base Listener** classes in the `@tixvibe/common` library, which abstract:

- Event emission: Services can easily publish events without needing to manually set up listeners.
- Event subscription: Services can listen for specific events from other services, maintaining a reactive flow of information.

By ensuring that each service is responsible for emitting and handling events related to its domain, we achieve a **highly decoupled architecture** that can scale horizontally, with minimal impact on other services during failure or changes.

#### **Handling Failures and Retries**

The use of **Bull.js** and **Redis** ensures that job expiration and retries are handled efficiently. Services can queue jobs (like ticket reservations) in Redis and retry them when necessary, ensuring reliability even under heavy load.

---

### **Database Strategy**

The microservices are structured around the **One Database per Service** pattern, where each service maintains its own database (MongoDB in this case). This approach ensures:

- **Data isolation**: No direct sharing of databases between services, promoting separation of concerns.
- **Service independence**: Each service can evolve and scale independently without needing to coordinate with other services' databases.
- **Redundancy**: Services can store relevant data in other services’ databases if required (for example, the `Orders` service stores ticket data).

Additionally, the project implements **Optimistic Concurrency Control (OCC)** to prevent race conditions in distributed transactions, especially when services perform operations on the same resource simultaneously.

---

### **Design Patterns and Best Practices**

#### **Singleton Pattern**

A **singleton pattern** is used for managing single instances of critical components across the services:

- **NATS Streaming Client**: Each service shares the same instance of the NATS Streaming client, ensuring efficient communication without redundant connections.
- **MongoDB**: All database interactions use a singleton instance of the MongoDB connection to avoid connection pool overhead.

#### **Event Sourcing**

Although the system does not fully embrace Event Sourcing, the event-driven nature of the architecture ensures that key events (e.g., order created, ticket purchased) are stored and can be replayed for debugging or future processing.

---

## **Features**

- **Microservice Scalability**: Independent services that can scale based on demand.
- **Event-Driven Architecture**: Loose coupling of services via NATS Streaming, promoting flexibility and scalability.
- **Optimistic Concurrency Control (OCC)**: Prevents race conditions when updating critical resources.
- **Redis + Bull.js for Job Expiration and Retry Logic**: Ensures smooth job execution and reliable expiration of resources.
- **Load Balancing with NGINX Ingress**: Facilitates effective HTTP traffic distribution across services in the Kubernetes cluster.
- **Service Discovery with Kubernetes**: Automatic service discovery and scaling using Kubernetes in both local and cloud environments.

---

## **Development and Deployment**

### **Local Development with Minikube**

For local development, **Minikube** provides an easy way to spin up a Kubernetes cluster on your machine:

1. **Start Minikube**:
   ```bash
   minikube start
   ```
2. **Configure hostfile**:
   Add the following line to your `/etc/hosts` file:
   ```text
   <MINIKUBE_IP> tixvibe.dev
   ```
3. **Enable Ingress and Tunnel**:
   ```bash
   minikube addons enable ingress
   minikube tunnel
   ```
4. **Deploy Services** using **Skaffold**:
   ```bash
   skaffold dev
   ```

### **Cloud Deployment on GCP and AWS**

#### **Google Cloud Kubernetes Engine (GKE)**

1. **Create Cluster**:
   ```bash
   gcloud container clusters create tixvibe-cluster --num-nodes=3
   ```
2. **Configure kubectl for GKE**:
   ```bash
   gcloud container clusters get-credentials tixvibe-cluster
   ```
3. **Deploy Services**:
   ```bash
   skaffold run
   ```

#### **AWS EKS**

1. **Create Cluster**:
   ```bash
   eksctl create cluster --name tixvibe-cluster
   ```
2. **Configure kubectl for EKS**:
   ```bash
   aws eks update-kubeconfig --name tixvibe-cluster
   ```
3. **Deploy Services**:
   ```bash
   skaffold run
   ```

---

## **Testing and CI/CD**

- **Automated Unit Tests**: Using **Jest** for writing unit and integration tests for services, listeners, and publishers.
- **Mocked Testing**: Includes mocked tests for NATS Streaming and Stripe integration to ensure service independence and testability

.

- **CI/CD Pipeline**: Integrates with GitHub Actions for automated deployment to GKE or AWS EKS.

---

## **Common Library (`@tixvibe/common`)**

The `@tixvibe/common` library contains shared code for microservices, including:

- **Base Publisher/Listener** for event-driven communication with NATS Streaming.
- **Utility functions** for logging, error handling, and authentication.
- **API DTOs** and models for consistent data structures across services.

This shared library allows developers to focus on core business logic without duplicating infrastructure code across services.

---

## **Installation and Running Instructions**

1. **Clone the repository**:

   ```bash
   git clone https://github.com/tixvibe/tixvibe-microservices.git
   cd tixvibe-microservices
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run services locally**:
   ```bash
   skaffold dev
   ```

---

## **Links and References**

- [TixVibe Monorepo](https://github.com/tixvibe/tixvibe-microservices)
- [TixVibe Common Repository](https://github.com/colson0x1/common)
- [@tixvibe/common NPM](https://www.npmjs.com/package/@tixvibe/common)

---

## Screenshots

![tixvibe microservices](https://i.imgur.com/NGeWBY1.png)

![tixvibe microservices](https://i.imgur.com/gMlwJDW.png)

![tixvibe microservices](https://i.imgur.com/oP90GFC.png)

![tixvibe microservices](https://i.imgur.com/awAHZiw.png)

![tixvibe microservices](https://i.imgur.com/eNmpMom.png)

![tixvibe microservices](https://i.imgur.com/grv3LVz.png)

![tixvibe microservices](https://i.imgur.com/UZWMZCr.png)

![tixvibe microservices](https://i.imgur.com/MjIpunp.png)

![tixvibe microservices](https://i.imgur.com/nzAewkp.png)

![tixvibe microservices](https://i.imgur.com/LQN45km.png)

![tixvibe microservices](https://i.imgur.com/wBQTiYm.png)

![tixvibe microservices](https://i.imgur.com/OAMAhMf.png)

![tixvibe microservices](https://i.imgur.com/WM2NT65.png)

![tixvibe microservices](https://i.imgur.com/spE3OxQ.png)

![tixvibe microservices](https://i.imgur.com/1Ali74p.png)

![tixvibe microservices](https://i.imgur.com/EuNgxpx.png)

![tixvibe microservices](https://i.imgur.com/XUPUDm5.png)

![tixvibe microservices](https://i.imgur.com/wWmcPbH.png)

![tixvibe microservices](https://i.imgur.com/bkfiWcJ.png)

![tixvibe microservices](https://i.imgur.com/39Eq0wI.png)

![tixvibe microservices](https://i.imgur.com/7foNKmu.png)

![tixvibe microservices](https://i.imgur.com/sTK7ODF.png)

![tixvibe microservices](https://i.imgur.com/fOt3oDz.png)

![tixvibe microservices](https://i.imgur.com/Ug5ilWV.png)

![tixvibe microservices](https://i.imgur.com/WO3Amwz.png)

![tixvibe microservices](https://i.imgur.com/tzA1eK5.png)

![tixvibe microservices](https://i.imgur.com/yIpPcaw.png)

![tixvibe microservices](https://i.imgur.com/68Bk0gf.png)

![tixvibe microservices](https://i.imgur.com/LuiEZAO.png)

![tixvibe microservices](https://i.imgur.com/5010XzW.png)

![tixvibe microservices](https://i.imgur.com/NvY4wUZ.png)

![tixvibe microservices](https://i.imgur.com/WXqkJ0p.png)

![tixvibe microservices](https://i.imgur.com/tnkV6e8.png)

![tixvibe microservices](https://i.imgur.com/iRGsi4b.png)

![tixvibe microservices](https://i.imgur.com/3ANKj0a.png)

![tixvibe microservices](https://i.imgur.com/E3XdTsL.png)

![tixvibe microservices](https://i.imgur.com/Tu4L31B.png)

![tixvibe microservices](https://i.imgur.com/865fVxq.png)

![tixvibe microservices](https://i.imgur.com/gVtvqUo.png)

![tixvibe microservices](https://i.imgur.com/q9ZOSPY.png)

![tixvibe microservices](https://i.imgur.com/ubovbJK.png)

![tixvibe microservices](https://i.imgur.com/fu1jlfU.png)

![tixvibe microservices](https://i.imgur.com/5w2L0KH.png)

![tixvibe microservices](https://i.imgur.com/nIFKXsO.png)

![tixvibe microservices](https://i.imgur.com/gnMDywE.png)

![tixvibe microservices](https://i.imgur.com/zxOFg7m.png)

![tixvibe microservices](https://i.imgur.com/c7sNBuJ.png)

![tixvibe microservices](https://i.imgur.com/9nir2rk.png)

![tixvibe microservices](https://i.imgur.com/fIqOD2w.png)

![tixvibe microservices](https://i.imgur.com/qDNynq3.png)

![tixvibe microservices](https://i.imgur.com/ppOJjp7.png)

![tixvibe microservices](https://i.imgur.com/KiN8e4N.png)

![tixvibe microservices](https://i.imgur.com/FK138DH.png)

![tixvibe microservices](https://i.imgur.com/PMVFedT.png)

![tixvibe microservices](https://i.imgur.com/M8lPnHf.png)

![tixvibe microservices](https://i.imgur.com/GEcSBuP.png)

![tixvibe microservices](https://i.imgur.com/aU8Zm3d.png)

![tixvibe microservices](https://i.imgur.com/f1KENOf.png)

## Screenshots II

![tixvibe microservices](https://i.imgur.com/qXur9M6.png)

![tixvibe microservices](https://i.imgur.com/gRdCHIu.png)

![tixvibe microservices](https://i.imgur.com/yBqW3ST.png)

## Screenshots III

![tixvibe microservices](https://i.imgur.com/l84OQ04.png)

![tixvibe microservices](https://i.imgur.com/AnxlarL.png)

![tixvibe microservices](https://i.imgur.com/qwleIN0.png)

![tixvibe microservices](https://i.imgur.com/6hpNwxP.png)

![tixvibe microservices](https://i.imgur.com/kSWv3YV.png)

![tixvibe microservices](https://i.imgur.com/34P3izd.png)

![tixvibe microservices](https://i.imgur.com/l582wxw.png)

![tixvibe microservices](https://i.imgur.com/9mvxQCL.png)

![tixvibe microservices](https://i.imgur.com/uD6ETGK.png)

![tixvibe microservices](https://i.imgur.com/17S6cOP.png)

![tixvibe microservices](https://i.imgur.com/aRas7Va.png)

![tixvibe microservices](https://i.imgur.com/3SzgCt0.png)

## Screenshots IV

![tixvibe microservices](https://i.imgur.com/4D8YzgF.png)

![tixvibe microservices](https://i.imgur.com/JFHjqYV.png)

![tixvibe microservices](https://i.imgur.com/49ZIPGu.png)

![tixvibe microservices](https://i.imgur.com/eyRZclg.png)

![tixvibe microservices](https://i.imgur.com/UqmiFuo.png)

![tixvibe microservices](https://i.imgur.com/eDDs8QQ.png)

![tixvibe microservices](https://i.imgur.com/wMgDNk8.png)

![tixvibe microservices](https://i.imgur.com/66GvQ5H.png)

![tixvibe microservices](https://i.imgur.com/IKrBD8L.png)

![tixvibe microservices](https://i.imgur.com/iCcs0IS.png)

![tixvibe microservices](https://i.imgur.com/C6YhcsT.png)

![tixvibe microservices](https://i.imgur.com/oGAjkNT.png)

![tixvibe microservices](https://i.imgur.com/KzMWfSN.png)

![tixvibe microservices](https://i.imgur.com/pIBDBqr.png)
