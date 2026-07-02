// ─────────────────────────────────────────────────────────────
// mockData.ts  —  MakersFlow complete mock data
// FIX: All courses are now inside the single COURSES array.
// The original file closed the array after c5 and placed
// c6-c13 as floating objects outside it — causing a syntax error.
// ─────────────────────────────────────────────────────────────

// ── INTERFACES ───────────────────────────────────────────────

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
  isBestseller?: boolean;
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

// ── SHARED VIDEO URL (replace with real URLs when backend ready) ──
const SAMPLE_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

// ── HELPER: minimal module factory ───────────────────────────
const mkModule = (
  id: string,
  title: string,
  duration: string,
  description: string,
  notes: string[],
  isCompleted = false,
  resources: Resource[] = []
): Module => ({
  id,
  title,
  duration,
  isCompleted,
  videoUrl: SAMPLE_VIDEO,
  description,
  notes,
  resources,
});

// ─────────────────────────────────────────────────────────────
// COURSES ARRAY — all courses in one place, array never closes early
// ─────────────────────────────────────────────────────────────
export const COURSES: Course[] = [

  // ── ORIGINAL COURSES (c1–c5) ─────────────────────────────

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
    description: "Master the fundamentals of robotics — from basic circuits to autonomous robots. Build real projects using Arduino and Raspberry Pi. Perfect for students with no prior experience.",
    level: "Beginner",
    tags: ["Arduino", "Sensors", "Automation"],
    modules: [
      mkModule("m1", "Introduction to Robotics", "45 min",
        "Welcome to the world of robotics! Learn fundamental concepts, components, and applications.",
        ["Robots are programmable machines designed to perform tasks autonomously", "Key components: sensors, actuators, controllers, power systems", "Applications span manufacturing, healthcare, and space exploration"],
        true,
        [{ id: "r1", title: "Robotics Basics PDF", type: "pdf", size: "2.4 MB", url: "#" }]
      ),
      mkModule("m2", "Understanding Circuits", "1h 10m",
        "Dive deep into electronic circuits — the backbone of all robotic systems.",
        ["Ohm's Law: V = I × R", "Series circuits: components in a single path", "Parallel circuits: components in multiple branches"],
        true,
        [{ id: "r2", title: "Circuit Diagrams", type: "pdf", size: "1.8 MB", url: "#" }]
      ),
      mkModule("m3", "Arduino Programming Basics", "1h 30m",
        "Master the Arduino programming environment and write code that brings robots to life.",
        ["Arduino IDE setup", "setup() runs once, loop() runs continuously", "Digital pins: HIGH (5V) or LOW (0V)"]
      ),
      mkModule("m4", "Sensor Integration", "55 min",
        "Integrate various sensors with Arduino to give your robot the ability to sense its environment.",
        ["Ultrasonic sensors measure distance using sound waves", "Calibration is essential for accuracy", "Use pullup resistors for reliable readings"]
      ),
      mkModule("m5", "Building Your First Robot", "2h 0m",
        "Put everything together to build your first autonomous robot.",
        ["Start with a simple chassis and add complexity", "Test each component individually before integration", "Safety first: disconnect power when wiring"]
      ),
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
    description: "Understand how AI and machine learning work from the ground up. Learn neural networks, data processing, and build your own AI models using Python.",
    level: "Intermediate",
    tags: ["Python", "Neural Networks", "Data Science"],
    modules: [
      mkModule("m1", "What is Artificial Intelligence?", "30 min",
        "Explore the world of AI and understand what makes machines intelligent.",
        ["AI simulates human intelligence", "Types: Narrow AI vs General AI", "Machine learning is a subset of AI"]
      ),
      mkModule("m2", "Python for AI", "2h 0m",
        "Master Python essentials for AI development — NumPy, Pandas, Matplotlib.",
        ["Python is the most popular AI/ML language", "NumPy: efficient numerical operations", "Pandas: data manipulation"]
      ),
      mkModule("m3", "Machine Learning Algorithms", "3h 20m",
        "Deep dive into ML algorithms — linear regression, decision trees, neural networks.",
        ["Supervised Learning: classification and regression", "Key algorithms: Linear Regression, Random Forests, K-Means", "Model evaluation: accuracy, precision, recall, F1-score"]
      ),
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
    description: "Dive deep into electronics — learn about resistors, capacitors, transistors, and ICs. Design and test your own electronic projects.",
    level: "Beginner",
    tags: ["Electronics", "PCB Design", "Circuits"],
    modules: [
      mkModule("m1", "Basic Electronic Components", "1h 0m",
        "Get familiar with resistors, capacitors, diodes, transistors, and ICs.",
        ["Resistors: control current flow, measured in Ohms", "Capacitors: store electrical charge", "Transistors: act as switches or amplifiers"],
        true
      ),
      mkModule("m2", "Ohm's Law & Kirchhoff's Laws", "1h 20m",
        "Master the fundamental laws of electronics.",
        ["Ohm's Law: V = I × R", "KCL: sum of currents at a node = 0", "KVL: sum of voltages in a loop = 0"]
      ),
    ],
  },

  {
    id: "c4",
    title: "Python Programming for Students",
    instructor: "Dr. Anjali Verma",
    category: "Programming",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "10h 0m",
    lessons: 20,
    rating: 4.6,
    reviews: 189,
    price: 0,
    isFree: true,
    isPurchased: true,
    progress: 80,
    description: "Learn Python from scratch. Covers variables, loops, functions, and object-oriented programming with fun projects.",
    level: "Beginner",
    tags: ["Python", "Programming", "Coding"],
    modules: [
      mkModule("m1", "Python Setup & First Program", "30 min",
        "Set up your dev environment and write your first Python program.",
        ["Install Python from python.org", "print() displays output", "Variables: name = 'John', age = 25"],
        true
      ),
    ],
  },

  {
    id: "c5",
    title: "IoT: Internet of Things",
    instructor: "Dr. Arjun Sharma",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "18h 0m",
    lessons: 32,
    rating: 4.8,
    reviews: 231,
    price: 1999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build smart connected devices. Learn ESP32, MQTT protocol, cloud integration, and create your own IoT projects.",
    level: "Advanced",
    tags: ["IoT", "ESP32", "Cloud"],
    modules: [
      mkModule("m1", "Introduction to IoT", "45 min",
        "Discover the IoT ecosystem and how everyday devices connect to the internet.",
        ["IoT connects physical devices to the internet", "Common protocols: MQTT, HTTP, CoAP", "Security is critical in IoT"]
      ),
    ],
  },

  // ── ROBOTICS (c6–c13) ────────────────────────────────────

  {
    id: "c6",
    title: "Robotics Fundamentals",
    instructor: "Dr. Arjun Sharma",
    category: "Robotics",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "14h 0m",
    lessons: 28,
    rating: 4.7,
    reviews: 245,
    price: 1599,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Deep dive into robotics fundamentals covering kinematics, dynamics, and control systems.",
    level: "Intermediate",
    tags: ["Kinematics", "Control Systems", "Robotics Theory"],
    modules: [
      mkModule("m1", "Introduction to Robotics Fundamentals", "50 min",
        "Learn theoretical foundations of robotics including coordinate systems and robot anatomy.",
        ["Robot kinematics basics", "Degrees of freedom", "Forward and inverse kinematics"]
      ),
    ],
  },

  {
    id: "c7",
    title: "Mobile Robot Design and Control",
    instructor: "Prof. Rajesh Kumar",
    category: "Robotics",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "16h 30m",
    lessons: 32,
    rating: 4.8,
    reviews: 189,
    price: 1899,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Design and build mobile robots from scratch. Learn path planning, navigation, and autonomous control.",
    level: "Advanced",
    tags: ["Mobile Robots", "Navigation", "Path Planning"],
    modules: [
      mkModule("m1", "Mobile Robot Architecture", "1h 0m",
        "Understand the architecture and components of mobile robots.",
        ["Wheel configurations", "Sensor placement", "Power systems"]
      ),
    ],
  },

  {
    id: "c8",
    title: "Autonomous Robotics for Beginners",
    instructor: "Dr. Priya Singh",
    category: "Robotics",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "12h 0m",
    lessons: 24,
    rating: 4.6,
    reviews: 312,
    price: 1299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build autonomous robots that navigate and make decisions independently using sensors and AI.",
    level: "Beginner",
    tags: ["Autonomous Systems", "Decision Making", "Sensors"],
    modules: [
      mkModule("m1", "Introduction to Autonomous Systems", "45 min",
        "Learn what makes a robot autonomous and the key components needed.",
        ["Autonomy levels", "Sensor fusion", "Decision algorithms"]
      ),
    ],
  },

  {
    id: "c9",
    title: "Industrial Robotics Essentials",
    instructor: "Eng. Vikram Mehta",
    category: "Robotics",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "18h 0m",
    lessons: 36,
    rating: 4.9,
    reviews: 156,
    price: 2299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Master industrial robotics including robotic arms, manufacturing automation, and safety standards.",
    level: "Advanced",
    tags: ["Industrial Robots", "Manufacturing", "Automation"],
    modules: [
      mkModule("m1", "Industrial Robot Types", "1h 10m",
        "Explore different types of industrial robots and their applications.",
        ["Articulated robots", "SCARA robots", "Delta robots", "Safety protocols"]
      ),
    ],
  },

  {
    id: "c10",
    title: "Line Follower Robot Project",
    instructor: "Dr. Arjun Sharma",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "8h 0m",
    lessons: 16,
    rating: 4.7,
    reviews: 428,
    price: 999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build a complete line follower robot from scratch — perfect hands-on project for beginners.",
    level: "Beginner",
    tags: ["Arduino", "Project", "IR Sensors"],
    modules: [
      mkModule("m1", "Line Follower Basics", "40 min",
        "Understand how line follower robots work and plan your build.",
        ["IR sensor working", "PID control basics", "Motor driver circuits"]
      ),
    ],
  },

  {
    id: "c11",
    title: "Obstacle Avoiding Robot Project",
    instructor: "Eng. Ravi Krishnan",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "9h 30m",
    lessons: 18,
    rating: 4.8,
    reviews: 389,
    price: 1099,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Create an intelligent robot that navigates around obstacles using ultrasonic sensors.",
    level: "Beginner",
    tags: ["Arduino", "Ultrasonic", "Navigation"],
    modules: [
      mkModule("m1", "Obstacle Detection Systems", "45 min",
        "Learn how robots detect and avoid obstacles.",
        ["Ultrasonic sensors", "Decision logic", "Motor control"]
      ),
    ],
  },

  {
    id: "c12",
    title: "Robotic Arm Design and Programming",
    instructor: "Dr. Priya Singh",
    category: "Robotics",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "15h 0m",
    lessons: 30,
    rating: 4.9,
    reviews: 234,
    price: 1799,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Design, build, and program a multi-axis robotic arm with precise movement control.",
    level: "Intermediate",
    tags: ["Robotic Arm", "Servo Motors", "Inverse Kinematics"],
    modules: [
      mkModule("m1", "Robotic Arm Fundamentals", "1h 0m",
        "Learn the basics of robotic arm design and kinematics.",
        ["Degrees of freedom", "Servo control", "Coordinate systems"]
      ),
    ],
  },

  {
    id: "c13",
    title: "ROS (Robot Operating System) Basics",
    instructor: "Prof. Rajesh Kumar",
    category: "Robotics",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "20h 0m",
    lessons: 40,
    rating: 4.8,
    reviews: 178,
    price: 2499,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Master ROS — the industry standard framework for building complex robotic systems.",
    level: "Advanced",
    tags: ["ROS", "Linux", "Robotics Framework"],
    modules: [
      mkModule("m1", "Introduction to ROS", "1h 15m",
        "Get started with Robot Operating System and understand its architecture.",
        ["ROS nodes", "Topics and messages", "ROS workspace setup"]
      ),
    ],
  },

  // ── ELECTRONICS (c14–c20) ────────────────────────────────

  {
    id: "c14",
    title: "Basic Electronics for Engineers",
    instructor: "Eng. Ravi Krishnan",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "12h 0m",
    lessons: 24,
    rating: 4.7,
    reviews: 310,
    price: 1199,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build a strong foundation in electronics — essential for every engineering student.",
    level: "Beginner",
    tags: ["Electronics", "Engineering", "Circuits"],
    modules: [
      mkModule("m1", "Fundamentals of Electronics", "1h 0m",
        "Introduction to basic electronic principles and components.",
        ["Voltage, current, resistance basics", "Active vs passive components", "Reading circuit diagrams"]
      ),
    ],
  },

  {
    id: "c15",
    title: "Electronic Components and Circuit Design",
    instructor: "Eng. Ravi Krishnan",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "14h 0m",
    lessons: 28,
    rating: 4.6,
    reviews: 198,
    price: 1399,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Learn to identify, select, and use electronic components to design functional circuits.",
    level: "Beginner",
    tags: ["Circuit Design", "Components", "Prototyping"],
    modules: [
      mkModule("m1", "Component Selection Guide", "50 min",
        "How to choose the right components for your circuit designs.",
        ["Resistor colour codes", "Capacitor types and uses", "Transistor biasing"]
      ),
    ],
  },

  {
    id: "c16",
    title: "Analog and Digital Electronics",
    instructor: "Dr. Anjali Verma",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "16h 0m",
    lessons: 32,
    rating: 4.8,
    reviews: 267,
    price: 1499,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Master both analog and digital electronics — from op-amps to logic gates and microcontrollers.",
    level: "Intermediate",
    tags: ["Analog", "Digital", "Op-Amps", "Logic Gates"],
    modules: [
      mkModule("m1", "Analog vs Digital Signals", "45 min",
        "Understand the fundamental difference between analog and digital systems.",
        ["Analog: continuous signals", "Digital: discrete 0s and 1s", "ADC and DAC conversion"]
      ),
    ],
  },

  {
    id: "c17",
    title: "PCB Design Using KiCad",
    instructor: "Eng. Vikram Mehta",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "10h 0m",
    lessons: 20,
    rating: 4.7,
    reviews: 145,
    price: 1299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Design professional PCBs using the industry-standard KiCad EDA software.",
    level: "Intermediate",
    tags: ["PCB", "KiCad", "EDA", "Circuit Board"],
    modules: [
      mkModule("m1", "KiCad Interface Overview", "1h 0m",
        "Get familiar with KiCad's interface, schematic editor, and PCB layout.",
        ["Schematic capture workflow", "Footprint assignment", "PCB layout rules"]
      ),
    ],
  },

  {
    id: "c18",
    title: "Sensors and Actuators Masterclass",
    instructor: "Dr. Arjun Sharma",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "11h 0m",
    lessons: 22,
    rating: 4.8,
    reviews: 189,
    price: 1199,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Comprehensive guide to sensors and actuators used in electronics and robotics projects.",
    level: "Intermediate",
    tags: ["Sensors", "Actuators", "Interfacing"],
    modules: [
      mkModule("m1", "Introduction to Sensors", "40 min",
        "Overview of sensor types, working principles, and selection criteria.",
        ["Temperature, humidity, pressure sensors", "Proximity and distance sensors", "Sensor interfacing with microcontrollers"]
      ),
    ],
  },

  {
    id: "c19",
    title: "Power Electronics Fundamentals",
    instructor: "Eng. Vikram Mehta",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "13h 0m",
    lessons: 26,
    rating: 4.6,
    reviews: 123,
    price: 1399,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Study power electronics — converters, inverters, and motor drives used in industry.",
    level: "Advanced",
    tags: ["Power Electronics", "Converters", "Motor Drives"],
    modules: [
      mkModule("m1", "Power Electronics Overview", "1h 0m",
        "Introduction to power electronics and its applications in modern systems.",
        ["DC-DC converters", "AC-DC rectifiers", "Inverter basics"]
      ),
    ],
  },

  {
    id: "c20",
    title: "Electronic Troubleshooting Techniques",
    instructor: "Eng. Ravi Krishnan",
    category: "Electronics",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "8h 0m",
    lessons: 16,
    rating: 4.9,
    reviews: 234,
    price: 999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Learn systematic techniques to diagnose and fix faults in electronic circuits and systems.",
    level: "Intermediate",
    tags: ["Troubleshooting", "Debugging", "Multimeter"],
    modules: [
      mkModule("m1", "Systematic Troubleshooting Approach", "45 min",
        "Learn a structured methodology for diagnosing circuit faults.",
        ["Symptom analysis", "Using a multimeter effectively", "Common failure modes"]
      ),
    ],
  },

  // ── IoT (c21–c27) ────────────────────────────────────────

  {
    id: "c21",
    title: "IoT Fundamentals",
    instructor: "Dr. Arjun Sharma",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "10h 0m",
    lessons: 20,
    rating: 4.7,
    reviews: 289,
    price: 1299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Complete introduction to IoT — architecture, protocols, connectivity, and cloud integration.",
    level: "Beginner",
    tags: ["IoT", "MQTT", "Cloud", "Connectivity"],
    modules: [
      mkModule("m1", "IoT Architecture and Layers", "1h 0m",
        "Understand the layered architecture of IoT systems.",
        ["Perception layer: sensors and devices", "Network layer: connectivity", "Application layer: data processing"]
      ),
    ],
  },

  {
    id: "c22",
    title: "ESP32 and IoT Projects",
    instructor: "Prof. Rajesh Kumar",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "14h 0m",
    lessons: 28,
    rating: 4.8,
    reviews: 312,
    price: 1499,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build real IoT projects using the powerful ESP32 microcontroller with WiFi and Bluetooth.",
    level: "Intermediate",
    tags: ["ESP32", "WiFi", "Bluetooth", "IoT Projects"],
    modules: [
      mkModule("m1", "ESP32 Getting Started", "1h 0m",
        "Set up your ESP32 development environment and run your first program.",
        ["ESP32 pinout and specifications", "Arduino IDE setup for ESP32", "WiFi connection basics"]
      ),
    ],
  },

  {
    id: "c23",
    title: "Smart Home Automation using IoT",
    instructor: "Dr. Priya Singh",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "12h 0m",
    lessons: 24,
    rating: 4.9,
    reviews: 456,
    price: 1599,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build a complete smart home system with voice control, automation, and mobile app integration.",
    level: "Intermediate",
    tags: ["Smart Home", "Automation", "Voice Control"],
    modules: [
      mkModule("m1", "Smart Home Architecture", "50 min",
        "Design the architecture of a full smart home automation system.",
        ["Hub and spoke vs mesh topology", "Choosing the right protocol", "Security considerations"]
      ),
    ],
  },

  {
    id: "c24",
    title: "IoT with Arduino and Sensors",
    instructor: "Eng. Ravi Krishnan",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "11h 0m",
    lessons: 22,
    rating: 4.7,
    reviews: 198,
    price: 1199,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Connect Arduino to the internet and build sensor-based IoT projects with real-time monitoring.",
    level: "Beginner",
    tags: ["Arduino", "IoT", "Sensors", "WiFi"],
    modules: [
      mkModule("m1", "Connecting Arduino to the Internet", "1h 0m",
        "Learn to connect Arduino boards to WiFi using shields and modules.",
        ["ESP8266 WiFi module setup", "HTTP GET and POST requests", "Sending sensor data to cloud"]
      ),
    ],
  },

  {
    id: "c25",
    title: "Cloud Connected IoT Systems",
    instructor: "Prof. Rajesh Kumar",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "15h 0m",
    lessons: 30,
    rating: 4.8,
    reviews: 167,
    price: 1799,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Integrate IoT devices with AWS IoT, Firebase, and other cloud platforms for scalable solutions.",
    level: "Advanced",
    tags: ["AWS IoT", "Firebase", "Cloud", "Scalability"],
    modules: [
      mkModule("m1", "Cloud Platforms for IoT", "1h 15m",
        "Overview of major cloud platforms and their IoT services.",
        ["AWS IoT Core setup", "Firebase Realtime Database", "ThingSpeak for data visualization"]
      ),
    ],
  },

  {
    id: "c26",
    title: "Industrial IoT (IIoT) Basics",
    instructor: "Eng. Vikram Mehta",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "13h 0m",
    lessons: 26,
    rating: 4.7,
    reviews: 134,
    price: 1699,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Apply IoT in industrial settings — predictive maintenance, asset tracking, and factory automation.",
    level: "Advanced",
    tags: ["IIoT", "Industry 4.0", "Predictive Maintenance"],
    modules: [
      mkModule("m1", "IIoT vs Consumer IoT", "45 min",
        "Understand the key differences and requirements of industrial IoT.",
        ["Reliability requirements", "Real-time constraints", "Industrial protocols: Modbus, OPC-UA"]
      ),
    ],
  },

  {
    id: "c27",
    title: "Real-Time IoT Dashboard Development",
    instructor: "Dr. Anjali Verma",
    category: "IoT",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "9h 0m",
    lessons: 18,
    rating: 4.6,
    reviews: 112,
    price: 1099,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build beautiful real-time dashboards to visualise IoT sensor data using Node-RED and Grafana.",
    level: "Intermediate",
    tags: ["Dashboard", "Node-RED", "Grafana", "Visualisation"],
    modules: [
      mkModule("m1", "Node-RED Introduction", "50 min",
        "Get started with Node-RED for visual IoT programming.",
        ["Flow-based programming", "MQTT nodes", "Dashboard widgets"]
      ),
    ],
  },

  // ── EMBEDDED SYSTEMS (c28–c34) ───────────────────────────

  {
    id: "c28",
    title: "Embedded Systems Fundamentals",
    instructor: "Eng. Vikram Mehta",
    category: "Embedded Systems",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "14h 0m",
    lessons: 28,
    rating: 4.8,
    reviews: 223,
    price: 1499,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Introduction to embedded systems — hardware, software, and real-time constraints.",
    level: "Beginner",
    tags: ["Embedded", "Microcontrollers", "Real-Time"],
    modules: [
      mkModule("m1", "What is an Embedded System?", "1h 0m",
        "Understand embedded systems, their characteristics, and applications.",
        ["Definition and characteristics", "Examples in everyday life", "Hardware vs software co-design"]
      ),
    ],
  },

  {
    id: "c29",
    title: "Embedded C Programming",
    instructor: "Prof. Rajesh Kumar",
    category: "Embedded Systems",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "16h 0m",
    lessons: 32,
    rating: 4.9,
    reviews: 345,
    price: 1699,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Master C programming specifically for embedded systems — registers, interrupts, and memory management.",
    level: "Intermediate",
    tags: ["C Programming", "Registers", "Interrupts"],
    modules: [
      mkModule("m1", "C for Embedded Systems", "1h 15m",
        "Learn how C programming differs in an embedded context.",
        ["Bit manipulation", "Volatile keyword", "Memory-mapped I/O"]
      ),
    ],
  },

  {
    id: "c30",
    title: "Microcontrollers with Arduino",
    instructor: "Dr. Arjun Sharma",
    category: "Embedded Systems",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "12h 0m",
    lessons: 24,
    rating: 4.7,
    reviews: 412,
    price: 1299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Deep dive into microcontroller programming using Arduino as the learning platform.",
    level: "Beginner",
    tags: ["Microcontrollers", "Arduino", "AVR"],
    modules: [
      mkModule("m1", "Inside the Microcontroller", "1h 0m",
        "Understand the internal architecture of a microcontroller.",
        ["CPU, RAM, Flash memory", "GPIO ports", "Timers and counters"]
      ),
    ],
  },

  {
    id: "c31",
    title: "STM32 Development Bootcamp",
    instructor: "Eng. Vikram Mehta",
    category: "Embedded Systems",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "18h 0m",
    lessons: 36,
    rating: 4.8,
    reviews: 156,
    price: 1999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Master STM32 ARM Cortex-M microcontrollers using STM32CubeIDE and HAL libraries.",
    level: "Advanced",
    tags: ["STM32", "ARM", "CubeIDE", "HAL"],
    modules: [
      mkModule("m1", "STM32 Ecosystem Overview", "1h 0m",
        "Introduction to the STM32 family and development tools.",
        ["STM32 variants and selection", "STM32CubeIDE setup", "HAL vs LL libraries"]
      ),
    ],
  },

  {
    id: "c32",
    title: "ESP32 Complete Guide",
    instructor: "Prof. Rajesh Kumar",
    category: "Embedded Systems",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "15h 0m",
    lessons: 30,
    rating: 4.9,
    reviews: 389,
    price: 1599,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Complete guide to ESP32 — WiFi, Bluetooth, FreeRTOS, deep sleep, and advanced peripherals.",
    level: "Intermediate",
    tags: ["ESP32", "FreeRTOS", "BLE", "Deep Sleep"],
    modules: [
      mkModule("m1", "ESP32 Architecture Deep Dive", "1h 15m",
        "Understand the ESP32 dual-core architecture and its capabilities.",
        ["Xtensa LX6 dual-core", "Memory layout", "Peripheral overview"]
      ),
    ],
  },

  {
    id: "c33",
    title: "Real-Time Operating Systems (RTOS)",
    instructor: "Eng. Vikram Mehta",
    category: "Embedded Systems",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "14h 0m",
    lessons: 28,
    rating: 4.8,
    reviews: 134,
    price: 1799,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Learn RTOS concepts — tasks, scheduling, semaphores, and queues using FreeRTOS.",
    level: "Advanced",
    tags: ["RTOS", "FreeRTOS", "Tasks", "Scheduling"],
    modules: [
      mkModule("m1", "Introduction to RTOS", "1h 0m",
        "Understand what an RTOS is and why it is used in embedded systems.",
        ["Task scheduling algorithms", "Preemptive vs cooperative multitasking", "FreeRTOS task creation"]
      ),
    ],
  },

  {
    id: "c34",
    title: "Embedded Linux Basics",
    instructor: "Prof. Rajesh Kumar",
    category: "Embedded Systems",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "17h 0m",
    lessons: 34,
    rating: 4.7,
    reviews: 112,
    price: 1999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Run Linux on embedded hardware — Raspberry Pi, Yocto, device drivers, and cross-compilation.",
    level: "Advanced",
    tags: ["Linux", "Raspberry Pi", "Yocto", "Device Drivers"],
    modules: [
      mkModule("m1", "Linux on Embedded Hardware", "1h 0m",
        "Introduction to running Linux on resource-constrained embedded devices.",
        ["Kernel vs userspace", "Boot process overview", "Cross-compilation basics"]
      ),
    ],
  },

  // ── ARDUINO & PROJECTS (c35–c41) ─────────────────────────

  {
    id: "c35",
    title: "Arduino for Beginners",
    instructor: "Dr. Arjun Sharma",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "10h 0m",
    lessons: 20,
    rating: 4.9,
    reviews: 678,
    price: 999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Start your Arduino journey — learn to program, connect sensors, and build your first projects.",
    level: "Beginner",
    tags: ["Arduino", "Beginner", "Projects"],
    modules: [
      mkModule("m1", "Your First Arduino Sketch", "45 min",
        "Write and upload your very first Arduino program.",
        ["Blink LED — the Hello World of Arduino", "Upload process", "Serial monitor basics"]
      ),
    ],
  },

  {
    id: "c36",
    title: "Arduino Project-Based Learning",
    instructor: "Eng. Ravi Krishnan",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "14h 0m",
    lessons: 28,
    rating: 4.8,
    reviews: 456,
    price: 1299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Learn Arduino through 10 practical projects — from LED matrix to servo control and displays.",
    level: "Beginner",
    tags: ["Arduino", "Projects", "Hands-On"],
    modules: [
      mkModule("m1", "Project Planning Approach", "30 min",
        "How to plan, design, and build Arduino projects systematically.",
        ["Requirements gathering", "Circuit design first", "Iterative prototyping"]
      ),
    ],
  },

  {
    id: "c37",
    title: "Smart Agriculture System",
    instructor: "Dr. Priya Singh",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "11h 0m",
    lessons: 22,
    rating: 4.7,
    reviews: 234,
    price: 1199,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build an automated irrigation and crop monitoring system using Arduino and IoT sensors.",
    level: "Intermediate",
    tags: ["Agriculture", "Automation", "IoT", "Arduino"],
    modules: [
      mkModule("m1", "Smart Agriculture Overview", "45 min",
        "Introduction to precision agriculture and IoT applications in farming.",
        ["Soil moisture sensing", "Automated irrigation logic", "Remote monitoring via app"]
      ),
    ],
  },

  {
    id: "c38",
    title: "Smart Parking System",
    instructor: "Eng. Vikram Mehta",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "9h 0m",
    lessons: 18,
    rating: 4.6,
    reviews: 178,
    price: 1099,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Design and build an automated smart parking system with real-time slot detection and display.",
    level: "Intermediate",
    tags: ["Smart Parking", "IR Sensors", "LCD Display"],
    modules: [
      mkModule("m1", "Parking System Architecture", "40 min",
        "Design the hardware and software architecture of a smart parking system.",
        ["IR sensor grid", "Slot counter logic", "LCD display integration"]
      ),
    ],
  },

  {
    id: "c39",
    title: "Smart Energy Monitoring System",
    instructor: "Eng. Ravi Krishnan",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "10h 0m",
    lessons: 20,
    rating: 4.8,
    reviews: 145,
    price: 1199,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build a home energy monitoring system that tracks and reports real-time power consumption.",
    level: "Intermediate",
    tags: ["Energy Monitoring", "Current Sensor", "IoT"],
    modules: [
      mkModule("m1", "Current and Voltage Measurement", "1h 0m",
        "Learn to measure AC current and voltage safely using Arduino.",
        ["ACS712 current sensor", "ZMPT101B voltage sensor", "Power factor calculation"]
      ),
    ],
  },

  {
    id: "c40",
    title: "Weather Monitoring Station",
    instructor: "Dr. Anjali Verma",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "8h 0m",
    lessons: 16,
    rating: 4.7,
    reviews: 267,
    price: 999,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build a complete weather station that monitors temperature, humidity, pressure, and rainfall.",
    level: "Beginner",
    tags: ["Weather", "DHT22", "BMP280", "Arduino"],
    modules: [
      mkModule("m1", "Environmental Sensors Overview", "45 min",
        "Introduction to sensors for measuring environmental conditions.",
        ["DHT22 for temperature and humidity", "BMP280 for pressure and altitude", "Rain gauge circuit"]
      ),
    ],
  },

  {
    id: "c41",
    title: "Home Security System using Arduino",
    instructor: "Dr. Arjun Sharma",
    category: "Arduino & Projects",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "12h 0m",
    lessons: 24,
    rating: 4.9,
    reviews: 312,
    price: 1299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build a complete home security system with motion detection, alarms, and SMS alerts.",
    level: "Intermediate",
    tags: ["Security", "PIR Sensor", "GSM", "Alarm"],
    modules: [
      mkModule("m1", "Security System Architecture", "1h 0m",
        "Design a layered home security system architecture.",
        ["PIR motion detection", "Door/window sensors", "GSM SMS alerts"]
      ),
    ],
  },

  // ── AI + ROBOTICS (c42–c46) ──────────────────────────────

  {
    id: "c42",
    title: "AI for Robotics",
    instructor: "Prof. Meera Nair",
    category: "AI + Robotics",
    thumbnail: require("../assets/images/course_ai.png"),
    duration: "16h 0m",
    lessons: 32,
    rating: 4.9,
    reviews: 267,
    price: 2199,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Apply AI techniques to robotic systems — planning, perception, and decision-making.",
    level: "Advanced",
    tags: ["AI", "Robotics", "Planning", "Perception"],
    modules: [
      mkModule("m1", "AI and Robotics Integration", "1h 0m",
        "How AI enhances robotic capabilities beyond simple automation.",
        ["Perception vs reasoning", "Learning from demonstration", "Reinforcement learning basics"]
      ),
    ],
  },

  {
    id: "c43",
    title: "Computer Vision for Robots",
    instructor: "Prof. Meera Nair",
    category: "AI + Robotics",
    thumbnail: require("../assets/images/course_ai.png"),
    duration: "18h 0m",
    lessons: 36,
    rating: 4.8,
    reviews: 189,
    price: 2299,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Use OpenCV and deep learning to give robots the ability to see and understand their environment.",
    level: "Advanced",
    tags: ["OpenCV", "Computer Vision", "Deep Learning"],
    modules: [
      mkModule("m1", "Introduction to Computer Vision", "1h 0m",
        "Understanding how computers interpret visual information.",
        ["Image representation", "OpenCV setup", "Basic image processing operations"]
      ),
    ],
  },

  {
    id: "c44",
    title: "Machine Learning in Robotics",
    instructor: "Prof. Meera Nair",
    category: "AI + Robotics",
    thumbnail: require("../assets/images/course_ai.png"),
    duration: "15h 0m",
    lessons: 30,
    rating: 4.7,
    reviews: 156,
    price: 2099,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Apply ML algorithms to solve real robotic challenges like grasping, navigation, and control.",
    level: "Advanced",
    tags: ["Machine Learning", "Robotics", "Reinforcement Learning"],
    modules: [
      mkModule("m1", "ML Applications in Robotics", "1h 0m",
        "Survey of ML techniques applied to robotic systems.",
        ["Supervised learning for classification", "Reinforcement learning for control", "Transfer learning in robotics"]
      ),
    ],
  },

  {
    id: "c45",
    title: "Autonomous Vehicle Fundamentals",
    instructor: "Prof. Rajesh Kumar",
    category: "AI + Robotics",
    thumbnail: require("../assets/images/course_ai.png"),
    duration: "20h 0m",
    lessons: 40,
    rating: 4.9,
    reviews: 345,
    price: 2499,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Learn the technology behind self-driving cars — sensors, perception, planning, and control.",
    level: "Advanced",
    tags: ["Self-Driving", "LiDAR", "Path Planning", "Control"],
    modules: [
      mkModule("m1", "Autonomous Vehicle Architecture", "1h 15m",
        "Overview of the software and hardware stack in autonomous vehicles.",
        ["Sensor suite: cameras, LiDAR, radar", "Perception pipeline", "Decision making and control"]
      ),
    ],
  },

  {
    id: "c46",
    title: "AI Powered Smart Devices",
    instructor: "Dr. Anjali Verma",
    category: "AI + Robotics",
    thumbnail: require("../assets/images/course_ai.png"),
    duration: "12h 0m",
    lessons: 24,
    rating: 4.8,
    reviews: 198,
    price: 1799,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build smart devices that use on-device AI for voice recognition, face detection, and more.",
    level: "Intermediate",
    tags: ["TinyML", "Edge AI", "Smart Devices"],
    modules: [
      mkModule("m1", "Edge AI and TinyML", "50 min",
        "Introduction to running AI models on microcontrollers and edge devices.",
        ["TensorFlow Lite for Microcontrollers", "Model quantization", "Edge Impulse platform"]
      ),
    ],
  },

  // ── DRONE TECHNOLOGY (c47–c50) ───────────────────────────

  {
    id: "c47",
    title: "Drone Design and Assembly",
    instructor: "Eng. Vikram Mehta",
    category: "Drone Technology",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "14h 0m",
    lessons: 28,
    rating: 4.8,
    reviews: 234,
    price: 1899,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Design and assemble a quadcopter drone from scratch — frame, motors, ESCs, and flight controller.",
    level: "Intermediate",
    tags: ["Drone", "Quadcopter", "ESC", "Flight Controller"],
    modules: [
      mkModule("m1", "Drone Components Overview", "1h 0m",
        "Understand every component that makes up a modern quadcopter.",
        ["Frame types and materials", "Brushless motors and ratings", "ESC selection and calibration"]
      ),
    ],
  },

  {
    id: "c48",
    title: "Drone Programming Basics",
    instructor: "Prof. Rajesh Kumar",
    category: "Drone Technology",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "12h 0m",
    lessons: 24,
    rating: 4.7,
    reviews: 167,
    price: 1699,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Program drone flight paths, autonomous missions, and custom behaviours using ArduPilot and MAVLink.",
    level: "Intermediate",
    tags: ["ArduPilot", "MAVLink", "Autonomous Flight"],
    modules: [
      mkModule("m1", "ArduPilot and Mission Planner", "1h 0m",
        "Set up ArduPilot firmware and Mission Planner ground station software.",
        ["Firmware flashing", "Parameter configuration", "Mission planning basics"]
      ),
    ],
  },

  {
    id: "c49",
    title: "UAV Systems and Applications",
    instructor: "Eng. Vikram Mehta",
    category: "Drone Technology",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "11h 0m",
    lessons: 22,
    rating: 4.6,
    reviews: 145,
    price: 1599,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Explore UAV applications in agriculture, surveying, search and rescue, and delivery.",
    level: "Intermediate",
    tags: ["UAV", "Applications", "Surveying", "Agriculture"],
    modules: [
      mkModule("m1", "UAV Application Domains", "50 min",
        "Survey of UAV use cases across different industries.",
        ["Precision agriculture mapping", "Infrastructure inspection", "Emergency response operations"]
      ),
    ],
  },

  {
    id: "c50",
    title: "Autonomous Drone Navigation",
    instructor: "Prof. Meera Nair",
    category: "Drone Technology",
    thumbnail: require("../assets/images/course_robotics.png"),
    duration: "16h 0m",
    lessons: 32,
    rating: 4.9,
    reviews: 189,
    price: 2199,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Build drones that can navigate autonomously — obstacle avoidance, GPS waypoints, and SLAM.",
    level: "Advanced",
    tags: ["Autonomous", "SLAM", "GPS", "Obstacle Avoidance"],
    modules: [
      mkModule("m1", "Autonomous Navigation Fundamentals", "1h 15m",
        "Core concepts behind autonomous drone navigation.",
        ["GPS and coordinate systems", "PID tuning for stability", "SLAM basics"]
      ),
    ],
  },

  // ── INDUSTRY 4.0 (c51–c54) ───────────────────────────────

  {
    id: "c51",
    title: "Industry 4.0 Fundamentals",
    instructor: "Eng. Vikram Mehta",
    category: "Industry 4.0",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "10h 0m",
    lessons: 20,
    rating: 4.7,
    reviews: 189,
    price: 1399,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Understand the fourth industrial revolution — IoT, AI, cyber-physical systems, and smart factories.",
    level: "Beginner",
    tags: ["Industry 4.0", "Smart Factory", "Cyber-Physical"],
    modules: [
      mkModule("m1", "What is Industry 4.0?", "1h 0m",
        "Introduction to the fourth industrial revolution and its key technologies.",
        ["Nine pillars of Industry 4.0", "Cyber-physical systems", "Digital twin concept"]
      ),
    ],
  },

  {
    id: "c52",
    title: "Smart Manufacturing Systems",
    instructor: "Prof. Rajesh Kumar",
    category: "Industry 4.0",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "13h 0m",
    lessons: 26,
    rating: 4.8,
    reviews: 134,
    price: 1599,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Learn how smart manufacturing uses data, automation, and AI to optimise production.",
    level: "Intermediate",
    tags: ["Smart Manufacturing", "Automation", "Data Analytics"],
    modules: [
      mkModule("m1", "Smart Manufacturing Architecture", "1h 0m",
        "Overview of smart manufacturing systems and their components.",
        ["MES systems", "Real-time production monitoring", "Predictive quality control"]
      ),
    ],
  },

  {
    id: "c53",
    title: "Industrial Automation using PLC",
    instructor: "Eng. Vikram Mehta",
    category: "Industry 4.0",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "15h 0m",
    lessons: 30,
    rating: 4.9,
    reviews: 223,
    price: 1799,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Program PLCs to automate industrial processes — ladder logic, function blocks, and HMI design.",
    level: "Intermediate",
    tags: ["PLC", "Ladder Logic", "HMI", "Automation"],
    modules: [
      mkModule("m1", "Introduction to PLCs", "1h 0m",
        "What is a PLC and why is it the backbone of industrial automation.",
        ["PLC architecture: CPU, I/O modules, power supply", "Scan cycle explained", "Ladder diagram basics"]
      ),
    ],
  },

  {
    id: "c54",
    title: "SCADA Systems for Beginners",
    instructor: "Prof. Rajesh Kumar",
    category: "Industry 4.0",
    thumbnail: require("../assets/images/course_electronics.png"),
    duration: "11h 0m",
    lessons: 22,
    rating: 4.7,
    reviews: 145,
    price: 1499,
    isFree: false,
    isPurchased: false,
    progress: 0,
    description: "Learn SCADA systems for monitoring and controlling industrial processes remotely.",
    level: "Beginner",
    tags: ["SCADA", "HMI", "Industrial Monitoring"],
    modules: [
      mkModule("m1", "SCADA Architecture", "50 min",
        "Understand the components and architecture of SCADA systems.",
        ["RTU and PLC field devices", "Communication protocols", "SCADA software overview"]
      ),
    ],
  },

]; // ← ONE closing bracket for the entire COURSES array

// ─────────────────────────────────────────────────────────────
// PRODUCTS (unchanged from original)
// ─────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Arduino Robotics Starter Kit",
    category: "physical",
    subcategory: "Robotics Kits",
    price: 2999,
    originalPrice: 3999,
    thumbnail: require("../assets/images/product_kit_1.png"),
    description: "Complete Arduino-based robotics kit for students. Includes chassis, motors, sensors, wiring, and a step-by-step guide booklet.",
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
    description: "Raspberry Pi 4-based kit for hands-on AI and machine learning experiments.",
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
    description: "Essential electronics kit with resistors, capacitors, LEDs, transistors, and a breadboard.",
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
    description: "50+ pages of handcrafted notes covering robotics fundamentals, Arduino programming, and sensor integration.",
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
    description: "500+ carefully curated practice questions on AI and machine learning concepts.",
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
    description: "Complete premium study pack including notes, question banks, cheat sheets, and lab manual.",
    rating: 4.9,
    reviews: 127,
    inStock: true,
    badge: undefined,
    features: ["Comprehensive notes", "Question bank", "Cheat sheets", "Lab manual", "Video links"],
  },
];

