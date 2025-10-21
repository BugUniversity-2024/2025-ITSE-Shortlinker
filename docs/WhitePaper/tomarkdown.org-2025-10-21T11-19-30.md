# Abstract 

This white paper mainly introduces a campus second-hand trading platform named GoodsExchange, which aims to provide a convenient trading platform for students and staff of South China Normal University (SCNU) to buy, sell or exchange idle items, promote resource reuse and support circular economy. The white paper is divided into five main sections: Software Introduction, Requirement Engineering, System Design, Market Analysis, Practical application and popularization. 

The platform adopts Vue3, Axios, Django, MySQL and other technologies to separate the front and back end structures, and uses MVC architecture to organize the system to ensure the scalability and reliability of the platform. Platform features include user registration, item uploading, browsing, instant messaging, message functionality, and non-functional requirements such as performance, security, availability, and maintainability. 3 / 30 

By providing an exclusive second-hand trading platform for the campus, GoodsExchange solves the inefficient problem of the traditional second-hand trading method, and enhances the interaction of the campus community while promoting environmental protection and saving resources. If successfully rolled out at SCNU, the platform has the potential to expand to other universities and businesses, further boosting the development of the circular economy. 

# Chapter 1 Software Introduction :

## 1.1 Project background 

To address the second-hand trading needs of SCNU students and staff, our project team developed a platform called GoodsExchange. This platform leverages software engineering expertise to create an integrated and reliable campus second-hand trading website, facilitating the circulation and reuse of goods on campus. With the rise of the sharing and circular economy, second-hand trading platforms have become essential in fostering campus culture, especially in today ’s society where environmental protection and sustainability are highly emphasized. Second-hand trading helps reduce resource waste, aligning with contemporary environmental awareness. 

The GoodsExchange platform offers a convenient channel for SCNU students and staff to register, post, or purchase idle items, communicate through one-on-one chats, and determine transaction methods through direct negotiations. For added 
ecurity, the platform restricts access to the campus community, ensuring atrustworthy environment. Additionally, users can share their trading experiences in the platform's community section, further encouraging mutual support and a sense of belonging within the school.

From a technical perspective, the platform ’s front end is built using Vue3, Axios, and Element Plus, while the back end is implemented with Django and MySQL. The system employs a B/S architecture with separate front-end and back-end components and follows a four-tier structure: model, template, view, and data layers. These technologies together create a secure and efficient trading environment. 

The project not only involves software engineering but also the practical application of front-end and back-end development. Our goal is to increase the utilization of idle goods on campus and motivate more students and staff to engage in second-hand trading. If the platform proves successful at SCNU, we plan to extend its reach to other universities or enterprises, contributing to the broader development of ecological civilization and the circular economy. 4 / 30

## 1.2 Project objective 

Establishing a campus second-hand trading platform website is a worthy project aiming to promote the recycling of idled resources within the campus, save the costs, and enhance community interactions. Our website is intended to offer a user-friendly platform for both buyers and sellers to easily post and browse second-hand goods. The core objective of the project is to build a web application that would be a proper platform for second-hand trading. 

In order to achieve this goal, we categorized the demands of the software into three main functional modules: User Authentication, Transaction Functions, Item Recommendation Filtering and Searching. In addition, we aim to study and implement the recommendation algorithms and search algorithm for second-hand platforms. These algorithms can go a long way towards improving the user experience and enabling applications to actually meet the actual needs of the users. After completing the software architecture and algorithm design, the most significant step is the final implementation of the platform. Our third goal is to execute second-hand trading platform software to ensure the maintainability and scalability of the project. Definitely, we always put user ’s experience at the core, hoping that this project will be a real convenience for all students and stuff on SCNU campus whenever they have arequest to exchange unused items on campus. In the long run, we are looking forward to create an efficient, convenient and safe second-hand trading platform, boost the recycling of resources on campus, reduce waste, and enhance the interaction and connection between students. 

## 1.3 Market pain points 

Tim, an undergraduate at SCNU, faces challenges when trying to sell his idle 

items. He must post anonymously on the campus wall, relying on students managing 

the platform to relay the information via WeChat moments. This process lacks direct, 

