# Table of Contents

Abstract ................................................................................. 1

**Chapter 1: Software Introduction** .................................................. 3
1.1 Project background ................................................................. 3
1.2 Project objective .................................................................. 5
1.3 Market pain points ................................................................. 6
1.4 Solutions of the project .......................................................... 7
1.5 Advantages of the project ......................................................... 8
1.6 Cost estimation .................................................................... 9
1.7 Market Research ................................................................... 11

**Chapter 2: Requirements Engineering** .............................................. 13
2.1 Functional Requirements ........................................................... 13
    2.1.1 Login and Registration .................................................... 13
    2.1.2 Short Link Creation and Management ....................................... 15
    2.1.3 QR Code Generation ........................................................ 17
    2.1.4 Click Statistics and Analysis ............................................ 18
    2.1.5 Batch Operations via API ................................................. 20
    2.1.6 Landing Page Editing ...................................................... 22
2.2 Non-functional Requirements ....................................................... 24
    2.2.1 Performance Requirements .................................................. 24
    2.2.2 Scalability Requirements .................................................. 25
    2.2.3 Security Requirements ..................................................... 26
    2.2.4 Availability Requirements ................................................. 27
    2.2.5 Maintainability Requirements .............................................. 28
    2.2.6 Compatibility Requirements ................................................ 29
    2.2.7 Usability Requirements .................................................... 30
    2.2.8 Reliability Requirements .................................................. 31

**Chapter 3: System Design** .......................................................... 33
3.1 User Stories ...................................................................... 33
3.2 Software Architectural ............................................................ 35
3.3 The Data Model in the Database .................................................... 37
3.4 Structure of Backend .............................................................. 39
    3.4.1 Summary .................................................................... 39
    3.4.2 About User ................................................................. 40
    3.4.3 About Link ................................................................. 41
    3.4.4 About Analytics ............................................................ 42
    3.4.5 About Landing Page ......................................................... 43
    3.4.6 About Team ................................................................. 44
3.5 Structure of Frontend ............................................................. 45
    3.5.1 Login Page ................................................................. 45
    3.5.2 Dashboard Page ............................................................. 46
    3.5.3 Link Detail Page ........................................................... 47
    3.5.4 Analytics Page ............................................................. 48
    3.5.5 Landing Page Editor ........................................................ 49
    3.5.6 API Keys Management Page ................................................... 50
    3.5.7 Settings Page .............................................................. 51
3.6 Non-functional Requirements Implementation Mapping ................................ 52
    3.6.1 Performance Requirements Implementation .................................... 52
    3.6.2 Scalability Requirements Implementation .................................... 54
    3.6.3 Security Requirements Implementation ....................................... 56
    3.6.4 Availability Requirements Implementation ................................... 58
    3.6.5 Maintainability Requirements Implementation ................................ 60
    3.6.6 Compatibility Requirements Implementation .................................. 62
    3.6.7 Usability Requirements Implementation ...................................... 64
    3.6.8 Reliability Requirements Implementation .................................... 66

**Chapter 4: Market Analysis** ........................................................ 68
4.1 Background analysis ............................................................... 68
4.2 Market situation .................................................................. 70
4.3 Market analysis and positioning ................................................... 72
    4.3.1 Large market demand ........................................................ 72
    4.3.2 User group analysis ........................................................ 74
    4.3.3 Competitive Analysis of Porter's Five Forces Model ........................ 76

**Chapter 5: Practical application and popularization** .............................. 78
5.1 Practical application ............................................................. 78
5.2 Application promotion ............................................................. 80

**Conclusion** ........................................................................ 82

---

# Abstract

In the context of digital communication, long URLs—characterized by meaningless random strings—pose significant challenges such as poor memorability, excessive space occupation, and low readability, making them incompatible with scenarios demanding conciseness, including SMS notifications, email marketing, and social media posts with character limits. While short links address these issues by enhancing clarity, efficiency, and brand image, mainstream short-link platforms often present barriers in terms of high subscription/usage-based costs, limited customization for branding, reliance on third-party services, and instability under heavy traffic. Consequently, there is an urgent need for a lightweight, cost-effective, and customizable URL shortening solution that integrates ease of use with professional branding capabilities.

To address this gap, this study designs and develops TinyBridge, a lightweight URL shortening service, with six core functional modules. For cost control, it offers a free basic version, flexible tiered packages, and supports private deployment to reduce long-term expenses. In terms of customization and branding, users can bind their own domain names, customize short link prefixes and paths, and display brand information on landing pages. For operational convenience, an independent platform with APIs is built, enabling batch import/export of links and quick creation/editing of visual landing pages. To ensure performance, a distributed architecture and multi-layer caching mechanism (in-memory caching with optional Redis support) are adopted, supplemented by real-time system monitoring and Bloom filter optimization. Functionally, it integrates URL shortening, QR code generation, visual landing page creation, and comprehensive data analysis. The platform is based on a multi-tenant architecture for data isolation, supports multi-role permission management and personalized settings, and is compatible with multiple databases (SQLite, PostgreSQL, MySQL) to adapt to diverse deployment scenarios.

The development of TinyBridge is divided into three key objectives. The first objective focuses on implementing a secure user login system (using JWT for authentication and Argon2 for password hashing), core URL shortening and redirection functionality (based on an 8-character alphanumeric random string generation algorithm with collision detection), and a basic web interface (developed with Vue.js). The second objective involves optimizing the web interface for better usability, implementing basic analytics features (supporting multi-database storage for analytics data), and improving redirection performance via multi-layer caching and Bloom filter integration. The third objective enhances the web interface with advanced features, including user account management (team collaboration and role-based access control), detailed analytics (multi-dimensional metrics like click-through rates, geographic distribution, and device types with visualization and data export), and landing page customization (logo upload, layout selection, and content editing).

TinyBridge delivers multiple benefits: it enables behavior-based link recommendations to improve resource access efficiency, supports one-click cross-platform social sharing (compatible with WeChat, Douyin, etc.), automatically generates memorable 8-character short codes with uniqueness guarantees, provides data-driven insights for decision-making, and facilitates efficient content dissemination via mainstream social ecosystems. The project timeline spans from September 16 to November 24, 2025, with six phases covering architecture design, algorithm research, front-end/back-end development and testing, and deployment. With clear task assignments and progress tracking, TinyBridge aims to provide cost-effective and efficient link management solutions for campus and enterprise users, enhancing information dissemination efficiency and brand building.

# Chapter 1 Software Introduction :

## 1.1 Project background

To address the URL shortening needs of campus organizations, small and medium-sized enterprises, and individual content creators, our project team proposes a platform called TinyBridge. This platform leverages software engineering expertise to create an integrated and reliable short-link management service, facilitating efficient link sharing and brand-consistent communication. With the rise of digital marketing and mobile-first communication strategies, short-link platforms have become essential tools for fostering professional branding and efficient resource sharing.

The TinyBridge platform offers a convenient channel for users to generate custom short links, track click analytics through real-time dashboards, and manage links through batch import/export APIs. Users can create branded short links with custom domains and prefixes, generate QR codes, and build visual landing pages without coding. For added flexibility, the platform supports role-based access control and community features for sharing best practices.

From a technical perspective, the platform's front end is built using Vue3 and Vite, while the back end is implemented with Node.js using TypeScript, supporting SQLite and PostgreSQL databases. The system employs a distributed architecture with multi-layer caching and Bloom filter optimization to ensure millisecond-level redirect response times. These technologies together create a secure, scalable, and efficient link management environment.

The project involves both software engineering and practical full-stack development. Our goal is to increase link sharing efficiency on campus and in enterprises. If successful at SCNU and other pilot institutions, we plan to extend its reach to other universities and enterprises, contributing to digital communication infrastructure development.

## 1.2 Project objective

Establishing a short-link management platform is a worthy project aiming to promote efficient link sharing, reduce communication friction, and enhance brand consistency. Our platform is intended to offer a user-friendly service for users and organizations to easily generate, manage, and analyze short links. The core objective of the project is to build a web application that would be a proper platform for professional URL shortening and link management.

In order to achieve this goal, we categorized the demands of the software into three main functional modules: Link Generation and Management, User Authentication and Permission Management, and Click Statistics and Analysis. In addition, we aim to study and implement short code generation algorithms and data analysis methods for professional link management platforms. These algorithms can go a long way towards improving the user experience and enabling applications to actually meet the actual needs of the users. After completing the software architecture and algorithm design, the most significant step is the final implementation of the platform. Our third goal is to execute the short-link platform software to ensure the maintainability and scalability of the project. Definitely, we always put user's experience at the core, hoping that this project will be a real convenience for all students, staff, and organizations whenever they have a request to share links efficiently and professionally. In the long run, we are looking forward to create an efficient, secure, and convenient short-link management platform, boost resource sharing, reduce communication barriers, and enhance the interaction and connection between users.

## 1.3 Market pain points

Jack, a course-project leader at SCNU, faces challenges when sharing resources efficiently. He must distribute sign-up forms, slides, and materials across WeChat groups, Douyin profiles, and class forums. Long URLs hurt readability, are often truncated by character limits, and display inconsistently across platforms. QR code screenshots break when forwarded, and he lacks unified management tools, making it time-consuming to update links and respond to questions about "which link is the latest."

TinyBridge is designed to address this gap in professional link management. Current methods lead to inefficiency—users can't track link performance, struggle with brand consistency across platforms, and face high costs with commercial solutions like Bitly ($199/month for advanced analytics). Free alternatives like TinyURL lack essential tracking capabilities.

TinyBridge offers a streamlined solution by allowing users to directly generate branded short links, monitor click analytics in real-time, and manage links through batch operations via APIs. Users can customize domains, prefixes, and paths to maintain brand consistency, generate QR codes for offline sharing, and create visual landing pages without coding.

