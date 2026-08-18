/**
 * tourSteps — Guided Tour Step Definitions
 * ==========================================
 * Each step targets a specific UI element via CSS selector
 * and provides contextual information about that feature.
 */

export interface TourStep {
  /** CSS selector for the element to highlight (null = full-screen overlay) */
  target: string | null;
  /** Feature title */
  title: string;
  /** Detailed description of what this feature does */
  description: string;
  /** Lucide icon name */
  icon: string;
  /** Preferred tooltip placement relative to target */
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const TOUR_STEPS: TourStep[] = [
  // Step 0: Welcome
  {
    target: null,
    title: 'Welcome to ArchLab',
    description:
      'ArchLab is your interactive system design studio. Drag & drop architecture components, connect them, simulate traffic, and get AI-powered feedback — all in your browser. Let\'s take a quick tour!',
    icon: 'Rocket',
    position: 'center',
  },

  // Step 1: Sidebar Toggle
  {
    target: '[data-tour="sidebar-toggle"]',
    title: 'Toggle Sidebar',
    description:
      'Click this menu button to show or hide the component palette on the left. Keep it open when building, collapse it when you need more canvas space.',
    icon: 'Menu',
    position: 'bottom',
  },

  // Step 2: Component Palette
  {
    target: '[data-tour="component-palette"]',
    title: 'Component Palette',
    description:
      'This is your toolbox! Browse architecture components like Load Balancers, API Gateways, Databases, Caches, and more. Simply drag any component from here and drop it onto the canvas to add it to your design.',
    icon: 'LayoutGrid',
    position: 'right',
  },

  // Step 3: Design Canvas
  {
    target: '[data-tour="design-canvas"]',
    title: 'Design Canvas',
    description:
      'This is your workspace. Drop components here, drag to reposition them, and connect them by dragging from one node\'s handle to another. Use scroll to zoom and drag on empty space to pan around.',
    icon: 'PenTool',
    position: 'bottom',
  },

  // Step 4: Design Title
  {
    target: '[data-tour="design-title"]',
    title: 'Design Title',
    description:
      'Give your design a meaningful name! Click on "Untitled Design" to rename it. This title will be used when you save your work.',
    icon: 'Type',
    position: 'bottom',
  },

  // Step 5: Learning Hub
  {
    target: '[data-tour="learn-btn"]',
    title: 'Learning Hub',
    description:
      'New to system design? Head to the Learning Hub for curated tutorials, articles, and resources on architecture patterns, scalability, and best practices.',
    icon: 'BookOpen',
    position: 'bottom',
  },

  // Step 6: Challenges
  {
    target: '[data-tour="challenges-btn"]',
    title: 'Design Challenges',
    description:
      'Test your skills with real-world system design challenges! From "Design a URL Shortener" to "Build a Chat System" — solve them right here in the canvas and get scored.',
    icon: 'Trophy',
    position: 'bottom',
  },

  // Step 7: Simulate
  {
    target: '[data-tour="simulate-btn"]',
    title: 'Traffic Simulation',
    description:
      'Bring your design to life! Hit Simulate to send virtual traffic through your architecture. Watch how components handle load, spot bottlenecks, and see real-time metrics like throughput, latency, and error rates.',
    icon: 'Play',
    position: 'bottom',
  },

  // Step 8: Save
  {
    target: '[data-tour="save-btn"]',
    title: 'Save Your Design',
    description:
      'Save your work to the cloud so you can access it from anywhere. Your designs are stored securely and you can find them all in "My Designs" from your profile menu.',
    icon: 'Save',
    position: 'bottom',
  },

  // Step 9: AI Analyze
  {
    target: '[data-tour="analyze-btn"]',
    title: 'AI-Powered Analysis',
    description:
      'Get instant, intelligent feedback on your architecture! Our AI engine will analyze your design for scalability, reliability, security, and performance — then give you actionable suggestions to improve it.',
    icon: 'Sparkles',
    position: 'bottom',
  },

  // Step 10: Auth
  {
    target: '[data-tour="auth-btn"]',
    title: 'Your Account',
    description:
      'Sign in to save designs, track challenge progress, and personalize your experience. Your profile menu gives you quick access to your saved designs and settings.',
    icon: 'LogIn',
    position: 'bottom',
  },

  // Step 11: Simulation Panel
  {
    target: '[data-tour="simulation-panel"]',
    title: 'Simulation Controls',
    description:
      'When simulation is active, this panel appears at the bottom. Control traffic volume with the RPS slider, adjust simulation speed, and monitor live metrics — throughput, latency, error rate, and node health — all in real-time.',
    icon: 'Activity',
    position: 'top',
  },

  // Step 12: Completion
  {
    target: null,
    title: 'You\'re All Set',
    description:
      'You now know the essentials of ArchLab. Start by dragging components onto the canvas, connect them to build your architecture, then simulate and analyze. Happy designing!',
    icon: 'PartyPopper',
    position: 'center',
  },
];