real-time communication, making it difficult to build trust and confirm item 

availability. 

GoodsExchange was designed to address this gap in second-hand trading at 

SCNU. Current methods often lead to trust issues —buyers can ’t verify item 

conditions, and sellers may conceal defects or use misleading photos. Communication 

barriers only add to these challenges, resulting in inefficient transactions and potential 

disputes. 

GoodsExchange offers a streamlined solution by allowing users to directly upload 

and browse items, communicate one-on-one with buyers or sellers, and exchange 

detailed information about deals. This transparent, efficient platform fosters trust and 

provides a safer trading experience for SCNU students and staff. 5 / 30 

## 1.4 Solutions of the project 

To address the pain points of existing second-hand trading platforms, we ’ve 

designed key features to enhance user experience on GoodsExchange. Users can 

easily upload items with details like name, photo, description, and price, eliminating 

the need to use external platforms like the Campus Wall. The homepage allows users 

to browse or search for specific items based on their preferences. 

A real-time chat room enables direct communication between buyers and sellers, 

addressing the common issue of delayed responses. Additionally, a public messaging 

function allows users to leave comments under listings, and a community forum lets 

users share trading experiences. These features improve communication efficiency 

and increase transparency, ensuring a more secure and reliable transaction process. 

Meanwhile, on top of implementing these basic features, we will also focus on two 

algorithms to promote the user experience. 

(1) Recommendation algorithm for products on the homepage of the platform: 

when a user enters the platform for the first time, products on the platform homepage 

are selected based on the users ’ historical behaviour and preferences. 

(2) The search algorithm of the platform search function: The platform search 

box will no longer be able to search for products only through keyword matching. We 

will try to match product titles, descriptions and other text information based on 

keywords entered by users. 

By implementing above algorithms, the GoodsExchange platform will be 

committed to help users find their target products rapidly. The success of the 

GoodsExchange platform will definitely optimise transaction processes and improve 

the effectiveness of communication. Our product GoodsExchange starts from the 

market pain points and targeted around users need to create this platform designed 

specifically for students on SCNU campus. 

## 1.5 Advantages of the project 

Currently, the Campus Wall serves as SCNU ’s main second-hand trading platform, 

but it has significant limitations. Posting requires users like Tim to send a message to 

the Campus Wall, which is then re-shared via WeChat moments —an indirect and 

inefficient process. Additionally, the Campus Wall is cluttered with non-trading 

content, making it hard to focus on second-hand goods. 

GoodsExchange solves these issues by offering a dedicated platform exclusively 

for SCNU students. Our chat room function allows direct communication between 

buyers and sellers, improving efficiency and security. Unlike WeChat moments, our 

platform focuses solely on second-hand goods, with a built-in search function that 

makes finding specific items easy. This streamlined approach ensures a better, more 6 / 30 

user-friendly trading experience. 

## 1.6 Cost estimation 

The GoodsExchange platform is a student-developed project, leveraging 

open-source tools and free development frameworks. As such, the overall cost of 

development remains low compared to commercial projects. However, certain costs 

related to hosting, domain registration, and potential marketing are expected. Below is 

a detailed breakdown of the estimated costs required to build, maintain, and promote 

the platform. 

1.6.1 Development Costs 

Since the development of GoodsExchange is primarily handled by students using 

widely available open-source tools, there are no direct costs associated with software 

licensing or purchasing development tools. The team uses Vue3, Axios, Element Plus 

for the front-end, and Django and MySQL for the back-end, all of which are 

open-source technologies. This allows for significant savings during the development 

phase. 

Category Details Estimated Cost 

Development Tools 

& Frameworks 

Open-source tools like Vue3, Django, 

MySQL, Element Plus 

$0 

Version Control &

Collaboration Tools 

GitHub for code management (free for 

student projects) 

$0 

1.6.2 Hosting and Infrastructure 

Once the platform is developed, the primary recurring costs come from hosting 

and maintaining the website. This includes server hosting, domain registration, SSL 

certificates, and cloud storage for images uploaded by users. Cloud services such as 

AWS, DigitalOcean, or similar providers are commonly used for hosting, with costs 