## 1.4 Solutions of the project

To address the pain points of existing short-link services, we've designed key features to enhance user experience. Users can easily generate short links with custom codes, domains, and branded prefixes, eliminating the need to rely on third-party platforms with limited customization. The platform supports batch import/export of links via APIs, enabling efficient management of large-scale campaigns.

A real-time analytics dashboard enables users to monitor click performance, including geographic location, device type, and traffic sources, addressing scattered and insufficient data tracking. Additionally, a visual landing-page editor allows users to create personalized destination pages without coding, and QR code generation supports seamless offline-to-online sharing.

Meanwhile, on top of implementing these basic features, we will also focus on advanced algorithms to enhance user experience. The short code generation algorithm employs efficient random or custom methods ensuring uniqueness, brevity, and collision resistance while supporting high concurrency. Data analysis methods implement real-time aggregation and visualized statistics, such as daily click summaries and trend analysis, combined with Redis caching to enhance query performance. Security protection algorithms integrate malicious URL detection and IP hash anonymization to prevent XSS and SQL injection attacks.

## 1.5 Advantages of the project

Currently, mainstream short-link services like Bitly and TinyURL serve as primary tools for URL shortening, but they have significant limitations. Bitly requires expensive subscriptions for advanced features: the Growth plan ($29/month) restricts users to only 500 links and 10 redirects per month, while the Premium plan ($199/month) unlocks advanced analytics such as device insights and geographical data. Free platforms like TinyURL ($9.99/month for paid tier) lack essential data tracking capabilities and offer limited customization options.

TinyBridge solves these issues by offering a dedicated platform with cost-effective pricing and comprehensive features. Our free basic version and tiered enterprise plans provide professional link management at a fraction of commercial platform costs. The platform's distributed microservices architecture ensures millisecond-level redirect response times and supports smooth scaling to handle high-traffic scenarios. Unlike commercial alternatives, our batch import/export APIs, visual landing-page editor, and integrated analytics dashboard offer a one-stop solution.

Security is another key advantage. TinyBridge features built-in security measures including JWT authentication, Argon2 password hashing, IP hash anonymization, and optional two-factor authentication. This streamlined approach ensures a better, more secure, and cost-effective link management experience.

## 1.6 Cost estimation

The TinyBridge platform is a student-led project leveraging open-source technologies and free development frameworks. Below is a detailed breakdown of estimated costs.

### 1.6.1 Development Costs

| Category | Details | Estimated Cost |
|----------|---------|----------------|
| Development Tools & Frameworks | Vue3, Vite, Node.js, TypeScript, PostgreSQL, SQLite | $0 |
| Version Control & Collaboration | GitHub (free for student projects) | $0 |

### 1.6.2 Hosting and Infrastructure

