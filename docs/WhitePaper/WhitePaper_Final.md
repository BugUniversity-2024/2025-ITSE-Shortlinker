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

Jack, a course-project lead at SCNU, faces challenges when sharing resources efficiently. He must distribute sign-up forms, slides, and materials across WeChat groups, Douyin profiles, and class forums. Long URLs hurt readability, are often truncated by character limits, and display inconsistently across platforms. QR code screenshots break when forwarded, and he lacks unified management tools, making it time-consuming to update links and respond to questions about "which link is the latest."

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
| Server Hosting | Cloud hosting for web application and database | $5 - $15/month |
| Domain Registration | Custom domain for branding | $10 - $20/year |
| SSL Certificate | Secure HTTPS (Let's Encrypt free) | $0 - $10/year |
| Storage & CDN | Cloud storage for QR codes, landing page images | $5 - $15/month |

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
| Low Estimate | $10/month | $120/year |
| High Estimate | $80/month | $960/year |

## 1.7 Market Research

The global URL shortener market is experiencing significant growth driven by increasing demand for branded links, campaign tracking, and mobile-first communication strategies. According to industry reports, the market was valued at USD 360.4 million in 2024 and is projected to reach USD 1,020 million by 2033, reflecting a CAGR of 11.1%. This growth is fueled by over 4.9 billion social media users globally and the expanding need for concise, trackable links. Mobile devices now account for over 60% of global web traffic, emphasizing the importance of compact, mobile-friendly URLs.

Regional analysis reveals significant opportunities in Asia-Pacific, which accounted for 36% of global market share in 2023 with the highest growth rate of 22.0% CAGR. North America remains the largest market with 30% share and 18.0% CAGR. The strong performance in Asia-Pacific validates the strategic decision to launch TinyBridge initially in the Chinese campus market.

Key market drivers include rising adoption of branded short links (growing at 18% CAGR), increasing need for real-time analytics in marketing campaigns, and growing awareness of privacy compliance requirements such as GDPR and CCPA. Leading players include Bitly (dominant in enterprise segment), TinyURL (popular for casual personal use), Rebrandly, Ow.ly, BL.INK, Short.io, and Replug.io.

> Picture 1-1: Global URL Shortener Market Size, 2024-2033 (in USD Million)
> Picture 1-2: Regional Market Distribution - Asia-Pacific (36%, CAGR 22.0%), North America (30%, CAGR 18.0%)

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