varying depending on the amount of traffic and storage required. 

Category Details Estimated 

Cost 

Server Hosting Cloud hosting service for web application 

and database 

$5 - $15 per 

month 

Domain Registration Registration of a custom domain name for 

branding 

$10 - $20 per 

year 7 / 30 

SSL Certificate Secure HTTPS connection (Let ’s Encrypt 

can provide free SSL) 

$0 - $10 per 

year 

Image Storage & CDN Cloud storage for user-uploaded images, 

CDN for faster loading times 

$5 - $15 per 

month 

1. 6.3 Marketing and Promotion 

To ensure that the GoodsExchange platform is well-received and widely adopted 

by SCNU students and staff, a small budget for marketing and promotion may be 

required. While campus promotions through posters and word-of-mouth are free, 

additional online marketing or targeted advertisements on social media may be 

employed to raise awareness. These costs are optional and can vary depending on the 

marketing strategy. 

Category Details Estimated Cost 

Campus Promotion Free promotional efforts via 

posters, flyers, student 

groups 

$0 

Online Marketing Optional online ads (e.g., Facebook, 

WeChat, Google) 

$0 - $50 per month 

1.6.4 Miscellaneous Costs 

There may be some unforeseen expenses during the development and post-launch 

phases, such as minor upgrades, feature enhancements, or third-party plugins to 

improve functionality. To account for these, a small budget buffer is added. 

Category Details Estimated 

Cost 

Miscellaneous Unplanned expenses, additional tools, 

upgrades, etc. 

$0 - $10 per 

month 

1.6.5 Total Cost Estimate 

The total cost of developing and running the GoodsExchange platform can vary 

depending on the level of promotion, hosting options, and potential additional features. 

Below is a summary of the potential monthly and yearly costs. 

Cost Breakdown Monthly Estimate Annual Estimate 

Low Estimate $10 per month $120 per month 

High Estimate $80 per month $960 per month 8 / 30 

## 1.7 Market Research 

With the change in people's attitudes, diversified ways such as selling or 

exchanging are being accepted by more people, and second-hand consumption has 

become a new wave around the world, attracting giants and capital to enter the game, 

China's comprehensive second-hand e-commerce and vertical second-hand 

e-commerce pattern is basically stable, and the industry has begun to develop in the 

direction of standardisation and normality. 

Until 2023, the transaction scale of second-hand e-commerce reached 548.65 

billion yuan, and the number of users exceeded 580 million.               

> Picture1-1 China ’ssecond-hand E-commerce Transaction Size ,2019-2023
> Picture1-2 China ’ssecond-hand E-commerce User Scale ,2019-2023

The data in these charts will better help us find potential users and develop 

relevant features in our software to engage and satisfy them. 9 / 30 

# Chapter 2: Requirements Engineering 

## 2.1 Functional Requirements 

In order to realize a complete second-hand trading platform, the team members 

conducted field investigations and discussed and analyzed. It was agreed that the 

platform should have the following features. 

2.1.1 Login and registration: 

The platform shall allow users to register and record the basic information of 

users, and verify the identity of users after login.                            

> Picture 2-1 Business process models of login and registration
> Picture 2-2 Use case diagram of login and registration
> Picture 2-3 Description of login and registration use case diagram 10 /30

2.1.2 Upload idle items: 

Users can upload relevant information about their idle items through the platform 

and show them to other users.                          

> Picture 2-4 Business process models of upload idle items
> Picture 2-5 Use case diagram of upload idle items
> Picture 2-6 Description of upload idle items use case diagram

2.1.3 Browse and retrieve idle items: 

Users can browse idle items on the home page, and select and retrieve specified 

items according to their own requirements.             

> Picture 2-7 Business process models of browse and retrieve idle items 11 /30

Picture 2-8 Use case diagram of browse and retrieve items 

Picture 2-9 Description of browse and retrieve items use case diagram 

2.1.4 Communication between buyers and sellers: 

The platform provides chat rooms for buyers and sellers to communicate, which 

is used to discuss the transaction of corresponding items. 

Picture 2-10 Business process models of communication between buyers and sellers 12 / 30 

Picture 2-11 Use case diagram of communication between buyers and sellers 