// ─────────────────────────────────────────────────────────────
// NEWS (unchanged from original)
// ─────────────────────────────────────────────────────────────
export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "n1",
    title: "India Launches ₹500 Crore AI Education Initiative for School Students",
    summary: "The Ministry of Education announces a major program to integrate AI, robotics, and coding into the national curriculum.",
    content: "The Indian government has announced a landmark ₹500 crore initiative to bring AI and robotics education to over 10 million students...",
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
    summary: "From WRO to First Robotics, here are the best competitions where young engineers can showcase their skills.",
    content: "Participating in robotics competitions is one of the best ways for students to apply their learning...",
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
    summary: "A comprehensive study across 200 schools confirms hands-on learning boosts STEM engagement.",
    content: "A new study found that project-based learning leads to 40% better outcomes in STEM subjects...",
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
    summary: "CBSE announces a dedicated stream for AI, Data Science, and Robotics for senior secondary students.",
    content: "From 2027-28, students in Classes 11 and 12 will be able to choose a dedicated AI and Data Science stream...",
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
    summary: "15-year-old Aryan Suresh wins the prestigious award for his AI-powered crop disease detection system.",
    content: "Aryan Suresh, a Class 10 student, has won the International Young Scientist Award...",
    category: "Student Success",
    author: "Kerala Correspondent",
    date: "Jun 2, 2026",
    readTime: "4 min read",
    thumbnail: require("../assets/images/news_5.png"),
    tags: ["Student Achievement", "AI", "Award"],
  },
];

