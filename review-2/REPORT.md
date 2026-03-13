# Review 2 Report

## Title

A Mobile Application for Real-Time Spatial Territory Capture and Social Fitness

## 1. Introduction

The proposed system is a location-based mobile application that combines physical fitness, real-time spatial competition, and social interaction in a single platform. The application is designed to motivate users to engage in regular walking and running activities by transforming real-world movement into an interactive territory capture experience. Instead of tracking fitness activity only in terms of distance and pace, the system introduces a spatial game layer in which users capture and defend virtual map tiles based on their GPS movement.

The core concept is to divide the physical world into small virtual regions and allow users to compete for ownership of those regions through real-time movement. This approach increases engagement by making routine fitness activities more interactive, competitive, and socially visible. The system also supports leaderboards, rewards, user profiles, following, group participation, and in-app social presence to improve long-term retention.

The proposed application follows a server-authoritative design to validate movement updates and reduce location spoofing or unfair play. It is implemented using mobile and cloud-compatible technologies without depending on machine learning training or paid services, which makes it practical for academic development and real-world deployment.

## 2. Literature Review and Rationale

Location-based systems have been widely used in mobile applications for navigation, gaming, tracking, and fitness. Mobile fitness applications such as Strava, Nike Run Club, and Adidas Running demonstrate that GPS-enabled activity tracking can significantly improve user awareness of exercise habits. These systems usually focus on performance metrics such as pace, distance, route history, and competition through leaderboards. However, most of them do not convert geographical movement into a persistent territorial competition model.

Location-based gaming platforms such as Pokemon GO and Ingress have shown that spatial interaction can increase user engagement by linking physical movement to digital rewards and location ownership. These applications prove that users are highly motivated when movement affects a persistent shared virtual world. However, these systems are not primarily designed for structured fitness development, distance-based performance improvement, or social fitness goals.

Research in gamification also shows that points, badges, achievements, rankings, and competitive challenges can improve motivation and user retention in fitness environments. Social reinforcement through community participation, group interaction, and public visibility of progress further strengthens user engagement. Combining these mechanisms with real-time location systems creates an opportunity for a more immersive fitness platform.

The rationale behind this project is to bridge the gap between fitness tracking applications and territory-based location gaming by introducing a system where walking and running produce meaningful spatial outcomes. Users are not only rewarded for movement, but also become part of an evolving competitive map environment. This improves motivation, supports repeated app usage, and provides a stronger social fitness experience.

## 3. Gap Identification

Although existing fitness applications support route tracking, challenge systems, and social leaderboards, they generally lack a persistent spatial ownership mechanism where users can capture and defend territory through real-world movement. On the other hand, location-based games provide spatial interaction but do not typically focus on fitness performance metrics, running challenges, long-term exercise motivation, or structured health-oriented competition.

The key gaps identified are:

1. Existing fitness platforms do not transform movement into real-time territory ownership.
2. Most running applications measure performance but do not provide dynamic spatial competition.
3. Location-based games provide map interaction but do not emphasize sustained physical fitness goals.
4. Many systems lack an integrated design that combines social fitness, competition, rewards, and map control.
5. Existing systems are often vulnerable to location spoofing unless strong validation methods are used.

This project addresses these gaps by combining GPS-based fitness tracking, tile capture, social participation, competitive leaderboards, and server-side movement validation in one system.

## 4. Objective Framing

### 4.1 Primary Objective

To design and implement a mobile application that enables users to capture and compete for virtual territory through real-time walking and running activities while promoting social fitness engagement.

### 4.2 Secondary Objectives

1. To divide real-world locations into virtual spatial tiles using geospatial mapping logic.
2. To track user movement in real time using GPS data from the mobile device.
3. To assign and update tile ownership dynamically based on user location.
4. To provide challenge systems such as daily, weekly, and monthly competitions.
5. To develop social features including profiles, follows, groups, and visibility of nearby users.
6. To introduce motivation mechanisms such as points, badges, stickers, and leaderboards.
7. To design a server-authoritative validation model to reduce spoofing and unfair movement updates.

## 5. Project Plan

The project is divided into the following development phases:

### Phase 1: Planning and Requirement Analysis