Picture 2-12 Description of communication between buyers and sellers use case diagram 

2.1.5 Message function: 

Users can leave a message under the item for sale, and the message can be seen 

by all users. 

Picture 2-13 Business process models of message function 

Picture 2-14 Use case diagram of message function 13 / 30 

Picture 2-15 Description of message function use case diagram 

2.1.6 Personal Information Modification: 

Users can modify their personal information, including passwords. 

Picture 2-16 Business process models of personal information modification 

Picture 2-17 Use case diagram of personal information modification 

Picture 2-18 Description of personal information modification use case diagram 

## 2.2 Non-functional Requirements 

The system not only needs to realize the functional requirements required by 

users, but also needs to complete the non-functional requirements to maintain the 14 / 30 

stable operation of the system. For the GoodsExchange platform, the requirements for 

non-functional requirements are as follows: 

2.2.1 Performance Requirements 

Response time : Google's research on page load times shows a strong correlation 

between load times and user attrition rates. Especially on mobile devices, 53% of 

users give up and close the page if it takes more than 3 seconds to load. In addition, 

tools such as Google PageSpeed Insights recommend that web page response times 

should be kept under 2-3 seconds to ensure a better user experience. The application 

page load time and transaction operation response time should be less than 2 seconds, 

and the front-end should pay attention to the performance overhead of the front-end 

application to ensure user experience. 

Concurrent users : The platform must be able to support a maximum number of 

online users at the same time, the backend should have a certain amount of concurrent 

processing capability, and can concurrently serve not less than 100 users at the same 

time. 

Transaction processing capability: The platform should be able to efficiently 

process a certain number of transaction requests. 

2.2.2 Scalability Requirements 

Database expansion : the database design of the platform should be able to adapt 

to the growth of data volume, and adopt a relational database to support the expansion 

of the database structure, while supporting sharding or read-write separation and other 

ways. 

Redis caching : The main purpose of caching is to store frequently used, 

frequently accessed data, without having to query the database every time. Redis is an 

in-memory database with extremely fast access speed. Since Redis is an in-memory 

database, it can handle highly concurrent read requests. Traditional relational 

databases, on the other hand, may experience performance degradation when handling 

a large number of concurrent requests. 

2.2.3 Security Requirements 

Data encryption: Sensitive data such as users' personal information and 

transaction records shall be encrypted for transmission and storage. Hash encryption 

technology can be used, the server saves the key, and SHA256 algorithm is used for 

data encryption. Since the hash algorithm is irreversible and cannot restore the 

original data from the hash value, it is suitable for verifying the integrity of the data 

and digital signature. 

Identity authentication : Uses an authentication mechanism such as JWT to 

authenticate users during login to ensure user account security. 

Rights management : Different roles (such as buyers, sellers, and administrators) 

have different rights to prevent unauthorized access. 

2.2.4 Availability Requirements 15 / 30 

System availability: The system should ensure a certain 95% availability, that is, 

the system downtime does not exceed 438 hours in a year. 

Fault recovery: When a system failure occurs, the application should have a log 

function to troubleshoot the system problem as soon as possible and complete fault 

recovery within 2 hours. 

2.2.5 Maintainability Requirements 

Code readability : The system should adopt clear coding specifications and 

documentation for easy maintenance and upgrade by developers. 

Log record : The detailed log system records system operations and exceptions, 

facilitating troubleshooting. 

2.2.6 Compatibility Requirements 

Cross-platform support: The application should run properly on mainstream PC 

operating systems (such as Windows, macOS). 

Browser compatibility: The Web version should support all major browsers 

(such as Chrome, Firefox, Safari, etc.). 

Interface resolution support: The application should be on devices with 

different resolutions and have good front-end interface adaptation. 

2.2.7 Usability Requirements 

User interface ease of use : The UI interface design should be intuitive and easy 

for users to complete operations. 

Responsive design : Ensure good display and operation on different devices (such 

as mobile, tablet, PC). 

2.2.8 Reliability Requirements 

Data consistency : In case of system failure or network anomaly, the consistency 

and integrity of transaction data should be ensured, and the transaction data will not 