// ─────────────────────────────────────────────────────────────
// QUIZZES (unchanged from original)
// ─────────────────────────────────────────────────────────────
export const QUIZZES: Quiz[] = [
  {
    id: "q1",
    courseId: "c1",
    title: "Robotics Fundamentals Quiz",
    timeLimit: 600,
    questions: [
      { id: "qq1", question: "Which microcontroller is commonly used in beginner robotics projects?", options: ["Raspberry Pi", "Arduino Uno", "BeagleBone", "NVIDIA Jetson"], correctIndex: 1, explanation: "Arduino Uno is the most popular microcontroller for beginners." },
      { id: "qq2", question: "What does PWM stand for?", options: ["Power Width Measurement", "Pulse Width Modulation", "Phase Wave Mode", "Power Watt Module"], correctIndex: 1, explanation: "PWM stands for Pulse Width Modulation." },
      { id: "qq3", question: "Which sensor detects obstacles in front of a robot?", options: ["Temperature sensor", "Ultrasonic sensor", "Light sensor", "Gyroscope"], correctIndex: 1, explanation: "Ultrasonic sensors emit sound waves and measure echo return time." },
      { id: "qq4", question: "What is the voltage of a standard Arduino Uno I/O pin?", options: ["3.3V", "12V", "5V", "9V"], correctIndex: 2, explanation: "Arduino Uno operates at 5V logic." },
      { id: "qq5", question: "Which programming language is primarily used with Arduino?", options: ["Python", "Java", "C/C++", "JavaScript"], correctIndex: 2, explanation: "Arduino uses a simplified version of C/C++." },
      { id: "qq6", question: "What component stores electrical energy temporarily?", options: ["Resistor", "Transistor", "Capacitor", "Diode"], correctIndex: 2, explanation: "Capacitors store electrical energy in an electric field." },
      { id: "qq7", question: "Which motor provides precise angular positioning?", options: ["DC motor", "AC motor", "Stepper motor", "Linear actuator"], correctIndex: 2, explanation: "Stepper motors rotate in discrete steps for precise positioning." },
      { id: "qq8", question: "What does IDE stand for?", options: ["Integrated Data Environment", "Integrated Development Environment", "Internal Design Editor", "Interface Design Engine"], correctIndex: 1, explanation: "IDE stands for Integrated Development Environment." },
    ],
  },
  {
    id: "q2",
    courseId: "c2",
    title: "AI & ML Concepts Quiz",
    timeLimit: 600,
    questions: [
      { id: "qq1", question: "What is supervised learning?", options: ["Learning without data", "Training on labeled data", "A teacher watching students", "Unsupervised clustering"], correctIndex: 1, explanation: "Supervised learning uses labeled input-output pairs for training." },
      { id: "qq2", question: "Which Python library is most used for machine learning?", options: ["NumPy", "Pandas", "Scikit-learn", "Matplotlib"], correctIndex: 2, explanation: "Scikit-learn is the most popular ML library for Python." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// CATEGORIES (updated with all new categories)
// ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "All",
  "Robotics",
  "Electronics",
  "IoT",
  "Embedded Systems",
  "Arduino & Projects",
  "AI + Robotics",
  "Drone Technology",
  "Industry 4.0",
  "Artificial Intelligence",
  "Programming",
];

export const STORE_CATEGORIES = [
  "All",
  "Physical Kits",
  "Notes",
  "Question Banks",
  "Premium Resources",
];
