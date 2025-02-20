# 🎥 Real-Time Computer Vision in WebGL with TensorFlow.js

Overview

This project demonstrates the power of running computer vision models directly in the browser using TensorFlow.js (tfjs) and WebGL. It features implementations of the YOLO and COCO-SSD models for object detection, all processed on the client side. This approach drastically reduces server costs by limiting API requests to only when detections occur, making it ideal for businesses and developers looking for efficient and cost-effective computer vision solutions.

Features

-   Real-time Object Detection: Runs YOLO and COCO-SSD models in WebGL directly in the browser.
-   Cost-Efficient: Reduces the need for continuous server communication, cutting down on cloud computing and bandwidth costs.
-   Flexible Notifications: Sends alerts via Telegram, email, WhatsApp, SMS, or any other platform of your choice.
-   User-Friendly Interface: Easily create a canvas to define detection zones and select models and labels.

Open Source: Contribute, customize, and build upon this project.
Demo

[![Alt text](https://img.youtube.com/vi/fO3A9giDCVk/hqdefault.jpg)](https://www.youtube.com/watch?v=fO3A9giDCVk)


Getting Started
Prerequisites
Node.js
npm or yarn
Installation
Clone the repository:

```bash
git clone <https://github.com/your-username/your-repo-name.git>
cd your-repo-name
```

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm start
```

This will start a local development server and open the app in your default web browser.

Usage

-   Select the detection model (YOLO or COCO-SSD).
-   Define the detection zone on the canvas.
-   Run the detection and receive notifications through your chosen platform.

Configuration
Telegram Integration: To receive notifications via Telegram, you need to set up a bot and get your bot token and chat ID. Configure these in the .env file.

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

Custom Models and Labels: You can add custom models and labels by modifying the models/ and labels/ directories.

Roadmap

-   Add more pre-trained models.
-   Implement support for additional notification platforms (e.g., Slack, Microsoft Teams).
-   Improve UI/UX for easier model and zone selection.

Contributing
Contributions are welcome! Please fork this repository and submit a pull request with your changes. For major changes, please open an issue to discuss what you would like to change.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Contact
For questions or feedback, please contact Your Name.