be unsynchronized in different modules of the system due to the occurrence of 

anomalies. 

Backup mechanism : Automatically backs up data periodically to prevent data 

loss. 

# Chapter 3: System Design 

## 3.1 User stories 

Amy is a SCNU student. Over the years, she ’s accumulated various items in her 

dormitory that she no longer needs. Looking for a way to declutter, she decides to sell 

these unused items on the GoodsExchange platform. 

When she enters the homepage of the GoodsExchange platform, there are options 

to “Register ”, “Login ” and “Forgot Password ”. If she wishes to register for an account 16 / 30 

and login to the website to trade her unwanted items, she can click on the “Register ”

option and follow the website's instructions to fill in her details like name, email, and 

password. After completing the registration, the webpage jumps back to the homepage, 

where she clicks on the “Login ” button and successfully logs into her new account. 

Logging in the platform, if Amy wants to sell her items, she can navigates to the 

“Item ” section, where she can upload the details of her items for sale. Clicking the 

“Upload ” button, enters the title, description and price for her item and uploads clear 

images. After that, Amy can check her post at any time and can use “Modify ” or 

“Remove ” options to edit her post. 

When a buyer shows his or her interest in Amy ’s item, they can through “Chatbox ”

to leave a message or initiate a chat through the platform to know more information 

about the items, enabling Amy to discuss and negotiate the sale. To manage her 

ongoing transactions, Amy can visit the “Trade ” section, where she can see all 

initiated trades, update the status of her sales, and leave comments or reviews on 

completed transactions. 

Finally, Amy explores the “Forum ” section of the platform, where she finds a

thriving community of users discussing various topics related to item trading. She 

can post, comment, and even search for discussions about tips for faster sales or 

recommendations for popular items. Amy also uses the search feature to get advice 

from other users on how to improve her listings. 

With all these features, Amy finds GoodsExchange to be a convenient and 

efficient platform for managing her unwanted items, making her life in college a little 

easier and clutter-free. 

## 3.2 Software Architectural 17 / 30                

> Picture 3-1 Software Architectural Context Model
> Picture 3-2 Description of the Context Model of Good Exchange System

Good Exchange System use the MVC(model-view-controller) architecture to 

organize the system. The Model describe the structure of the data in the database, the 

Controller will receive the request from users and check the model layer for data, and 

last it will interact with view layer for the final structure of the data. Since we use a

Front-end and back-end separation architecture, the data serialized by view will the 

JSON format, and response for front end by RestAPI. Besides, the channels server 

which outside the MVC will use its own routing and WebSocket protocol to come true 

the chatroom function.          

> Picture 3-3 The Architecture diagram of the Software 18 /30

## 3.3 The Data Model in the Database             

> Picture 3-4 E-R diagram of database data model
> Picture 3-5 Interpretation of database entities

## 3.4 Structure of Backend 

3.4.1 Summary 

The belowing functions implement the website's functions for user login 

registration, personal information and item addition, deletion, modification and query, 

ensuring that users can browse the homepage's product interface, single product 

information interface and personal information interface normally. 

When a user is interested in an item and clicks "I want" on a single product page, 

a transaction instance will be randomly generated, and a new chat room will be 

created accordingly to chat with the seller. 19 / 30 

When a user enters a chat room, a chat list will be obtained. After selecting one of 

them to enter the corresponding chat room, the website will automatically update the 

historical information. 

3.4.2 About User 

User login and register module is as following:     

> Picture 3-6 User module diagram

User personal information and transaction record query :            

> Picture 3-7 User Info module diagram 20 /30
> Picture 3-8 User module sequence diagram

3.4.3 About Item 

When users browse products on the main page and click on a specific product 

page, they need to call the api ItemView to obtain relevant item information. 

When users need to upload products, they also use the api ItemView to upload the 

items to be traded.            

> Picture 3-9 Item module diagram 21 /30
> Picture 3-10 Item module sequence diagram

3.4.4 About Trade 

When a user clicks "I want" on the product page, the backend creates an instance 

of trade, which contains information about the buyer, seller, and traded item, and then 

creates and enters a chat room based on the generated trade_id.            

