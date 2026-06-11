export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  thumbnail: any;
  duration: string;
  lessons: number;
  rating: number;
  reviews: number;
  price: number;
  isFree: boolean;
  isPurchased: boolean;
  progress: number;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: Module[];
  tags: string[];
}

export interface Module {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  videoUrl: string;
  resources: Resource[];
  description: string;
  notes: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "doc" | "zip";
  size: string;
  url: string;
}

export interface Product {
  id: string;
  title: string;
  category: "physical" | "digital";
  subcategory: string;
  price: number;
  originalPrice: number;
  thumbnail: any;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  features: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  thumbnail: any;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number;
}

export const COURSES: Course[] = [
  {
    id: "c1",
    title: "Robotics for Beginners",
    instructor: "Dr. Arjun Sharma",
    category: "Robotics",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "12h 30m",
    lessons: 24,
    rating: 4.8,
    reviews: 342,
    price: 1499,
    isFree: false,
    isPurchased: true,
    progress: 65,
    description:
      "Master the fundamentals of robotics — from basic circuits to autonomous robots. Build real projects using Arduino and Raspberry Pi. Perfect for students with no prior experience.",
    level: "Beginner",
    tags: ["Arduino", "Sensors", "Automation"],
    modules: [
      {
        id: "m1",
        title: "Introduction to Robotics",
        duration: "45 min",
        isCompleted: true,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Welcome to the world of robotics! In this lesson, you'll learn the fundamental concepts of robotics, including what robots are, how they work, and their applications in modern technology. We'll explore the basic components that make up a robot and understand the principles behind autonomous systems.",
        notes: [
          "Robots are programmable machines designed to perform tasks autonomously",
          "Key components: sensors, actuators, controllers, and power systems",
          "Applications span from manufacturing to healthcare and space exploration",
          "Understanding feedback loops is crucial for robot behavior"
        ],
        resources: [
          { id: "r1", title: "Robotics Basics PDF", type: "pdf", size: "2.4 MB", url: "#" },
        ],
      },
      {
        id: "m2",
        title: "Understanding Circuits",
        duration: "1h 10m",
        isCompleted: true,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Dive deep into electronic circuits - the backbone of all robotic systems. Learn about voltage, current, resistance, and how components like resistors, capacitors, and transistors work together. You'll build your first simple circuits and understand how electricity flows through different pathways.",
        notes: [
          "Ohm's Law: V = I × R (Voltage = Current × Resistance)",
          "Series circuits: components connected in a single path",
          "Parallel circuits: components connected in multiple branches",
          "Always check polarity when connecting components",
          "Use a multimeter to measure voltage, current, and resistance"
        ],
        resources: [
          { id: "r2", title: "Circuit Diagrams", type: "pdf", size: "1.8 MB", url: "#" },
        ],
      },
      {
        id: "m3",
        title: "Arduino Programming Basics",
        duration: "1h 30m",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Master the Arduino programming environment and learn to write code that brings your robots to life. Understand the structure of Arduino sketches, work with digital and analog inputs/outputs, and control LEDs, motors, and sensors through code.",
        notes: [
          "Arduino IDE setup and basic interface navigation",
          "Setup() runs once, loop() runs continuously",
          "Digital pins: HIGH (5V) or LOW (0V) states",
          "Analog pins: read values from 0-1023",
          "Serial communication for debugging: Serial.print()"
        ],
        resources: [],
      },
      {
        id: "m4",
        title: "Sensor Integration",
        duration: "55 min",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Learn to integrate various sensors with your Arduino to give your robot the ability to sense its environment. Work with ultrasonic sensors for distance measurement, temperature sensors, and light sensors to create responsive robotic behaviors.",
        notes: [
          "Ultrasonic sensors measure distance using sound waves",
          "Analog sensors provide variable readings, digital sensors give on/off states",
          "Calibration is essential for accurate sensor readings",
          "Use pullup resistors for reliable digital sensor readings"
        ],
        resources: [],
      },
      {
        id: "m5",
        title: "Building Your First Robot",
        duration: "2h 0m",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Put everything together to build your first autonomous robot! Combine circuits, programming, and sensors to create a robot that can navigate, avoid obstacles, and respond to its environment. This hands-on project brings together all the concepts you've learned.",
        notes: [
          "Start with a simple chassis and gradually add complexity",
          "Test each component individually before integration",
          "Document your wiring connections for troubleshooting",
          "Iterative design: build, test, improve, repeat",
          "Safety first: always disconnect power when wiring"
        ],
        resources: [],
      },
    ],
  },
  {
    id: "c2",
    title: "AI & Machine Learning Fundamentals",
    instructor: "Prof. Meera Nair",
    category: "Artificial Intelligence",
    thumbnail: require("../assets/images/course_ai.png"),
    duration: "20h 45m",
    lessons: 38,
    rating: 4.9,
    reviews: 512,
    price: 2499,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description:
      "Understand how AI and machine learning work from the ground up. Learn neural networks, data processing, and build your own AI models using Python.",
    level: "Intermediate",
    tags: ["Python", "Neural Networks", "Data Science"],
    modules: [
      {
        id: "m1",
        title: "What is Artificial Intelligence?",
        duration: "30 min",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Explore the fascinating world of artificial intelligence and understand what makes machines intelligent. Learn about the history of AI, its current applications, and the future potential of this revolutionary technology.",
        notes: [
          "AI is the simulation of human intelligence by machines",
          "Types: Narrow AI (specific tasks) vs General AI (human-level intelligence)",
          "Applications: virtual assistants, recommendation systems, autonomous vehicles",
          "Machine learning is a subset of AI focused on learning from data"
        ],
        resources: [],
      },
      {
        id: "m2",
        title: "Python for AI",
        duration: "2h 0m",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Master Python programming essentials for AI development. Learn about NumPy for numerical computing, Pandas for data manipulation, and Matplotlib for visualization. Build a strong foundation in the language that powers modern AI.",
        notes: [
          "Python is the most popular language for AI/ML development",
          "NumPy: efficient numerical operations on arrays",
          "Pandas: powerful data manipulation and analysis",
          "Matplotlib/Seaborn: data visualization libraries",
          "Jupyter notebooks: interactive development environment"
        ],
        resources: [],
      },
      {
        id: "m3",
        title: "Machine Learning Algorithms",
        duration: "3h 20m",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Deep dive into core machine learning algorithms including linear regression, decision trees, and neural networks. Understand when to use each algorithm and how to evaluate model performance.",
        notes: [
          "Supervised Learning: classification and regression problems",
          "Unsupervised Learning: clustering and dimensionality reduction",
          "Key algorithms: Linear Regression, Decision Trees, Random Forests, K-Means",
          "Model evaluation: accuracy, precision, recall, F1-score",
          "Cross-validation: technique to assess model generalization"
        ],
        resources: [],
      },
    ],
  },
  {
    id: "c3",
    title: "Electronics & Circuits Mastery",
    instructor: "Eng. Ravi Krishnan",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "15h 20m",
    lessons: 30,
    rating: 4.7,
    reviews: 278,
    price: 1299,
    isFree: false,
    isPurchased: true,
    progress: 30,
    description:
      "Dive deep into electronics — learn about resistors, capacitors, transistors, and integrated circuits. Design and test your own electronic projects.",
    level: "Beginner",
    tags: ["Electronics", "PCB Design", "Circuits"],
    modules: [
      {
        id: "m1",
        title: "Basic Electronic Components",
        duration: "1h 0m",
        isCompleted: true,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Get familiar with essential electronic components that form the building blocks of all circuits. Learn about resistors, capacitors, diodes, transistors, and integrated circuits through hands-on examples.",
        notes: [
          "Resistors: control current flow, measured in Ohms (Ω)",
          "Capacitors: store electrical charge, measured in Farads (F)",
          "Diodes: allow current flow in one direction only",
          "Transistors: act as switches or amplifiers",
          "ICs (Integrated Circuits): complex circuits on a single chip"
        ],
        resources: [],
      },
      {
        id: "m2",
        title: "Ohm's Law & Kirchhoff's Laws",
        duration: "1h 20m",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Master the fundamental laws of electronics. Understand Ohm's Law for calculating voltage, current, and resistance relationships, and apply Kirchhoff's laws to analyze complex circuits.",
        notes: [
          "Ohm's Law: V = I × R (Voltage = Current × Resistance)",
          "Kirchhoff's Current Law (KCL): sum of currents at a node = 0",
          "Kirchhoff's Voltage Law (KVL): sum of voltages in a loop = 0",
          "Power calculation: P = V × I = I²R = V²/R",
          "Use these laws to solve any circuit problem"
        ],
        resources: [],
      },
    ],
  },
  {
    id: "c4",
    title: "Python Programming for Students",
    instructor: "Dr. Anjali Verma",
    category: "Programming",
    thumbnail: require("../assets/images/course_electronics.png"), // TODO: Create unique python.png image
    duration: "10h 0m",
    lessons: 20,
    rating: 4.6,
    reviews: 189,
    price: 0,
    isFree: true,
    isPurchased: true,
    progress: 80,
    description:
      "Learn Python from scratch. Covers variables, loops, functions, and object-oriented programming with fun projects.",
    level: "Beginner",
    tags: ["Python", "Programming", "Coding"],
    modules: [
      {
        id: "m1",
        title: "Python Setup & First Program",
        duration: "30 min",
        isCompleted: true,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Get started with Python programming by setting up your development environment and writing your first program. Learn about variables, data types, and basic input/output operations.",
        notes: [
          "Install Python from python.org",
          "Use VS Code or PyCharm as your IDE",
          "print() function displays output to console",
          "input() function gets user input",
          "Variables store data: name = 'John', age = 25",
          "Basic data types: int, float, str, bool"
        ],
        resources: [],
      },
    ],
  },
  {
    id: "c5",
    title: "IoT: Internet of Things",
    instructor: "Dr. Arjun Sharma",
    category: "Robotics",
    thumbnail: require("../assets/images/course_electronics.png"), // TODO: Create unique iot.png image
    duration: "18h 0m",
    lessons: 32,
    rating: 4.8,
    reviews: 231,
    price: 1999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description:
      "Build smart connected devices. Learn ESP32, MQTT protocol, cloud integration, and create your own IoT projects from scratch.",
    level: "Advanced",
    tags: ["IoT", "ESP32", "Cloud"],
    modules: [
      {
        id: "m1",
        title: "Introduction to IoT",
        duration: "45 min",
        isCompleted: false,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        description: "Discover the Internet of Things ecosystem and learn how everyday devices connect to the internet to collect and exchange data. Explore IoT architecture, protocols, and real-world applications from smart homes to industrial automation.",
        notes: [
          "IoT connects physical devices to the internet for data exchange",
          "Key components: sensors, actuators, connectivity, data processing",
          "Common protocols: MQTT, HTTP, CoAP, WebSocket",
          "Applications: smart homes, wearables, industrial IoT, agriculture",
          "Security is critical in IoT implementations"
        ],
        resources: [],
      },
    ],
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Arduino Robotics Starter Kit",
    category: "physical",
    subcategory: "Robotics Kits",
    price: 2999,
    originalPrice: 3999,
    thumbnail: require("../assets/images/product_kit_1.png"),
    description:
      "Complete Arduino-based robotics kit for students. Includes chassis, motors, sensors, wiring, and a step-by-step guide booklet.",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    badge: "Best Seller",
    features: ["Arduino Uno board", "2 DC motors + chassis", "IR & ultrasonic sensors", "Breadboard & jumpers", "Instruction booklet"],
  },
  {
    id: "p2",
    title: "AI & ML Hardware Kit",
    category: "physical",
    subcategory: "AI Kits",
    price: 5999,
    originalPrice: 7499,
    thumbnail: require("../assets/images/product_kit_2.png"),
    description:
      "Raspberry Pi 4-based kit for hands-on AI and machine learning experiments. Comes with camera module, sensors, and pre-loaded AI projects.",
    rating: 4.9,
    reviews: 89,
    inStock: true,
    badge: "New",
    features: ["Raspberry Pi 4 (4GB)", "AI camera module", "Temperature & humidity sensors", "16GB pre-loaded SD card", "Project guide PDF"],
  },
  {
    id: "p3",
    title: "Electronics Exploration Kit",
    category: "physical",
    subcategory: "Electronics Kits",
    price: 1499,
    originalPrice: 1999,
    thumbnail: require("../assets/images/product_kit_3.png"),
    description:
      "Essential electronics kit with resistors, capacitors, LEDs, transistors, and a breadboard. Perfect for hands-on circuit learning.",
    rating: 4.6,
    reviews: 213,
    inStock: true,
    badge: undefined,
    features: ["300+ resistors & capacitors", "Breadboard & jumpers", "Multimeter", "LED assortment", "Component storage box"],
  },
  {
    id: "p4",
    title: "Robotics Complete Notes Bundle",
    category: "digital",
    subcategory: "Notes",
    price: 299,
    originalPrice: 499,
    thumbnail: require("../assets/images/product_notes_1.png"),
    description:
      "50+ pages of handcrafted notes covering robotics fundamentals, Arduino programming, and sensor integration. Perfect exam prep.",
    rating: 4.7,
    reviews: 342,
    inStock: true,
    badge: "Popular",
    features: ["50+ pages PDF", "Circuit diagrams", "Code snippets", "Practice exercises", "Exam tips"],
  },
  {
    id: "p5",
    title: "AI/ML Question Bank 2025",
    category: "digital",
    subcategory: "Question Banks",
    price: 399,
    originalPrice: 599,
    thumbnail: require("../assets/images/product_notes_2.png"),
    description:
      "500+ carefully curated practice questions on AI and machine learning concepts. Includes topic-wise questions and full mock tests.",
    rating: 4.8,
    reviews: 198,
    inStock: true,
    badge: "New",
    features: ["500+ questions", "Topic-wise sorting", "5 mock tests", "Detailed solutions", "Previous year patterns"],
  },
  {
    id: "p6",
    title: "Electronics Premium Study Pack",
    category: "digital",
    subcategory: "Premium Resources",
    price: 549,
    originalPrice: 799,
    thumbnail: require("../assets/images/product_notes_3.png"),
    description:
      "Complete premium study pack including notes, question banks, cheat sheets, and lab manual for electronics students.",
    rating: 4.9,
    reviews: 127,
    inStock: true,
    badge: undefined,
    features: ["Comprehensive notes", "Question bank", "Cheat sheets", "Lab manual", "Video links"],
  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "n1",
    title: "India Launches ₹500 Crore AI Education Initiative for School Students",
    summary: "The Ministry of Education announces a major program to integrate AI, robotics, and coding into the national curriculum for students from Class 6 onwards.",
    content: "The Indian government has announced a landmark ₹500 crore initiative to bring artificial intelligence and robotics education to over 10 million students across the country...",
    category: "Government Initiative",
    author: "Education Desk",
    date: "Jun 6, 2026",
    readTime: "4 min read",
    thumbnail: require("../assets/images/news_1.png"),
    tags: ["AI", "Education Policy", "India"],
  },
  {
    id: "n2",
    title: "Top 10 Robotics Competitions Students Should Enter in 2026",
    summary: "From WRO to First Robotics, here are the best competitions where young engineers can showcase their skills and win scholarships.",
    content: "Participating in robotics competitions is one of the best ways for students to apply their learning, build teamwork skills, and get noticed by universities and companies...",
    category: "Competitions",
    author: "Priya Menon",
    date: "Jun 5, 2026",
    readTime: "6 min read",
    thumbnail: require("../assets/images/news_2.png"),
    tags: ["Robotics", "Competitions", "Scholarships"],
  },
  {
    id: "n3",
    title: "New Research Shows Project-Based Learning Improves STEM Outcomes by 40%",
    summary: "A comprehensive study across 200 schools confirms that hands-on, project-based learning significantly boosts student engagement and performance in STEM subjects.",
    content: "A new study published in the Journal of Educational Research has found that project-based learning approaches lead to 40% better outcomes in STEM subjects compared to traditional methods...",
    category: "Research",
    author: "Dr. Ananya Kapoor",
    date: "Jun 4, 2026",
    readTime: "5 min read",
    thumbnail: require("../assets/images/news_3.png"),
    tags: ["Research", "STEM", "Learning"],
  },
  {
    id: "n4",
    title: "CBSE to Introduce Dedicated AI Stream for Class 11 and 12 from 2027",
    summary: "Central Board of Secondary Education announces a dedicated stream for Artificial Intelligence, Data Science, and Robotics for senior secondary students.",
    content: "In a major curriculum reform, the CBSE has announced that from the academic year 2027-28, students in Classes 11 and 12 will be able to choose a dedicated AI and Data Science stream...",
    category: "Curriculum",
    author: "Education Desk",
    date: "Jun 3, 2026",
    readTime: "3 min read",
    thumbnail: require("../assets/images/news_4.png"),
    tags: ["CBSE", "Curriculum", "AI Education"],
  },
  {
    id: "n5",
    title: "Student from Kerala Wins International Young Scientist Award for AI Project",
    summary: "15-year-old Aryan Suresh from Thiruvananthapuram wins the prestigious award for his AI-powered crop disease detection system using Raspberry Pi.",
    content: "Aryan Suresh, a Class 10 student from a government school in Thiruvananthapuram, has won the International Young Scientist Award for developing an AI-powered crop disease detection system...",
    category: "Student Success",
    author: "Kerala Correspondent",
    date: "Jun 2, 2026",
    readTime: "4 min read",
    thumbnail: require("../assets/images/news_5.png"),
    tags: ["Student Achievement", "AI", "Award"],
  },
];