| Category | Details | Estimated Cost |
|----------|---------|----------------|
| Server Hosting | Cloud hosting for web application and database | $5 - $10/month |
| Domain Registration | Custom domain for branding | $10 - $20/year |
| SSL Certificate | Secure HTTPS (Let's Encrypt free) | $0 - $10/year |
| Storage & CDN | Cloud storage for landing page and images | $0 - $15/month |

### 1.6.3 Marketing and Promotion

| Category | Details | Estimated Cost |
|----------|---------|----------------|
| Campus Promotion | Posters, flyers, student group collaborations | $0 |
| Online Marketing | Optional online ads (WeChat, Douyin, Google) | $0 - $50/month |

### 1.6.4 Miscellaneous Costs

| Category | Details | Estimated Cost |
|----------|---------|----------------|
| Miscellaneous | API credits, feature enhancements, plugins | $0 - $10/month |

### 1.6.5 Total Cost Estimate

| Cost Breakdown | Monthly Estimate | Annual Estimate |
|----------------|------------------|-----------------|
| Low Estimate | $8/month | $115/year |
| High Estimate | $80/month | $955/year |

## 1.7 Market Research

The global URL shortener market is experiencing significant growth driven by increasing demand for branded links, campaign tracking, and mobile-first communication strategies. According to industry reports, the market was valued at USD 360.4 million in 2024 and is projected to reach USD 1,020 million by 2033, reflecting a CAGR of 11.1%. This growth is fueled by over 4.9 billion social media users globally and the expanding need for concise, trackable links. Mobile devices now account for over 60% of global web traffic, emphasizing the importance of compact, mobile-friendly URLs.

Regional analysis reveals significant opportunities in Asia-Pacific, which accounted for 36% of global market share in 2023 with the highest growth rate of 22.0% CAGR. North America remains the largest market with 30% share and 18.0% CAGR. The strong performance in Asia-Pacific validates the strategic decision to launch TinyBridge initially in the Chinese campus market.

Key market drivers include rising adoption of branded short links (growing at 18% CAGR), increasing need for real-time analytics in marketing campaigns, and growing awareness of privacy compliance requirements such as GDPR and CCPA. Leading players include Bitly (dominant in enterprise segment), TinyURL (popular for casual personal use), Rebrandly, Ow.ly, BL.INK, Short.io, and Replug.io.

> Picture 1-1: Global URL Shortener Market Size, 2024-2033 (in USD Million)
> Picture 1-2: Regional Market Distribution - Asia-Pacific (36%, CAGR 22.0%), North America (30%, CAGR 18.0%)

# Chapter 2: Requirements Engineering

## 2.1 Functional Requirements

In order to realize a complete short-link management platform, the project team conducted thorough research and analysis. It was agreed that the platform should have the following features.

### 2.1.1 Login and Registration

The platform shall allow users to register and record their basic information, and verify the identity of users after login. The authentication mechanism employs JWT (JSON Web Token) to ensure secure and stateless user sessions. User passwords are hashed using the Argon2 algorithm, which is recognized as the winner of the 2019 Password Hashing Competition, providing robust protection against rainbow table attacks and brute-force attempts. To further enhance security, the platform implements login failure rate limiting, restricting users to a maximum of 5 failed login attempts per hour to prevent credential stuffing attacks.

> Picture 2-1: Business process models of login and registration
> 图 2-1：登录与注册的业务流程模型图

> Picture 2-2: Use case diagram of login and registration
> 图 2-2：登录与注册的用例图

| User case Name | Information |
|---------------|-------------|
| **Actors** | User<br>Backend Server<br>Database |
| **Preconditions** | Users enter the platform for the first time or<br>The front-end of the browser does not have the token |
| **Basic Flow** | 1. The user enters the account and password to initiate a login/registration request to the back-end<br>2. The back end receives the login request and login success, returns the token to the user<br>3. After receiving the registration request successfully, the back end adds user information to the database |
| **Alternative Flow** | 1a. The account and password entered by the user do not meet the regular expression requirements and need to be re-entered<br>2a. After receiving the login request, the backend fails to log in and needs to log in again<br>3a. The back end received the registration request but failed to register, the user name may have been occupied |
| **Postconditions** | 1. The end of login condition is that the token is stored in the user's front-end<br>2. The end of registration condition indicates that the user information is stored in the database |

> Picture 2-3: Description of login and registration use case diagram
> 图 2-3：登录与注册用例图描述表

### 2.1.2 Short Link Creation and Management

Users can create short links by providing their original URLs through the platform, with support for both random generation and custom short codes. The platform employs a Base62 encoding algorithm to generate compact short codes consisting of 6-8 characters using alphanumeric characters (0-9, a-z, A-Z), ensuring a balance between brevity and collision resistance. To prevent duplicate short codes, the system integrates a Bloom Filter data structure that enables O(1) time complexity lookups with a false positive rate below 0.01%, significantly reducing unnecessary database queries. The generated short links are cached in Redis with their corresponding original URLs, enabling millisecond-level redirect response times of less than 100ms. Users can customize their short links with custom domains, path prefixes, and expiration times, providing flexibility for branding and campaign management needs.

> Picture 2-4: Business process models of short link creation and management
> 图 2-4：短链接创建与管理的业务流程模型图

> Picture 2-5: Use case diagram of short link creation and management
> 图 2-5：短链接创建与管理的用例图

| User case Name | Information |
|---------------|-------------|
| **Actors** | User<br>Backend Server<br>Database<br>Redis Cache<br>Bloom Filter |
| **Preconditions** | The user is logged in and has the token, and the users want to create a new short link |
| **Basic Flow** | 1. Users click on "Create New Link" and input the original URL to initiate a creation request<br>2. The backend receives the request and generates a short code using Base62 encoding<br>3. The system checks the Bloom Filter to verify short code uniqueness<br>4. The backend stores the link mapping in the database and caches it in Redis<br>5. The system returns the generated short link to the user |
| **Alternative Flow** | 1a. The original URL format validation fails and needs to be re-entered<br>2a. Custom short code is requested by the user instead of random generation<br>3a. Bloom Filter detects potential collision, regenerate a new short code<br>4a. Database write fails due to actual collision, retry with new short code |
| **Postconditions** | 1. The short link mapping is stored in the database<br>2. The link is cached in Redis with TTL of 24 hours<br>3. The Bloom Filter is updated with the new short code |

> Picture 2-6: Description of short link creation and management use case diagram
> 图 2-6：短链接创建与管理用例图描述表

### 2.1.3 QR Code Generation

Users can generate QR codes for any short link through the platform, enabling seamless offline-to-online transitions. The QR code generation is implemented entirely on the client-side using JavaScript libraries such as `qrcode.js` or `vue-qrcode`, eliminating the need for backend storage and reducing server load. This approach creates dynamic QR codes where the short link serves as the encoded data—when users scan the QR code, they are redirected to the short link URL, which then forwards them to the final destination. Consequently, if the target URL of a short link is modified, the existing QR code remains valid without regeneration. Users can customize QR code appearance with options for color schemes, size dimensions (ranging from 128x128 to 512x512 pixels), and error correction levels (L, M, Q, H) to balance scan reliability with visual density. The generated QR codes can be downloaded in multiple formats including PNG for general use and SVG for scalable vector graphics suitable for print materials.

> Picture 2-7: Business process models of QR code generation
> 图 2-7：QR 码生成的业务流程模型图

> Picture 2-8: Use case diagram of QR code generation
> 图 2-8：QR 码生成的用例图

| User case Name | Information |
|---------------|-------------|
| **Actors** | User<br>Frontend Application<br>Short Link |
| **Preconditions** | The user has created a short link and navigated to the link detail page |
| **Basic Flow** | 1. Users click on "Generate QR Code" button on the link detail page<br>2. The frontend application reads the short link URL<br>3. The QR code library (qrcode.js) generates the QR code image in the browser<br>4. The system displays the QR code preview to the user<br>5. Users can download the QR code in their preferred format (PNG/SVG) |
| **Alternative Flow** | 1a. Users customize QR code style (color, size, error correction level)<br>2a. Users preview the customized QR code before downloading<br>3a. Users choose different download formats (PNG for web, SVG for print) |
| **Postconditions** | 1. The QR code is displayed in the browser<br>2. The QR code file is downloaded to the user's device if download is triggered<br>3. No data is stored on the backend (client-side generation only) |

> Picture 2-9: Description of QR code generation use case diagram
> 图 2-9：QR 码生成用例图描述表

### 2.1.4 Click Statistics and Analysis

The platform provides comprehensive click analytics and data visualization to help users understand link performance and audience behavior. The system tracks real-time statistics including total click count and unique visitor count (deduplicated by anonymized IP hashes). Geographic distribution analysis is powered by GeoIP libraries such as `geoip-lite` or `@maxmind/geoip2-node`, which parse IP addresses to determine visitor locations by country and city without storing personally identifiable information. Device type analysis categorizes traffic into mobile, desktop, and tablet segments through User-Agent string parsing, while browser and operating system distributions identify specific platforms (Chrome, Firefox, Safari, Edge on Windows, macOS, Linux, iOS, Android). Referrer analysis tracks traffic sources to identify which websites or platforms are driving clicks. Time-based trend analysis aggregates click data by day, week, and month, visualized through interactive charts powered by Chart.js or ECharts libraries. To ensure privacy compliance with GDPR and CCPA regulations, all IP addresses are immediately hashed using SHA256 before storage, making them irreversible while still allowing geographic analysis. Click logging is implemented asynchronously to avoid blocking the redirect response, ensuring that analytics collection does not impact the sub-100ms redirect performance target.

> Picture 2-10: Business process models of click statistics and analysis
> 图 2-10：点击统计与分析的业务流程模型图

> Picture 2-11: Use case diagram of click statistics and analysis
> 图 2-11：点击统计与分析的用例图

| User case Name | Information |
|---------------|-------------|
| **Actors** | User<br>Analytics Module<br>Database<br>Redis Cache<br>GeoIP Library |
| **Preconditions** | The user has created a short link and the link has received click traffic |
| **Basic Flow** | 1. Users navigate to the analytics dashboard for a specific short link<br>2. The analytics module queries click logs from the database<br>3. The system aggregates data by time period, location, device type, and referrer<br>4. GeoIP library parses anonymized IP hashes to determine geographic distribution<br>5. The system generates interactive charts (line charts for trends, pie charts for distributions)<br>6. The analytics dashboard displays real-time statistics and visualizations to the user |
| **Alternative Flow** | 1a. For high-traffic links, the system retrieves pre-aggregated data from Redis cache<br>2a. Users select different time ranges (last 7 days, 30 days, custom range)<br>3a. Users export analytics data as CSV or JSON for external analysis<br>4a. Real-time analytics update automatically every 30 seconds using WebSocket (optional future feature) |
| **Postconditions** | 1. Analytics data is displayed in the user's dashboard<br>2. Click logs are stored in the database with anonymized IP hashes<br>3. Aggregated statistics are cached in Redis for 1 hour to improve query performance |

> Picture 2-12: Description of click statistics and analysis use case diagram
> 图 2-12：点击统计与分析用例图描述表

### 2.1.5 Batch Operations via API

The platform provides a comprehensive RESTful API to support batch operations, enabling users to automate link management workflows and integrate TinyBridge with external systems. Users can perform batch link creation by uploading CSV or JSON files containing multiple URLs, which the system processes asynchronously to generate corresponding short links. Conversely, batch export functionality allows users to download their link data including statistical metrics in CSV or JSON formats for offline analysis or backup purposes. API key management is handled through a secure interface where users can create, revoke, and refresh API keys with configurable permission levels—read-only keys can only query data, while read-write keys can create and modify links. All API keys are hashed using SHA256 before storage, ensuring that even database compromise would not expose raw keys. API authentication follows industry standards, requiring clients to include the API key in the request header as `Authorization: Bearer <api_key>`. To prevent abuse and ensure fair resource allocation, the platform implements rate limiting using Redis-backed sliding window algorithm, restricting each API key to 1,000 requests per hour. When rate limits are exceeded, the API returns a 429 Too Many Requests status code with a Retry-After header indicating when the client can resume requests.

> Picture 2-13: Business process models of batch operations via API
> 图 2-13：批量操作与 API 管理的业务流程模型图

> Picture 2-14: Use case diagram of batch operations via API
> 图 2-14：批量操作与 API 管理的用例图

| User case Name | Information |
|---------------|-------------|
| **Actors** | User<br>API Gateway<br>Backend Server<br>Redis (Rate Limiter)<br>Database |
| **Preconditions** | The user has generated a valid API key with appropriate permissions |
| **Basic Flow** | 1. Users make an API request with the API key in the Authorization header<br>2. The API Gateway validates the API key against the database<br>3. The rate limiter checks if the request count is within limits (1,000 requests/hour)<br>4. The backend server processes the batch operation (import/export links)<br>5. For batch import, the system validates each URL and generates short codes<br>6. The API returns the operation results with success/failure details for each item |
| **Alternative Flow** | 1a. API key is invalid or expired, return 401 Unauthorized<br>2a. Rate limit exceeded, return 429 Too Many Requests with Retry-After header<br>3a. Batch import contains invalid URLs, mark those items as failed but process valid ones<br>4a. User requests to revoke an API key, immediately invalidate it in Redis cache |
| **Postconditions** | 1. Batch operation results are returned to the user<br>2. For imports, new short links are created in the database<br>3. For exports, link data is formatted and returned as CSV/JSON<br>4. API request count is incremented in Redis with 1-hour TTL |

> Picture 2-15: Description of batch operations via API use case diagram
> 图 2-15：批量操作与 API 管理用例图描述表

### 2.1.6 Landing Page Editing

Users can create customized landing pages for their short links to provide richer content presentation beyond simple URL redirection. To lower the barrier to entry, the platform provides a template-based editing system where users can select from a curated library of pre-designed templates for common use cases such as product introductions, event promotions, form collection, and announcement pages. Each template features a user-friendly form-based editor where users can modify text content, upload images, adjust colors, and configure call-to-action buttons without writing any code. For advanced users who require greater customization, an optional code editor powered by Monaco Editor (the same editor used in Visual Studio Code) is available to directly modify the underlying HTML and CSS. The editing interface includes a real-time preview pane implemented using an iframe that synchronously displays changes as users edit, ensuring what-you-see-is-what-you-get accuracy. All templates are designed with responsive layouts using TailwindCSS, automatically adapting to mobile and desktop screen sizes. Once editing is complete, users can publish the landing page with a single click, making it accessible via the route `/l/:short_code` (distinct from the redirect route `/:short_code`). Published landing pages are stored in the database's `landing_pages` table and rendered server-side when accessed. Users can unpublish landing pages at any time, reverting the short link to standard redirect behavior, or export the landing page HTML for use on external platforms.

> Picture 2-16: Business process models of landing page editing
> 图 2-16：落地页编辑的业务流程模型图

> Picture 2-17: Use case diagram of landing page editing
> 图 2-17：落地页编辑的用例图

| User case Name | Information |
|---------------|-------------|
| **Actors** | User<br>Landing Page Editor<br>Backend Server<br>Database<br>Template Library |
| **Preconditions** | The user has created a short link and navigated to the landing page editor |
| **Basic Flow** | 1. Users click "Create Landing Page" and browse the template library<br>2. Users select a template that matches their use case (e.g., product page, event page)<br>3. The editor loads the template with a form-based interface for content customization<br>4. Users modify text, upload images, and adjust styling through the visual editor<br>5. The real-time preview pane displays changes synchronously in an iframe<br>6. Users click "Publish" to save the landing page to the database<br>7. The landing page becomes accessible via /l/:short_code route |
| **Alternative Flow** | 1a. Advanced users switch to code editor mode (Monaco Editor) for HTML/CSS customization<br>2a. Users unpublish the landing page, reverting to standard redirect behavior<br>3a. Users export the landing page HTML for external use<br>4a. Users duplicate an existing landing page to create a new variant |
| **Postconditions** | 1. The landing page HTML and CSS are stored in the database<br>2. Accessing /l/:short_code renders the custom landing page<br>3. The short link can toggle between redirect mode and landing page mode |

> Picture 2-18: Description of landing page editing use case diagram
> 图 2-18：落地页编辑用例图描述表

## 2.2 Non-functional Requirements

The system not only needs to realize the functional requirements required by users, but also needs to complete the non-functional requirements to maintain the stable operation of the system. For the TinyBridge platform, the requirements for non-functional requirements are as follows:

### 2.2.1 Performance Requirements

**Response time**: The platform prioritizes redirect performance as its core metric. Short link redirection response time must be maintained under 100 milliseconds at the 95th percentile, achieved through Redis caching of URL mappings and Bloom Filter optimization for short code lookups. This ensures users experience seamless transitions with minimal latency. Page load time for the web application should remain under 2 seconds, optimized through Vite's build system with code splitting and lazy loading. Data analysis query response times should not exceed 2 seconds even when processing large click log datasets, accomplished through PostgreSQL indexing strategies and Redis-cached aggregated statistics.

**Concurrent processing capability**: The platform must be able to support a sustained throughput of 5,000 requests per second to handle traffic spikes during marketing campaigns or viral link sharing. The backend should demonstrate horizontal scalability, allowing additional server instances to be deployed behind a load balancer to increase capacity linearly.

**Transaction processing capability**: The platform should efficiently process batch operations, supporting the import of up to 1,000 links in a single API request with asynchronous processing to prevent timeout errors.

### 2.2.2 Scalability Requirements

**Horizontal expansion**: The platform architecture is designed to support horizontal scaling by deploying multiple stateless backend instances behind a load balancer such as Nginx or Caddy. All session data is stored in Redis rather than in-memory, ensuring that any server instance can handle any request without session affinity requirements.

**Redis caching**: Multi-layer caching strategies are implemented to optimize performance. The primary cache layer stores short code to original URL mappings with a 24-hour Time-To-Live (TTL), ensuring that 99% of redirects are served from cache without database queries. A secondary cache layer stores pre-aggregated analytics data with a 1-hour TTL, reducing database load for frequently accessed statistics.

**Bloom Filter optimization**: A Bloom Filter data structure is employed to quickly determine whether a short code exists before querying the database, providing O(1) time complexity lookups with a configurable false positive rate below 0.01%. This dramatically reduces unnecessary database queries during short code generation and validation.

**Database expansion**: The platform supports seamless migration from SQLite (used in development for rapid iteration) to PostgreSQL (used in production for robustness and scalability). The Object-Relational Mapping (ORM) framework such as Prisma or TypeORM abstracts database-specific syntax, enabling this migration with minimal code changes. PostgreSQL's support for read replicas allows the platform to scale read operations independently of write operations.

### 2.2.3 Security Requirements

**Data encryption**: Sensitive data such as users' personal information and API keys are encrypted during transmission using TLS 1.3 and stored securely using industry-standard hashing algorithms. User passwords are hashed with Argon2, the winner of the 2019 Password Hashing Competition, using a memory-hard algorithm resistant to GPU-based cracking attacks. API keys are hashed with SHA256 before storage, ensuring that even database compromise would not expose raw keys.

**Identity authentication**: The platform uses JWT (JSON Web Token) authentication mechanism to verify user identity during login and subsequent API requests. Access tokens have a 24-hour expiration period, while refresh tokens remain valid for 7 days, striking a balance between security and user convenience. Failed login attempts are rate-limited to 5 attempts per hour per IP address to prevent credential stuffing attacks.

**Malicious URL detection**: To prevent the platform from being abused for phishing or malware distribution, all submitted URLs are validated against Google Safe Browsing API or similar threat intelligence services before short link creation. URLs flagged as malicious are rejected with an error message explaining the security concern.

**XSS and SQL Injection prevention**: The frontend implements Content Security Policy (CSP) headers to prevent cross-site scripting attacks. The backend uses parameterized queries through the ORM framework, eliminating the possibility of SQL injection vulnerabilities. All user-generated content displayed in landing pages is sanitized using DOMPurify to strip potentially malicious scripts.

**IP anonymization**: To comply with GDPR and CCPA privacy regulations, all IP addresses collected for analytics purposes are immediately hashed using SHA256 with a daily-rotated salt before storage. This irreversible anonymization allows geographic analysis via GeoIP libraries while preventing the identification of individual users. The original IP addresses are never persisted to disk.

**API rate limiting**: Each API key is subject to a rate limit of 1,000 requests per hour, enforced using a Redis-backed sliding window algorithm. When limits are exceeded, the API returns HTTP 429 Too Many Requests with a Retry-After header, allowing clients to implement intelligent backoff strategies.

### 2.2.4 Availability Requirements

**System availability**: The system should ensure 99.5% availability, meaning the cumulative downtime should not exceed 43.8 hours per year (approximately 3.65 hours per month). This is achieved through redundant deployment across multiple availability zones, automated health checks, and graceful degradation strategies where non-critical features can fail independently without affecting core redirect functionality.

**Fault recovery**: When a system failure occurs, the platform's monitoring infrastructure should detect the issue within 5 minutes through health check endpoints and automated alerting. The operations team targets a recovery time objective (RTO) of 2 hours for critical system restoration. All logs are centralized using a logging aggregation system to facilitate rapid troubleshooting and root cause analysis.

**Monitoring and observability**: The platform integrates with monitoring solutions such as Prometheus for metrics collection and Grafana for visualization dashboards. Key metrics tracked include request latency histograms, error rates, cache hit ratios, database query performance, and API rate limit violations. Error tracking services like Sentry capture and aggregate application exceptions for proactive issue resolution.

### 2.2.5 Maintainability Requirements

**Code readability**: The entire codebase is written in TypeScript, providing static type checking that catches errors during development rather than runtime. This significantly improves code maintainability by making function signatures and data structures self-documenting. The project follows consistent coding conventions enforced by ESLint and automatically formatted by Prettier.

**ORM framework**: Database operations are performed through an ORM framework such as Prisma or TypeORM, which provides type-safe database queries and automatic migration generation. This abstraction layer makes it straightforward to modify the database schema as requirements evolve, with the ORM handling the migration scripts automatically.

**Modular design**: The backend follows a three-layer architecture separating Controllers (request handling), Services (business logic), and Repositories (data access). This separation of concerns makes it easy to modify or replace individual components without affecting others. The frontend follows component-based architecture with Vue3's Composition API, enabling logic reuse through composables.

**Log system**: A structured logging system using Winston or Pino records all system operations, errors, and performance metrics. Logs are formatted in JSON for easy parsing and analysis, with appropriate log levels (debug, info, warn, error) to filter noise. Sensitive information such as passwords and API keys are automatically redacted from logs.

### 2.2.6 Compatibility Requirements

**Cross-platform support**: The web application runs properly on mainstream operating systems including Windows, macOS, and Linux. Server-side components are containerized using Docker, ensuring consistent behavior across different deployment environments.

**Browser compatibility**: The frontend supports all major modern browsers including Chrome, Firefox, Safari, and Edge, specifically targeting the latest two major versions of each. The application uses progressive enhancement, ensuring core functionality remains available even if advanced features are not supported in older browsers.

**Responsive design**: The user interface is built with TailwindCSS utility classes that implement responsive breakpoints, automatically adapting layouts for mobile devices (< 640px), tablets (640px-1024px), and desktop screens (> 1024px). All interactive elements meet touch target size requirements (minimum 44x44 pixels) for mobile usability.

### 2.2.7 Usability Requirements

**User interface ease of use**: The UI is designed following modern design principles with TailwindCSS for styling and Headless UI for accessible, unstyled components. The interface prioritizes clarity and task completion efficiency, with common actions (creating links, viewing analytics) accessible within two clicks from the dashboard.

**One-click copy functionality**: Short links feature a one-click copy button implemented using the Clipboard API or clipboard.js library, providing instant visual feedback when URLs are copied to the clipboard. This eliminates the friction of manual text selection and copying.

**Batch import and export**: Users can upload CSV or JSON files containing hundreds of URLs for batch link creation, and export their link data in the same formats for backup or analysis in external tools like Excel or Google Sheets.

**Keyboard shortcuts**: Power users can navigate the application efficiently using keyboard shortcuts such as Ctrl+K (Cmd+K on macOS) to open the command palette for quick link search, Ctrl+N for creating new links, and Escape to close modal dialogs.

### 2.2.8 Reliability Requirements

**Data consistency**: The platform ensures ACID (Atomicity, Consistency, Isolation, Durability) properties for all database transactions using PostgreSQL's transactional guarantees. When system failures or network anomalies occur, the database maintains consistency without orphaned records or incomplete operations. Critical operations such as link creation are wrapped in transactions to ensure all-or-nothing semantics.

**Backup mechanism**: The database is automatically backed up using a two-tier strategy. Incremental backups are performed daily, capturing only changes since the last backup, with a retention period of 7 days. Full backups are performed weekly with a retention period of 4 weeks. Backups are stored in geographically separate locations from the primary database to protect against regional failures.

**Disaster recovery**: The platform supports Point-in-Time Recovery (PITR) capabilities, allowing restoration to any moment within the backup retention period. This enables recovery from data corruption or accidental deletion by restoring to a state immediately before the incident occurred. Regular backup restoration tests are performed quarterly to validate recovery procedures.

---

# Chapter 3: System Design

## 3.1 User Stories

Jack is a third-year computer science student at South China Normal University (SCNU) and the team leader of a course project for the Software Engineering course. His team is organizing a campus-wide programming competition to promote technical culture and attract new members to their student technology club. As the project leader, Jack faces a challenge: managing promotional links across multiple channels including WeChat, student forums, QQ groups, email newsletters, and physical posters. Each channel requires different URL formats, and Jack needs to track which channels are most effective.

Jack discovers TinyBridge through a recommendation from a senior student. After registering an account with his SCNU email and logging in, Jack is ready to explore the platform's features.

On the dashboard, Jack clicks "Create New Link" and enters the competition registration page URL. The long URL with UTM parameters is unsuitable for sharing in WeChat posts with character limits. Within seconds, the system generates his first short link: `https://tinybridge.link/aB3xY9`. Jack quickly creates four more short links for different promotional channels—each pointing to the same registration page but with different UTM parameters to track traffic sources.

For the physical posters around campus, Jack needs QR codes. He navigates to one of his short links and clicks "Generate QR Code". The platform instantly renders a QR code preview in the browser. Jack customizes the appearance by selecting the school's blue color and downloads it as a high-resolution PNG file suitable for printing. The entire process takes less than 10 seconds. Jack appreciates that if he later updates the target URL, the QR codes will remain valid without reprinting.

As the campaign progresses, Jack realizes he needs to create short links for 50 team members' referral codes to track recruitment effectiveness. Instead of manually creating each link, he navigates to the API Keys section and generates an API key. Using the TinyBridge API, Jack writes a simple script that batch-creates all 50 links from a CSV file in under 5 seconds, then distributes them to team members via a shared spreadsheet.

Two weeks into the campaign, Jack wants to evaluate performance. The analytics dashboard reveals that his WeChat link received over 1,200 clicks, while the QQ group link received only 230 clicks—surprising Jack, as he had assumed QQ would be more effective. The system displays interactive charts showing click trends, geographic distribution, device types, and peak activity times. This data helps Jack optimize future social media posts for maximum visibility.

As registration nears its end, Jack creates a custom landing page using TinyBridge's template editor. He selects an "Event Promotion" template and customizes it with the competition poster, event details, testimonial cards, and a countdown timer—all without writing code. The real-time preview shows how the page will appear on different devices. After publishing, visitors to his short link see the engaging landing page before being redirected to registration, resulting in significantly lower bounce rates.

By the end of the campaign, TinyBridge has helped Jack's team create and manage 67 short links, generate 15 QR codes, process over 3,200 clicks, and identify WeChat as the most effective promotional channel. The programming competition attracts 156 registered participants, making it the largest technical event in SCNU's history. Jack successfully completes his Software Engineering course project with an A grade, and his instructor praises the data-driven approach to campaign management. Reflecting on the experience, Jack realizes that TinyBridge didn't just simplify link management—it provided actionable insights that transformed his team's promotional strategy from guesswork into data-driven decision-making.

## 3.2 Software Architectural

> Picture 3-1: Software Architectural Context Model
> 图 3-1：软件架构上下文模型图

> Picture 3-2: Description of the Context Model of TinyBridge System
> 图 3-2：TinyBridge 系统上下文模型描述表

The TinyBridge platform adopts a three-tier architecture to organize the system, separating presentation, business logic, and data access layers. The frontend is built with Vue3, Vite, and TailwindCSS, providing a responsive single-page application that communicates with the backend through RESTful APIs. The backend is implemented using Node.js with TypeScript and Express or Fastify framework, ensuring type safety and high performance.

The platform employs a Controller-Service-Repository pattern for backend organization. Controllers handle HTTP requests and input validation, Services contain business logic for link generation, analytics processing, and landing page management, and Repositories manage database operations through an ORM framework such as Prisma or TypeORM. This separation of concerns makes the codebase maintainable and testable.

For data persistence, the platform uses SQLite during development for rapid iteration and PostgreSQL in production for robustness and scalability. A multi-layer caching strategy is implemented with Redis to optimize performance: the primary cache stores short code to original URL mappings with 24-hour TTL, while the secondary cache stores pre-aggregated analytics data with 1-hour TTL. A Bloom Filter data structure provides O(1) collision detection during short code generation, dramatically reducing unnecessary database queries.

The system architecture supports horizontal scaling by deploying multiple stateless backend instances behind a load balancer such as Nginx or Caddy. All session data is stored in Redis rather than in-memory, ensuring that any server instance can handle any request without session affinity requirements. This design allows the platform to scale linearly by adding more server instances as traffic grows.

> Picture 3-3: The Architecture Diagram of TinyBridge Platform
> 图 3-3：TinyBridge 平台架构图

## 3.3 The Data Model in the Database

> Picture 3-4: E-R Diagram of Database Data Model
> 图 3-4：数据库数据模型 E-R 图

The TinyBridge platform employs a relational database design with six core entities to manage users, short links, analytics data, landing pages, API keys, and team collaboration features. The database schema is designed to support efficient querying, data integrity through foreign key constraints, and scalability through proper indexing.

The **User** entity stores user personal information including username, email, and password hash encrypted using the Argon2 algorithm. Each user can create multiple short links and API keys, establishing one-to-many relationships with the ShortLink and APIKey entities.

The **ShortLink** entity is the core of the platform, storing the mapping between short codes and original URLs. Each short link belongs to a specific user and optionally to a team for collaborative management. The entity includes fields for custom domains, custom paths, expiration dates, click counts, and active status. Indexes are created on the short_code column to ensure fast lookups during URL redirection.

The **ClickLog** entity records detailed analytics data for each short link access. To ensure privacy compliance with GDPR and CCPA regulations, IP addresses are immediately hashed using SHA256 before storage, making them irreversible while still allowing geographic analysis through GeoIP libraries. Each click log entry captures the timestamp, anonymized IP hash, user agent, referrer, geographic location (country and city), device type, browser, and operating system.

The **LandingPage** entity stores custom landing page content associated with short links. Each landing page has a one-to-one relationship with a ShortLink entity and contains HTML and CSS content created through the platform's template editor. This allows users to create engaging content presentation pages before redirecting visitors to the final destination URL.

The **APIKey** entity manages programmatic access to the platform's RESTful API. Each API key is hashed using SHA256 before storage and includes configurable permissions (read-only or read-write), rate limits (default 1,000 requests per hour), and expiration dates. This enables secure batch operations and integration with external systems.

The **Team** entity supports collaborative link management among multiple users. Each team has an owner and can manage multiple short links, enabling organizations and project teams to work together on link campaigns while maintaining centralized oversight.

> Picture 3-5: Interpretation of Database Entities
> 图 3-5：数据库实体解释表

| Entity | Description |
|--------|-------------|
| **User** | Stores user personal information including username, email, and password hash (Argon2). Each user can create multiple short links, API keys, and participate in teams. |
| **Team** | Stores team information for collaborative link management. Each team has an owner (user) and can manage multiple short links collectively. |
| **ShortLink** | Stores short link mappings including original URL, short code, custom domain, custom path, expiration date, click count, and active status. Indexed on short_code for fast redirection lookups. |
| **ClickLog** | Stores detailed analytics data for each link access, including timestamp, anonymized IP hash (SHA256), user agent, referrer, geographic location (country/city), device type, browser, and operating system. |
| **LandingPage** | Stores custom landing page HTML and CSS content associated with short links. Each landing page has a one-to-one relationship with a short link. |
| **APIKey** | Stores API key information for programmatic access, including hashed key (SHA256), permissions (JSON), rate limits, and expiration date. |

## 3.4 Structure of Backend

### 3.4.1 Summary

The following functions implement the platform's core features for user authentication, short link management, analytics processing, landing page creation, and team collaboration, ensuring users can create and manage short links, view detailed analytics, and customize landing pages seamlessly.

When a user creates a short link, the backend generates a unique short code using Base62 encoding, verifies uniqueness through the Bloom Filter, stores the mapping in the database, and caches it in Redis for fast redirection. The system asynchronously logs each click to the ClickLog table with anonymized IP addresses for privacy-compliant analytics.

When a user accesses the analytics dashboard, the backend retrieves click data from the database, processes it through GeoIP libraries for geographic analysis, aggregates statistics by time period and traffic source, and caches the results in Redis to ensure sub-2-second query response times for frequently accessed reports.

### 3.4.2 About User

The User module handles authentication, authorization, and profile management. Users can register with email and password, where passwords are hashed using Argon2 before storage. The login process validates credentials and issues JWT access tokens with 24-hour expiration and refresh tokens valid for 7 days. Users can view and update their profile information, manage API keys, and view their short link creation history.

> Picture 3-6: User Module Diagram
> 图 3-6：用户模块图

> Picture 3-7: User Module Sequence Diagram
> 图 3-7：用户模块时序图

### 3.4.3 About Link

The Link module is the core of the platform, managing short link creation, update, deletion, and redirection. When creating a link, the system generates a random Base62 short code or accepts a custom code from the user. The Bloom Filter checks for potential collisions before database insertion. Each short link can be configured with custom domains, expiration dates, and optional landing pages. The redirection endpoint retrieves URL mappings from Redis cache with fallback to database queries, achieving sub-100ms response times.

> Picture 3-8: Link Module Diagram
> 图 3-8：链接模块图

> Picture 3-9: Link Module Sequence Diagram
> 图 3-9：链接模块时序图

### 3.4.4 About Analytics

The Analytics module processes and aggregates click log data to provide comprehensive insights into link performance. When a short link is accessed, the system asynchronously logs detailed information including anonymized IP hash, user agent, referrer, and timestamp. The analytics endpoint queries click logs, applies GeoIP resolution for geographic data, parses user agents for device and browser detection, and aggregates data by time period. Results are cached in Redis to optimize repeated queries for the same time ranges.

> Picture 3-10: Analytics Module Diagram
> 图 3-10：分析模块图

> Picture 3-11: Analytics Module Sequence Diagram
> 图 3-11：分析模块时序图

### 3.4.5 About Landing Page

The Landing Page module allows users to create custom content presentation pages for their short links. Users select from a template library and customize content through a form-based editor or advanced Monaco Editor for HTML/CSS. The real-time preview renders changes in an iframe using the submitted HTML and CSS. Published landing pages are stored in the database and served at the `/l/:short_code` route, while the standard `/:short_code` route continues to perform direct redirection.

> Picture 3-12: Landing Page Module Diagram
> 图 3-12：落地页模块图

> Picture 3-13: Landing Page Module Sequence Diagram
> 图 3-13：落地页模块时序图

### 3.4.6 About Team

The Team module enables collaborative link management among multiple users. Team owners can invite members, assign roles, and manage shared short links. Each team has its own workspace where members can create, view, and modify links with appropriate permissions. The team dashboard provides aggregated analytics across all team links, facilitating data-driven decision-making for marketing campaigns and promotional activities.

> Picture 3-14: Team Module Diagram
> 图 3-14：团队模块图

> Picture 3-15: Team Module Sequence Diagram
> 图 3-15：团队模块时序图

## 3.5 Structure of Frontend

> Picture 3-16: Front-end Page Structure Diagram
> 图 3-16：前端页面结构图

### 3.5.1 Login Page

This page allows users to either register a new account or log in to an existing account. The registration form includes fields for username, email, and password with real-time validation for password strength and email format. The login process includes authentication to ensure the user's credentials are valid, issuing JWT tokens upon successful authentication. Users can also access a "Forgot Password" link to initiate password recovery via email verification.

### 3.5.2 Dashboard Page

This is the main page where users can view an overview of their short links with key metrics including total links created, total clicks, and top-performing links. The page features a navigation sidebar to switch between different sections like "My Links," "Analytics," "Landing Pages," "API Keys," and "Settings." A prominent "Create New Link" button allows users to quickly generate new short links. The dashboard displays links in a card or table format with sorting and filtering options.

### 3.5.3 Link Detail Page

This page displays comprehensive information about a specific short link, including the original URL, short code, creation date, expiration date, and total click count. Users can edit link properties, regenerate the short code, enable or disable the link, and delete the link permanently. The page also provides quick access to generate QR codes and create landing pages for the selected link. A real-time click counter updates as new visitors access the link.

### 3.5.4 Analytics Page

This page presents detailed analytics for individual links or aggregated data across all user links. Interactive charts powered by Chart.js or ECharts display click trends over time using line charts, geographic distribution using map visualizations, device type breakdowns using pie charts, and browser/OS statistics using bar charts. Users can filter data by date range (last 7 days, 30 days, custom range) and export analytics reports as CSV or JSON files for external analysis.

### 3.5.5 Landing Page Editor

This page provides a template-based editor for creating custom landing pages. Users browse a template library categorized by use case (product pages, event promotions, forms, announcements) and select a template to customize. The editor features a split-screen layout with a form-based customization panel on the left and a real-time preview pane on the right. Advanced users can switch to Monaco Editor mode to directly edit HTML and CSS. The preview automatically updates as users make changes, supporting both desktop and mobile viewport previews.

### 3.5.6 API Keys Management Page

This page allows users to create, view, and manage API keys for programmatic access to the platform. Users can generate new API keys with configurable permissions (read-only or read-write) and rate limits. Each API key is displayed with its creation date, expiration date, last used timestamp, and current usage statistics. Users can revoke API keys instantly, which immediately invalidates them across all systems. The page includes code examples showing how to authenticate API requests using the generated keys.

### 3.5.7 Settings Page

This page enables users to view and modify their account settings, including profile information (username, email, profile picture), password changes with current password verification, notification preferences for link expiration alerts and analytics reports, and account deletion options. Users can also configure default link settings such as default expiration periods, preferred short code generation methods (random vs. custom), and custom domain configurations. The settings are organized into tabs for easy navigation between different configuration categories.

## 3.6 Non-functional Requirements Implementation Mapping

This section establishes the bridge between non-functional requirements defined in Chapter 2.2 and their concrete technical implementations in the TinyBridge architecture. Each requirement is mapped to specific technologies, design patterns, and monitoring strategies to ensure the platform meets its quality attributes.

### 3.6.1 Performance Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **Redirect response time < 100ms (95th percentile)** | • Redis caching with 24-hour TTL for URL mappings<br>• Bloom Filter for O(1) short code existence check<br>• Database indexing on `short_code` column (B-tree index)<br>• Connection pooling to reduce database handshake overhead | • Prometheus histogram metrics tracking p50, p95, p99 latencies<br>• Grafana dashboard with real-time latency monitoring<br>• Load testing with Apache JMeter (5,000 req/s) |
| **Page load time < 2 seconds** | • Vite build optimization with code splitting<br>• Lazy loading for non-critical components<br>• TailwindCSS purge unused styles in production<br>• CDN delivery for static assets<br>• Gzip/Brotli compression for responses | • Lighthouse performance audits (target score > 90)<br>• WebPageTest measurements from multiple geographic locations<br>• Real User Monitoring (RUM) with browser timing API |
| **Analytics query response < 2 seconds** | • PostgreSQL indexing on `click_logs` table (timestamp, link_id)<br>• Redis caching for pre-aggregated statistics (1-hour TTL)<br>• Asynchronous query processing for large datasets<br>• Pagination for result sets > 1,000 records | • Query execution time logging<br>• Slow query log analysis (threshold: 1 second)<br>• Database EXPLAIN ANALYZE for optimization |
| **Concurrent throughput: 5,000 requests/second** | • Horizontal scaling with multiple Node.js instances<br>• Nginx load balancer with least-connections algorithm<br>• Stateless backend design (session data in Redis)<br>• Non-blocking I/O with async/await patterns | • Load testing with k6 or Artillery<br>• CPU and memory profiling under load<br>• Auto-scaling triggers based on CPU > 70% |

### 3.6.2 Scalability Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **Horizontal expansion** | • Stateless backend instances (no in-memory sessions)<br>• Redis for shared session storage<br>• Load balancer health checks (HTTP /health endpoint)<br>• Docker containerization for consistent deployment | • Deployment testing: add/remove instances without downtime<br>• Session persistence testing across multiple servers<br>• Load distribution monitoring (variance < 10%) |
| **Multi-layer caching** | • **L1 Cache:** In-memory LRU cache (Node.js Map, 10,000 entries)<br>• **L2 Cache:** Redis cluster with persistence (RDB + AOF)<br>• Cache invalidation strategy: TTL + manual purge API<br>• Cache warming for popular links on startup | • Cache hit ratio monitoring (target > 95%)<br>• Cache memory usage alerts<br>• Invalidation latency measurement |
| **Bloom Filter optimization** | • Bloom Filter library: `bloomfilter.js` or custom implementation<br>• False positive rate: 0.01% (1 in 10,000)<br>• Periodic rebuild from database (daily at 3 AM)<br>• Memory footprint: ~10 MB for 1 million short codes | • False positive rate monitoring<br>• Bloom Filter size vs. actual records comparison<br>• Rebuild performance testing |
| **Database scalability** | • ORM abstraction layer (Prisma/TypeORM)<br>• Connection pooling (max: 20 connections)<br>• Read replicas for analytics queries (PostgreSQL streaming replication)<br>• Partitioning for `click_logs` table by timestamp (monthly partitions) | • Read/write query distribution monitoring<br>• Replication lag tracking (target < 1 second)<br>• Partition pruning effectiveness testing |

### 3.6.3 Security Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **Password encryption** | • Argon2id hashing algorithm<br>• Memory cost: 64 MB, Time cost: 3 iterations, Parallelism: 4<br>• Per-user random salt (16 bytes)<br>• No password storage in plain text or reversible encryption | • Password hashing benchmark (target: 200-500ms per hash)<br>• Salt uniqueness verification<br>• Penetration testing with common password lists |
| **JWT authentication** | • Access token expiration: 24 hours<br>• Refresh token expiration: 7 days<br>• HMAC-SHA256 signing with 256-bit secret key<br>• Token payload: user_id, role, issued_at, expires_at<br>• Refresh token rotation on each use | • Token expiration testing<br>• Signature verification testing<br>• Token revocation API endpoint testing |
| **Rate limiting** | • Redis-backed sliding window algorithm<br>• Login attempts: 5 per hour per IP<br>• API requests: 1,000 per hour per API key<br>• HTTP 429 response with Retry-After header | • Rate limit bypass testing<br>• Distributed rate limiter consistency (multiple servers)<br>• Retry-After header validation |
| **Malicious URL detection** | • Google Safe Browsing API integration<br>• URL validation regex (protocol, domain, path)<br>• Blacklist of known phishing domains (updated weekly)<br>• Asynchronous scanning to avoid blocking link creation | • False positive/negative rate monitoring<br>• API response time measurement<br>• Blacklist update automation testing |
| **XSS and SQL Injection prevention** | • Content Security Policy (CSP) headers<br>• DOMPurify sanitization for user-generated HTML<br>• Parameterized queries via ORM (no raw SQL)<br>• Input validation with Joi/Zod schemas | • OWASP ZAP automated security scanning<br>• Manual injection testing with payloads<br>• CSP violation reporting |
| **IP anonymization** | • SHA256 hashing with daily-rotated salt<br>• Salt rotation at 00:00 UTC<br>• GeoIP resolution before hashing<br>• Original IP never persisted to disk | • GDPR compliance audit<br>• Irreversibility testing (rainbow table resistance)<br>• Geographic accuracy validation |

### 3.6.4 Availability Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **99.5% uptime (43.8 hours downtime/year)** | • Multi-instance deployment across availability zones<br>• Database replication (primary + standby)<br>• Graceful degradation (analytics failure doesn't affect redirects)<br>• Circuit breaker pattern for external dependencies | • Uptime monitoring with UptimeRobot or Pingdom<br>• Mean Time Between Failures (MTBF) tracking<br>• Chaos engineering tests (random instance termination) |
| **Fault recovery (RTO: 2 hours)** | • Automated health checks every 30 seconds<br>• Auto-restart for crashed processes (PM2/systemd)<br>• Database point-in-time recovery (PITR)<br>• Incident response runbook documentation | • Recovery drill exercises (quarterly)<br>• Health check false positive/negative analysis<br>• PITR restoration time measurement |
| **Monitoring and observability** | • Prometheus metrics collection<br>• Grafana dashboards (latency, error rate, throughput)<br>• Sentry for error tracking and alerting<br>• Structured logging with Winston/Pino (JSON format) | • Alert response time tracking<br>• Dashboard accuracy validation<br>• Log retention and search performance testing |

### 3.6.5 Maintainability Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **Code readability** | • TypeScript with strict mode enabled<br>• ESLint rules (Airbnb style guide)<br>• Prettier auto-formatting (pre-commit hook)<br>• JSDoc comments for public APIs | • Code review checklist compliance<br>• Static analysis with SonarQube (target: 0 critical issues)<br>• New developer onboarding time tracking |
| **ORM abstraction** | • Prisma for type-safe queries and migrations<br>• Migration versioning and rollback support<br>• Schema validation on application startup<br>• Database seeding scripts for testing | • Migration success rate monitoring<br>• Schema drift detection<br>• Cross-database compatibility testing (SQLite ↔ PostgreSQL) |
| **Modular design** | • Three-layer architecture (Controller → Service → Repository)<br>• Dependency injection for loose coupling<br>• Single Responsibility Principle (SRP)<br>• Interface-based abstractions for external dependencies | • Cyclic dependency detection (Madge)<br>• Code coupling metrics (< 30% coupling ratio)<br>• Unit test isolation verification |
| **Structured logging** | • JSON log format for machine readability<br>• Log levels: debug, info, warn, error<br>• Automatic PII redaction (passwords, API keys, IP addresses)<br>• Centralized logging with ELK stack or Loki | • Log parsing accuracy testing<br>• PII leak detection (automated regex scanning)<br>• Log search performance benchmarking |

### 3.6.6 Compatibility Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **Cross-platform support** | • Docker containerization with multi-stage builds<br>• Platform-agnostic file paths (Node.js `path` module)<br>• Environment variable configuration (dotenv)<br>• No OS-specific dependencies | • CI/CD testing on Windows, macOS, Linux<br>• Docker image portability testing<br>• Environment variable validation |
| **Browser compatibility** | • Babel transpilation for ES6+ features<br>• Autoprefixer for CSS vendor prefixes<br>• Progressive enhancement (core features work without JavaScript)<br>• Polyfills for missing APIs (via `core-js`) | • BrowserStack cross-browser testing<br>• Feature detection testing (Modernizr)<br>• Accessibility testing (WCAG 2.1 AA compliance) |
| **Responsive design** | • TailwindCSS responsive breakpoints (sm, md, lg, xl)<br>• Mobile-first CSS approach<br>• Touch target size: minimum 44x44 pixels<br>• Viewport meta tag configuration | • Responsive design testing (Chrome DevTools)<br>• Touch target size validation<br>• Mobile usability testing (Google Mobile-Friendly Test) |

### 3.6.7 Usability Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **One-click copy functionality** | • Clipboard API with fallback to `document.execCommand`<br>• Visual feedback (toast notification, icon change)<br>• Copy button accessibility (ARIA labels) | • Clipboard functionality testing across browsers<br>• Accessibility audit (keyboard navigation)<br>• User success rate measurement |
| **Batch import/export** | • CSV parsing with `papaparse` library<br>• JSON validation with Zod schemas<br>• Async processing for large files (> 1,000 rows)<br>• Progress indicator for long operations | • File size limit testing (10 MB max)<br>• Malformed data handling validation<br>• Export format accuracy verification |
| **Keyboard shortcuts** | • Hotkey library: `hotkeys-js` or native event listeners<br>• Command palette: Ctrl+K / Cmd+K<br>• New link: Ctrl+N / Cmd+N<br>• Keyboard shortcut help modal: Shift+? | • Keyboard navigation testing (tab order)<br>• Shortcut conflict detection<br>• User discoverability testing |

### 3.6.8 Reliability Requirements Implementation

| Non-functional Requirement | Technical Implementation | Verification Method |
|----------------------------|--------------------------|---------------------|
| **Data consistency (ACID)** | • PostgreSQL transactions for critical operations<br>• Optimistic locking for concurrent updates<br>• Foreign key constraints for referential integrity<br>• Database-level unique constraints on `short_code` | • Concurrent write testing (race condition simulation)<br>• Transaction rollback validation<br>• Constraint violation testing |
| **Backup mechanism** | • Daily incremental backups (pg_dump with --format=custom)<br>• Weekly full backups<br>• Backup retention: 7 daily + 4 weekly<br>• Offsite backup storage (AWS S3 or equivalent) | • Backup completion monitoring<br>• Backup file integrity verification (checksums)<br>• Storage cost tracking |
| **Disaster recovery (PITR)** | • PostgreSQL Write-Ahead Logging (WAL) archiving<br>• Point-in-time recovery testing scripts<br>• Recovery Point Objective (RPO): 1 hour (max data loss)<br>• Quarterly disaster recovery drills | • PITR accuracy testing (restore to specific timestamp)<br>• Recovery drill documentation<br>• RPO/RTO compliance verification |

# Chapter 4: Market Analysis

## 4.1 Background analysis

With the rapid growth of internet technology and digital communication, link sharing has become an indispensable part of online interaction. However, long URLs are often complex, difficult to remember, and visually unappealing. The proliferation of mobile devices, which now account for over 60% of global web traffic, has intensified the need for concise URLs that display properly on smaller screens.

The short-link service market has experienced remarkable expansion, growing from USD 360.4 million in 2024 with projections to reach USD 1,020 million by 2033 at an 11.1% CAGR. This growth is driven by surging social media usage (over 4.9 billion users globally), digital transformation of marketing strategies, and increasing adoption of data-driven decision-making. Emerging technological trends include AI-powered analytics that enable predictive engagement forecasting, the shift from static to dynamic QR codes (with 69% of marketers now updating QR code destinations at least monthly), and heightened privacy compliance requirements driven by GDPR and CCPA.

Universities like Ohio State University and the University of Notre Dame have established institutional short-link services to assist their communities with creating memorable URLs for marketing materials, social media campaigns, student recruitment, and event promotion. As digital content continues to expand, the need for lightweight, customizable, and cost-efficient link management solutions like TinyBridge is becoming increasingly essential.

## 4.2 Market situation

The global short-link service market has entered a steady growth phase, valued at USD 360.4 million in 2024 and expected to reach USD 1,020 million by 2033 (CAGR 11.1%). Regionally, Asia-Pacific demonstrates the strongest momentum with 22.0% CAGR and 36% market share, followed by North America at 18.0% CAGR with 30% share.

Bitly leads the enterprise segment, offering advanced analytics, custom branded domains, team collaboration features, and integrations with marketing platforms. However, Bitly's pricing creates accessibility barriers: the Growth plan ($29/month) imposes restrictive limits of only 500 links and 10 redirects per month, and the Premium plan ($199/month) gates advanced analytics behind an enterprise-level price point. TinyURL remains popular for casual personal use due to its free model, but lacks data tracking capabilities essential for professional use. Its paid tier starts at $9.99/month when billed annually.

Other significant competitors include Rebrandly (branded link management), Ow.ly (integrating with Hootsuite but limited customization), BL.INK, Short.io, and Replug.io. Regional players like China's Sina Short URL (t.cn) excel in local social platform adaptation with WeChat and Weibo compatibility, but lack advanced team collaboration functions.

Despite mature mainstream products, significant user pain points persist for university students, campus organizations, and SMEs. Free tools lack basic data tracking critical for monitoring campaign performance. Enterprise-oriented tools impose prohibitive costs; Bitly's $29/month Growth plan restriction to 500 links is particularly limiting for active campaigns. Advanced analytics requiring $199/month remain inaccessible to most campus and small business users. Furthermore, no major players offer campus-specific features such as academic event calendars or resource classification tags. This creates a clear market gap: lightweight, cost-efficient solutions balancing professional analytics, team collaboration, and campus-specific customization at accessible price points.

## 4.3 Market analysis and positioning

### 4.3.1 Large market demand

The target user base for TinyBridge primarily consists of campus organizations, small and medium-sized enterprises, and individual content creators. The potential user scale is substantial: in China alone, there are over 30 million SMEs and thousands of higher education institutions with numerous active student organizations.

Campus Project Teams need to share frequently updated resources across multiple platforms. SME Marketing Personnel require branded, trackable short links for campaigns to analyze effectiveness and maintain brand consistency. Individual Content Creators need to share concise links to improve click-through rates and user experience.

TinyBridge provides a lightweight, customizable, and cost-efficient solution addressing high costs of commercial platforms and limited functionality of free alternatives. Its support for custom domains/branded paths, batch operations via API, and integrated analytics empowers users to manage links efficiently while enhancing brand visibility.

### 4.3.2 User group analysis

**a. Campus Project Team Users**

Campus project teams consist of student organization leaders, course project coordinators, university marketing departments, and event planners who share resources frequently across multiple channels. Real-world examples from Ohio State University and Notre Dame demonstrate practical value: their short-link tools assist in creating memorable URLs for advertising materials (vanity URLs on billboards and postcards), social media campaigns, student recruitment with video campus tours, and event promotion.

The motivation centers on efficiency, professional presentation, and data-driven coordination. A typical scenario involves a student union organizing a campus festival: creating branded short links (e.g., go.scnu.edu.cn/springfest) for registration forms, distributing them across WeChat groups, printed posters, and QR codes, then monitoring click patterns to gauge interest and adjust marketing efforts.

**b. Enterprise Marketing Users**

SME marketing personnel manage brand promotion campaigns across diverse digital channels, particularly significant given that 17% of failed SME companies attribute their failure to lack of comprehensive digital marketing strategy. Their behavioral characteristics include systematic use of UTM parameters for traffic source attribution and data-driven optimization of marketing spend.

The driving motivation is ROI optimization and conversion tracking—yet current solutions fall short. While Bitly offers comprehensive analytics, the $29/month Growth plan restricts users to only 500 links and 10 redirects per month, and advanced analytics require the $199/month Premium tier. A startup's marketing manager launching a product across multiple channels might need dozens of unique branded short links with distinct UTM codes to calculate cost-per-acquisition and optimize spend allocation.

**c. Content Creator Users**

Individual content creators, including bloggers, social media influencers, and educators, prioritize simplicity, aesthetics, and credibility. With 69% of marketers now updating QR code destinations at least monthly, dynamic link management has become essential.

Content creators are motivated by audience engagement and understanding the post-click journey—an area where current tools underperform. Industry data reveals that while 54% track unique users and 50% monitor total scans, only 31% successfully monitor the post-scan customer journey, and merely 16% can directly tie links to revenue generation. An education influencer sharing course materials creates branded short links, generates dynamic QR codes for printed worksheets (allowing destination URL updates without reprinting), and tracks which traffic sources drive the most engagement.

### 4.3.3 Competitive Analysis of Porter's Five Forces Model

> Picture 4-1: Five Forces Model Diagram

**a. Existing competitors have strong competitiveness**

The market demonstrates robust growth (USD 360.4M in 2024 → USD 1,020M by 2033 at 11.1% CAGR). Competitors segment into enterprise-focused commercial platforms (Bitly, Rebrandly, BL.INK), free-with-limitations platforms (TinyURL, Ow.ly), and regional specialists (Sina Short URL).

Bitly leads the enterprise segment with comprehensive features but creates significant barriers through pricing: the Growth plan ($29/month) limits to 500 links and 10 redirects per month, and the Premium plan ($199/month) gates advanced analytics. Free platforms attract large user bases but lack comprehensive click tracking, custom domain support, and team collaboration features. Regional competitors like Sina Short URL achieve strong penetration through WeChat and Weibo integration but lack multi-user team workflows and international scalability.

**b. New entrants have moderate competitiveness**

The market shows relatively low technical barriers, requiring no particularly large capital investment for basic functionality. New entrants divide into independent developers creating niche solutions and new business lines developed by large technology companies. Independent developers pose limited threat to established players but can capture underserved segments through specialized features and cost advantages.

**c. Substitution ability of substitutes is moderate**

Several alternatives exist: direct sharing of long URLs (suffers from poor readability), platform-native sharing features (lack cross-platform consistency and analytics), QR code generation tools (don't address trackable branded short links in digital-first scenarios), and link management features within comprehensive marketing platforms (high costs and complexity unsuitable for casual or campus users). While these substitutes address specific use cases, none fully replicate the combination of simplicity, analytics, customization, and cost-effectiveness.

**d. Low to moderate bargaining power between suppliers and buyers**

On the supplier side, cloud service providers and domain registrars hold some bargaining power, but the commoditized nature of services and availability of multiple providers limit their influence. TinyBridge's multi-database support (SQLite, PostgreSQL, MySQL) and flexible deployment options reduce dependency on specific infrastructure vendors.

On the buyer side, individual users and small organizations have limited bargaining power due to low switching costs and abundance of free alternatives. However, enterprise clients with high-volume needs can negotiate custom pricing. TinyBridge's freemium model with tiered pricing addresses this dynamic.

**e. TinyBridge's competitive strategy**

Against strong commercial competitors like Bitly, we differentiate through cost-effectiveness and campus-specific features. Against free platforms like TinyURL, we compete on functionality and analytics. To defend against potential new entrants, we focus on building a loyal user community through excellent user experience and community features. Against substitutes, we emphasize the unique value proposition of dedicated short-link management: the combination of simplicity, comprehensive analytics, brand customization, and cross-platform consistency. We maintain flexibility in infrastructure to leverage competitive supplier markets while building an ecosystem around our open API to increase buyer lock-in.

# Chapter 5: Practical application and popularization

## 5.1 Practical application

As digital communication continues to evolve, campus organizations and enterprises accumulate vast amounts of shared content that often become fragmented across multiple platforms. TinyBridge provides a comprehensive solution, allowing organizations to consolidate link management, redistribute communication resources efficiently, and maintain professional branding across all channels.

TinyBridge promotes efficient digital communication and professional branding within campus and enterprise environments. By enabling links to be tracked, customized, and managed centrally, teams can make better use of digital resources and reduce the need to manually create and update links across different platforms. This aligns with principles of digital transformation and operational efficiency.

On many short-link platforms, users face challenges like limited customization, scattered analytics, and high costs for advanced features. However, TinyBridge is tailored specifically for campus and SME use, with flexible pricing options ensuring an accessible environment through tiered plans and open-source deployment options. With its built-in analytics dashboard, batch operation APIs, and visual landing-page editor, the platform provides a professional and transparent environment.

Moreover, the platform's community features offer users a space to discuss and share best practices. Beyond managing links, teams can exchange optimization strategies, share successful campaign case studies, and assist each other in improving link performance and communication effectiveness.

## 5.2 Application promotion

To ensure successful adoption, the promotion of TinyBridge must be strategically designed to demonstrate the platform's practical value for link management. Unlike services with immediately obvious benefits, short-link platforms require users to understand professional URL management advantages, making education-focused promotion essential. A combination of demonstration-driven online strategies and hands-on offline approaches can maximize visibility and user engagement.

**Online:**

1. **Demonstration-based content marketing**: Create a series of practical tutorial videos and case studies showing real campus scenarios. For example, produce step-by-step videos demonstrating how a student organization reduces their event promotion time from 2 hours to 15 minutes using TinyBridge's batch link creation and QR code generation features. Publish these tutorials on Bilibili, Douyin, and WeChat video accounts, targeting campus tech enthusiasts and student organization leaders. Include comparison demonstrations showing time and cost differences between TinyBridge and commercial platforms like Bitly, emphasizing the $199/month savings on advanced analytics that TinyBridge provides for free.

2. **Strategic partnership with campus digital services**: Collaborate with university IT departments and campus information centers to integrate TinyBridge into existing campus digital ecosystems. Propose TinyBridge as the official short-link solution for university departments (admissions office, career center, academic affairs) to generate credible use cases. When students see "go.scnu.edu.cn/admission2025" on official university materials, they'll recognize the platform's legitimacy and professionalism, driving organic adoption through institutional credibility.

3. **Interactive challenges and campaigns**: Launch a "Link Optimization Challenge" targeting student organizations planning major events (orientation week, career fairs, club recruitment). Offer free premium features for one semester to organizations that demonstrate the best use of link analytics to improve their event promotion. Document and share the winning strategies as case studies, creating a competitive yet educational atmosphere that demonstrates tangible value through peer success stories.

**Offline:**

1. **Pop-up service desks during peak campus events**: Set up TinyBridge assistance booths during high-traffic periods such as club recruitment week, career fair preparation, and academic conference seasons. Offer on-site services: instantly create custom short links for student organizations, generate branded QR codes for event posters, and provide mini-workshops on link analytics interpretation. This hands-on approach allows users to experience immediate value, converting interest into active usage within minutes rather than requiring extensive onboarding.

2. **Targeted workshops with real-world application**: Partner with student entrepreneurship centers and marketing clubs to conduct workshops specifically addressing pain points identified in market research. Workshop format: first 20 minutes presenting industry data (87% of marketers struggle with post-click journey tracking, $199/month cost barrier for advanced analytics), followed by 40 minutes of hands-on practice where participants create their own branded links, set up tracking parameters, and interpret real-time analytics dashboards. Conclude with participants creating a complete link management strategy for their upcoming events, ensuring immediate practical application of learned skills.

3. **Integration with campus printing and design services**: Collaborate with campus print shops and design studios that serve student organizations. Train print shop staff to recommend TinyBridge when students order event posters, flyers, or banners. Offer a "Print & Link" package where the print shop helps students generate appropriate short links or QR codes to include on printed materials, demonstrating the value of integrated offline-to-online transition. This creates a natural touchpoint where link management becomes part of the event planning workflow rather than an afterthought.

> Picture 5-1: Flowchart of the promotion process (Online: Tutorial content → Campus partnerships → Competition campaigns; Offline: Service booths → Hands-on workshops → Print service integration; All channels converge to platform adoption and community building)

By implementing these promotion strategies specifically designed for link management education and adoption, TinyBridge addresses the fundamental challenge that short-link services require behavioral change and user education. The promotion focuses on demonstrating concrete time savings, cost advantages, and performance improvements through experiential learning and real-world applications, ensuring users understand and appreciate the platform's value before committing to adoption. This educational approach differentiates TinyBridge from traditional service promotions by prioritizing skill development and tangible benefits demonstration over simple awareness campaigns.

# Conclusion

The TinyBridge project is proposed to meet the growing demand for professional link management among campus organizations, SMEs, and individual content creators. Our development team will use technologies like Vue3, Vite, Node.js, and TypeScript to create a user-friendly platform for managing links within campus and enterprise environments.

The platform aims to tackle key issues such as high costs of commercial solutions, limited customization in free alternatives, scattered analytics, and inefficient batch operations by offering features like custom short links, real-time analytics dashboards, batch import/export APIs, QR code generation, and visual landing-page editing. This will provide a centralized, cost-effective system for users to share content professionally and track performance effectively.

Advanced algorithms will enhance the experience, with efficient short code generation ensuring uniqueness and collision resistance, data analysis methods implementing real-time aggregation and visualized statistics, and security protection algorithms integrating malicious URL detection and IP anonymization. TinyBridge will also foster professional communication by encouraging efficient resource sharing and enabling data-driven decision-making.

Beyond link management, TinyBridge will build a sense of community, offering a space where users can share optimization strategies and foster collaborative learning. The platform's scalable design opens the door for future growth, with potential for adoption by additional institutions and enterprises. If the platform proves successful at SCNU and other pilot institutions, we plan to extend its reach to other universities and enterprises, contributing to the broader development of digital communication infrastructure and professional branding standards.