> Picture 3-11 Trade module diagram 22 /30
> Picture 3-12 Trade module sequence diagram

3.4.5 About Chat 

ChatMessage instance has a ForeignKey with Trade, so we can get all the 

messages of the corresponding chatroom by trade_id. 

When user sending message to another, backend will receive the request and then 

send it back to another user            

> Picture 3-13 Chat module diagram 23 /30
> Picture 3-14 Chat module sequence diagram

## 3.5 Structure of Frontend      

> Picture 3-15 Front-end page structure diagram

3.5.1 Login Page: 

This page allows users to either register a new account or log in. The login 

process includes authentication to ensure the user's credentials are valid. 

3.5.2 Home Page (Buying page): 

This is the main page where users can search for products using a search bar with 

an optimized algorithm for fuzzy search results. The page includes a navigation bar to 

switch between different sections like "I Want to Buy," "I Want to Sell," "My Chats," 

Users can filter products in the filter section based on specific criteria, and the Item 

display area shows items in a card format. Clicking on a card takes the user to the 

product's detail page. 24 / 30 

3.5.3 Item info Page (For Buying): 

This page contains the same navigation bar as the home page. It displays detailed 

information about the product, including basic details and images. There is also a

comment section where users can leave comments, displayed in a traditional post 

format (with an option to add a reply feature). If the user is interested in the product, 

they can create a new chat room related to the transaction, or if they've already shown 

interest, they will be redirected to the existing chat room. 

3.5.4 Selling page: 

Similar to the home page, this page features a navigation bar. It displays a list of 

the user's current products for sale in a card format, with an option to click through to 

the product detail page. There is also a section to add new items for sale, where the 

seller can enter basic product information. 

3.5.5 Item info Page (For Selling): 

Like the buyer ’s view, the seller can view product details here. The seller has the 

option to modify item information or update product images. There is also a comment 

section, where both sellers and buyers can leave comments. Additionally, the seller 

can view a list of interested buyers who clicked "interested," and they can start a chat 

with them. 

3.5.6 My Chat Page: 

This page also contains a navigation bar. It allows users to filter their 

conversations based on whether they are the buyer or seller. The filtered list of 

conversations is displayed, and users can click on a chat to enter the respective chat 

room. 

3.5.7 Chat Room Page: 

In the chat room, users can send messages using a text editor. The chat system 

relies on WebSocket technology to maintain an active connection while the app is 

open and disconnect when the user leaves, ensuring real-time communication. 

3.5.8 Profile Page: 

This page allows users to view and modify their personal information. It also 

shows a history of the user's purchases and sales. Users can update the status of 

transactions and leave comments once a transaction is complete. There's also a

settings section for configuring app preferences. 

# Chapter 4: Market Analysis 

## 4.1 Background analysis 

With the rise of internet technology, online shopping has become essential, and 25 / 30 

the second-hand market offers a platform for exchanging idle items. This market helps 

consumers save money and find rare or out-of-print goods. As the number of college 

students grows, they have become a key consumer group. With increasing idle items 

post-consumption, more students are turning to second-hand platforms to recover 

funds and promote resource reuse .

## 4.2 Market situation 

Currently, platforms like Xianyu and Zhuanzhuan serve a large user base for 

second-hand trading in China. However, they fail to fully tap into the vast consumer 

market of university campuses. College students often have idle items but face 

challenges like high shipping fees and information gaps when using these broader 

platforms. A dedicated campus trading platform can better address these issues. 

With improved living standards, college student consumption has significantly 

increased. In 2023, China had 47.63 million students enrolled in higher education, 

with 41.1% having a monthly income of 1501-2000 yuan. The expected consumption 

scale for Chinese students in 2024 is about 850 billion yuan, highlighting their 

enormous market potential.           

> Picture 4-1 Consumption base and development potential of Chinese college students

The popularization of Internet technology has also made online shopping the 

main consumption mode of contemporary college students. The second-hand trading 

market for college students is showing a rapid development trend, which is both a

result of the sharing economy and in line with the development requirements of 

today's era. 

## 4.3 Market analysis and positioning 

4.3.1 Large market demand ：

There are numerous college students with strong purchasing power. SCNU 