export const QUIZZES: Quiz[] = [
  {
    id: "q1",
    courseId: "c1",
    title: "Robotics Fundamentals Quiz",
    timeLimit: 600,
    questions: [
      {
        id: "qq1",
        question: "Which microcontroller is commonly used in beginner robotics projects?",
        options: ["Raspberry Pi", "Arduino Uno", "BeagleBone", "NVIDIA Jetson"],
        correctIndex: 1,
        explanation: "Arduino Uno is the most popular microcontroller for beginner robotics due to its simplicity and wide community support.",
      },
      {
        id: "qq2",
        question: "What does PWM stand for in electronics?",
        options: ["Power Width Measurement", "Pulse Width Modulation", "Phase Wave Mode", "Power Watt Module"],
        correctIndex: 1,
        explanation: "PWM stands for Pulse Width Modulation — a technique used to control power delivered to electrical devices.",
      },
      {
        id: "qq3",
        question: "Which sensor is used to detect obstacles in front of a robot?",
        options: ["Temperature sensor", "Ultrasonic sensor", "Light sensor", "Gyroscope"],
        correctIndex: 1,
        explanation: "Ultrasonic sensors emit sound waves and measure the time taken for the echo to return, enabling distance measurement.",
      },
      {
        id: "qq4",
        question: "What is the voltage of a standard Arduino Uno I/O pin?",
        options: ["3.3V", "12V", "5V", "9V"],
        correctIndex: 2,
        explanation: "Arduino Uno operates at 5V logic, and its I/O pins output 5V when HIGH.",
      },
      {
        id: "qq5",
        question: "Which programming language is primarily used with Arduino?",
        options: ["Python", "Java", "C/C++", "JavaScript"],
        correctIndex: 2,
        explanation: "Arduino uses a simplified version of C/C++, making it accessible while still being powerful for hardware control.",
      },
      {
        id: "qq6",
        question: "What component is used to store electrical energy temporarily?",
        options: ["Resistor", "Transistor", "Capacitor", "Diode"],
        correctIndex: 2,
        explanation: "Capacitors store electrical energy in an electric field and release it when needed.",
      },
      {
        id: "qq7",
        question: "Which type of motor provides precise angular positioning?",
        options: ["DC motor", "AC motor", "Stepper motor", "Linear actuator"],
        correctIndex: 2,
        explanation: "Stepper motors rotate in discrete steps, making them ideal for precise positioning in robotic systems.",
      },
      {
        id: "qq8",
        question: "What does IDE stand for in programming?",
        options: ["Integrated Data Environment", "Integrated Development Environment", "Internal Design Editor", "Interface Design Engine"],
        correctIndex: 1,
        explanation: "IDE stands for Integrated Development Environment — software that provides tools for code editing, debugging, and compiling.",
      },
    ],
  },
  {
    id: "q2",
    courseId: "c2",
    title: "AI & ML Concepts Quiz",
    timeLimit: 600,
    questions: [
      {
        id: "qq1",
        question: "What is supervised learning?",
        options: [
          "Learning without any data",
          "Training a model on labeled data",
          "A teacher watching students code",
          "Unsupervised data clustering",
        ],
        correctIndex: 1,
        explanation: "Supervised learning involves training an AI model on a dataset where inputs and correct outputs are provided.",
      },
      {
        id: "qq2",
        question: "Which Python library is most commonly used for machine learning?",
        options: ["NumPy", "Pandas", "Scikit-learn", "Matplotlib"],
        correctIndex: 2,
        explanation: "Scikit-learn is the most popular Python library for implementing machine learning algorithms.",
      },
    ],
  },
];

export const CATEGORIES = ["All", "Robotics", "Artificial Intelligence", "Electronics", "Programming", "IoT"];

export const STORE_CATEGORIES = ["All", "Physical Kits", "Notes", "Question Banks", "Premium Resources"];