- Define system scope and user features
- Study comparable fitness and location-based platforms
- Finalize functional and non-functional requirements

### Phase 2: System Design

- Design mobile UI flow and user modules
- Define tile capture logic and territory rules
- Plan backend structure and validation strategy
- Prepare architecture and data flow diagrams

### Phase 3: Prototype Implementation

- Develop mobile application using React Native and Expo
- Add GPS location tracking and activity session logic
- Create map interface and territory tile visualization
- Develop social dashboard, leaderboard, and profile screens

### Phase 4: Backend and Validation

- Build local backend APIs
- Add account registration and login
- Implement session handling and movement validation
- Add persistence for territory and user progress

### Phase 5: Testing and Analysis

- Test tracking flow and route updates
- Validate territory capture behavior
- Analyze system strengths, limitations, and future scalability

## 6. Design and Methodology

### 6.1 System Architecture

The system follows a client-server model. The mobile client is responsible for location collection, interface rendering, user interaction, and activity display. The backend is responsible for validating movement, storing user data, managing sessions, updating territory ownership, and generating shared state such as leaderboards and nearby user information.

### 6.2 Methodology

The development follows an iterative prototype methodology. Initial work focused on building the basic mobile app structure and interface. After that, GPS session tracking and tile capture logic were introduced. The backend was then expanded to include session processing, auth-ready flows, territory persistence, and anti-spoof validation. This iterative approach helps in testing features early and refining system behavior incrementally.

### 6.3 Main Modules

1. Activity Tracking Module
2. Territory Capture Module
3. Map Visualization Module
4. Leaderboard and Reward Module
5. Social Interaction Module
6. Authentication and User Module
7. Backend Validation Module

### 6.4 Data Flow

1. User starts an activity session.
2. Mobile app requests GPS permission and receives location updates.
3. The application maps location to tile identifiers.
4. Tile ownership is updated based on validated movement.
5. Session metrics such as distance, pace, and captured tiles are stored.
6. Social and leaderboard data are displayed to users.

## 7. Implementation and Analysis

### 7.1 Current Implementation Status

The current prototype includes:

- mobile app screens for Home, Track, Map, Nearby, and Profile
- GPS session tracking
- route recording and pace calculation
- territory tile capture prototype
- map-based tile and route rendering
- local persistence of territory and session history
- local backend with session APIs
- auth-ready backend with register and login endpoints
- basic server-side movement validation

### 7.2 Implementation Progress

The implementation is substantially advanced for prototype stage and can be considered around 80 percent complete for a functional academic demonstration. The major features for demonstrating the concept are working in a local environment. The remaining work is mainly related to production readiness, cloud deployment, real-time multi-user synchronization, and advanced social communication features.

### 7.3 Analysis

The system successfully demonstrates that fitness activity can be combined with location-based competition in a meaningful way. The prototype proves the feasibility of:

- converting GPS movement into virtual territory ownership
- tracking live sessions on mobile
- maintaining leaderboard-style competition
- presenting nearby users as part of a social fitness environment

The design also shows that server-side movement validation can be integrated without introducing unnecessary complexity. However, the present implementation still has limitations:

- backend is local rather than cloud deployed
- full multi-user live sync is not yet completed
- chat and advanced group interactions are not fully implemented
- release build and production deployment still require further work

## 8. Tools and Technologies Used

- React Native
- Expo
- TypeScript
- Node.js
- Android Studio
- React Native Maps
- Expo Location
- AsyncStorage
- Local file-based backend persistence

## 9. Conclusion

This project proposes and implements a novel mobile application that integrates real-time territory capture with social fitness tracking. By combining GPS-based exercise sessions, map-based competition, rewards, social participation, and server-side validation, the system creates a more engaging alternative to conventional running and walking applications. The current prototype demonstrates the feasibility of the concept and provides a strong foundation for future development into a complete production-ready platform.

## 10. Future Work

1. Cloud database deployment
2. Real-time multi-user synchronization
3. Push notifications
4. Group chat and messaging
5. Release APK and store deployment
6. Anti-spoofing improvements using stronger validation logic
7. Expanded reward and challenge engine