GoodsExchange provides a supply and demand platform for college students, 

effectively solving the problem of students' idle items recycling, providing a win-win 

platform for both suppliers and demanders. At the same time, the platform 26 / 30 

communicates with schools as a unit, allowing face-to-face transactions anytime, 

anywhere, making communication safer and more reliable. 

4.3.2 User group analysis ：

a. Book users 

The higher education model is different from primary and secondary schools, as 

students have the freedom and initiative to choose reference books in their daily 

learning. For example, when it comes to choosing school textbooks, college students 

can choose between the new or old versions on their own. The textbooks used in 

different schools are different, so the trading volume of old books on campus is 

relatively high. 

b. Electronic product users 

Due to the accelerated upgrading of electronic products, students may feel 

unsatisfied after purchasing and using such products for a period of time, but they still 

have a certain purchasing power. You can choose to sell old item and buy a new one. 

c. Daily necessities users 

The living environment of college students is campus, and they need to 

independently purchase daily necessities, which inevitably leads to some items being 

"bought too much" or "bought incorrectly". For example, during graduation season, 

graduates will tidy up their dormitories and have items that are inconvenient to carry, 

such as bed tables, drying racks, and storage boxes. Many students will choose to sell 

them at low prices 

4.3.3 Competitive Analysis of Porter's Five Forces Model: 

The Porter's Five Forces model suggests that there are five forces in an industry 

that determine the scale and degree of competition, namely the bargaining power of 

suppliers, the bargaining power of buyers, the ability of potential competitors to enter, 

the ability of substitutes, and the current competitiveness of competitors within the 

industry. These five forces collectively affect the attractiveness of the industry and the 

competitive strategic decisions of existing enterprises. In any industry, whether 

domestic or foreign, whether providing products or services, the rules of competition 

are included in these five competitive strengths. 27 / 30      

> Picture 4-2 Five Forces Model Diagram\

a. The existing competitors in the industry have strong competitiveness 

In China's second-hand market industry, there are many competitors participating 

in industry competition, and competition within the industry can already cross regions 

and compete nationwide. Looking at the entire online second-hand trading platform 

market, competitors on campus online second-hand platforms can be divided into two 

categories: one is second-hand trading platforms with giant backgrounds such as 

Xianyu and Zhuanzhuan, and the other is trading platforms that are in a stagnant state 

of development, started late, and have little reputation. The former has a significant 

impact on the development of the platform. Offline competitors are physical stores 

represented by second-hand book specialty stores. At present, although the sales of 

physical stores are far lower than before, second-hand bookstores in schools occupy 

the majority of the second-hand book consumption market due to their convenient and 

affordable characteristics. 

b. New entrants have strong competitiveness 

The second-hand trading market is showing a rapid development trend, with low 

barriers to entry and no need for particularly large capital support. New entrants to the 

industry can be divided into two parts: imitators and new business lines developed by 

large enterprises. For the former, such as online electronic sales conducted 

independently by classmates and other second-hand trading organizations in schools, 

it will have a certain impact on the platform, but due to its lower security and 

convenience compared to platform transactions, its threat capability is relatively small. 

For the latter, because these enterprises have a certain customer base and financial and 

capital strength, if they carry out new business, it poses a greater threat to the 

development of the platform. 

c. The substitution ability of substitutes is weak 

With the steady improvement of China's economy and the rapid development of 28 / 30 

e-commerce companies such as Taobao and JD.com that provide online work 

platforms for online stores, the prices of some consumer goods have been reduced. 

Therefore, consumers may choose low-priced new items, which to some extent 

reduces product utilization and hinders the development and operation of this 

platform. But when it comes to second-hand items, they still have a certain price 

advantage compared to brand new items, especially for some luxury brands and more 

expensive items. The price of new products will not be very low, so many people still 

choose second-hand goods to meet the needs of fashion trends. 

d. Low bargaining power between suppliers and buyers 

The price of online transactions is predetermined, and the platform's profit model 

is to obtain profits through small transaction fees, advertising fees, membership fees, 

etc. The bargaining between suppliers and buyers does not greatly affect the 

platform's established revenue. 

# Chapter 5: Practical application and 

