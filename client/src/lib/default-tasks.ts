export const DEFAULT_TASKS = [
  // Accessibility Tasks
  {
    name: "Implement semantic HTML structure",
    description: "Use proper HTML5 semantic elements (header, nav, main, section, article, aside, footer) for better accessibility and SEO.",
    priority: "high" as const,
    deadline: "2024-12-20",
    time: "14:00"
  },
  {
    name: "Add alt text to all images",
    description: "Ensure all images have descriptive alt attributes. Decorative images should have empty alt attributes.",
    priority: "high" as const,
    deadline: "2024-12-18",
    time: "10:30"
  },
  {
    name: "Implement ARIA labels where needed",
    description: "Add ARIA labels to interactive elements, form controls, and complex UI components for screen readers.",
    priority: "medium" as const,
    deadline: "2024-12-22",
    time: "16:00"
  },
  {
    name: "Ensure color contrast passes WCAG AA",
    description: "Test all text and background color combinations to meet 4.5:1 contrast ratio requirement.",
    priority: "high" as const,
    deadline: "2024-12-19",
    time: "11:00"
  },
  {
    name: "Test keyboard navigation",
    description: "Ensure all interactive elements are accessible via keyboard and tab order is logical.",
    priority: "medium" as const,
    deadline: "2024-12-23",
    time: "15:30"
  },

  // Responsiveness Tasks
  {
    name: "Test mobile, tablet, and desktop breakpoints",
    description: "Verify layout works correctly across all major device sizes and orientations.",
    priority: "high" as const,
    deadline: "2024-12-21",
    time: "09:00"
  },
  {
    name: "Ensure touch targets are ≥48x48px",
    description: "All buttons, links, and interactive elements should be large enough for touch interaction.",
    priority: "medium" as const,
    deadline: "2024-12-24",
    time: "13:00"
  },
  {
    name: "Implement responsive images",
    description: "Use responsive image techniques (srcset, sizes, picture element) for optimal loading.",
    priority: "medium" as const,
    deadline: "2024-12-25",
    time: "10:00"
  },

  // Performance Tasks
  {
    name: "Implement lazy loading for images",
    description: "Add loading='lazy' attribute and intersection observer for below-the-fold images.",
    priority: "medium" as const,
    deadline: "2024-12-26",
    time: "14:30"
  },
  {
    name: "Optimize Core Web Vitals",
    description: "Achieve Lighthouse Performance score >90 by optimizing LCP, FID, and CLS metrics.",
    priority: "high" as const,
    deadline: "2024-12-27",
    time: "11:30"
  },
  {
    name: "Minify and compress assets",
    description: "Ensure all CSS, JS, and images are properly minified and compressed for production.",
    priority: "low" as const,
    deadline: "2024-12-28",
    time: "16:30"
  },

  // UX Tasks
  {
    name: "Add loading states and feedback",
    description: "Implement spinners, skeleton screens, and progress indicators for all async operations.",
    priority: "medium" as const,
    deadline: "2024-12-29",
    time: "12:00"
  },
  {
    name: "Create helpful error messages",
    description: "Replace generic error messages with specific, actionable feedback for users.",
    priority: "low" as const,
    deadline: "2024-12-30",
    time: "15:00"
  },
  {
    name: "Design informative empty states",
    description: "Create branded empty state designs with clear calls-to-action when no content is available.",
    priority: "low" as const,
    deadline: "2025-01-02",
    time: "10:30"
  },

  // Cross-browser Testing
  {
    name: "Test in Chrome, Safari, Firefox",
    description: "Verify functionality and appearance across major modern browsers.",
    priority: "medium" as const,
    deadline: "2025-01-03",
    time: "14:00"
  },
  {
    name: "Test on iOS and Android devices",
    description: "Verify mobile functionality on real devices, not just browser dev tools.",
    priority: "medium" as const,
    deadline: "2025-01-04",
    time: "11:00"
  }
];