# popularization 

## 5.1 Practical application 

As students' living standards continue to rise, dormitories are filling up with 

unused items like books, clothes, and electronic devices that often go unused. At the 

same time, many students may need these very items. The GoodsExchange platform 

provides a convenient solution, allowing students to redistribute their unused 

resources to those who need them, avoiding waste and helping students save money. 

GoodsExchange is more than just a platform for individual transactions; it 

promotes a circular economy within the campus. By enabling items to be traded and 

reused, students can make better use of limited resources and reduce the need to buy 

new goods. This aligns with principles of environmental protection and sustainability, 

fostering greater environmental awareness within the student community. 

On many second-hand platforms, users often face challenges like fraudulent 

transactions and privacy issues. However, GoodsExchange is tailored specifically for 

campus use, where only students and faculty can participate, ensuring a secure 

environment through real-name verification. With its built-in chat system and 

transaction management features, the platform provides a safe and transparent 

environment for trading, reducing users' concerns. 

Moreover, the platform's “Forum ” feature offers students a space to discuss and 

share ideas. Beyond trading items, students can exchange shopping tips, recommend 

popular products, and assist each other in optimizing their listings. This community 29 / 30 

interaction not only enhances trading experiences but also fosters new friendships, 

adding to the richness of campus life. 

## 5.2 Application promotion 

To ensure successful adoption, the promotion of GoodsExchange must be 

strategically tailored to the campus environment, students' needs, and the platform's 

features. A combination of online and offline approaches can be employed to 

maximize visibility and increase user engagement. 

## Online :

1. KOL (Campus Opinion Leader) Cooperation: Partner with influential campus 

figures such as student union representatives and club leaders to serve as platform 

ambassadors. These KOLs can share their trading experiences on social media, 

driving initial traffic to the platform and encouraging others to join. 

2. Campus public numbers and microblogs: Collaborate with campus WeChat 

accounts and microblogs to publish articles that focus on the benefits of trading 

unused items, highlighting themes of sustainability and convenience. Use real-life 

examples, such as a student's successful sale of dormitory furniture, to capture 

students' interest. 

## Offline :

1. Propaganda display boards and posters: Place eye-catching posters in high-traffic 

areas such as dormitories, classrooms, libraries, and cafeterias. These posters can 

introduce the platform's features, usage tips, and benefits, with QR codes included 

for easy access to the platform. 

2. Lectures and club activities: Work with environmental clubs or entrepreneurship 

clubs on campus to organize lectures on ‘unused items management ’ or ‘circular 

economy ’, emphasizing the benefits of environmental protection and resource 

recycling, and promoting the use of the platform during the activities. At the end 

of the seminar, an interactive session can be set up to invite students to register 

and demonstrate how to post items on site. 30 / 30 

## Users 

> Online
> Offline
> Cooperation
> microblog

poster 

Lecture   

> GoodsExchange
> channel
> Picture 5-1

Flowchart of the promotion process 

# Conclusion 

The GoodsExchange project was created to meet the growing demand for 

second-hand trading among SCNU students and staff, addressing practical needs and 

promoting sustainability. Our development team used technologies like Vue3, Axios, 

and Element Plus on the front end, and Django and MySQL on the back end, creating 

a user-friendly platform for trading idle goods within the campus. 

The platform tackles key issues such as poor communication, trust barriers, and 

lack of transparency by offering features like item uploads, real-time chat rooms, and 

a community forum. This eliminates the inefficiency of informal methods like campus 

walls, providing a centralized, secure system for users to buy and sell goods. 

Advanced algorithms enhance the experience, with personalized 

recommendations and a robust search function that make finding items easier. 

GoodsExchange also fosters sustainability by encouraging the reuse of goods, 

reducing waste, and cutting costs for students, all while supporting a circular 

economy. 

Beyond trading, GoodsExchange builds a sense of community, offering a space 

where users can share advice, give feedback, and foster trust. The platform ’s scalable 

design opens the door for future growth, with potential for adoption by other 

institutions. In sum, GoodsExchange is a comprehensive solution that addresses 

real-world challenges while promoting sustainability and community engagement on 

campus.
