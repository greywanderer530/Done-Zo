import { users, projects, tasks, type User, type InsertUser, type Project, type InsertProject, type Task, type InsertTask, type UpdateTask } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserCount(): Promise<number>;

  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasksByProjectId(projectId: number): Promise<Task[]>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentTaskId = 1;
    
    // Initialize with admin user
    this.initializeDefaultUser();
  }

  private initializeDefaultUser() {
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "123456"
    };
    this.users.set(adminUser.id, adminUser);
    
    // Create default project with UI/UX checklist tasks
    this.createDefaultProject(adminUser.id);
  }

  private createDefaultProject(userId: number) {
    const project: Project = {
      id: this.currentProjectId++,
      name: "Frontend UI/UX Checklist",
      description: "Comprehensive checklist for frontend development covering accessibility, responsiveness, performance, and cross-browser testing.",
      userId
    };
    this.projects.set(project.id, project);

    // Add default tasks
    const defaultTasks = [
      {
        name: "Implement semantic HTML structure",
        description: "Use proper HTML5 semantic elements (header, nav, main, section, article, aside, footer) for better accessibility and SEO.",
        priority: "high" as const,
        deadline: "2025-01-20",
        time: "14:00"
      },
      {
        name: "Add alt text to all images",
        description: "Ensure all images have descriptive alt attributes. Decorative images should have empty alt attributes.",
        priority: "high" as const,
        deadline: "2025-01-18",
        time: "10:30"
      },
      {
        name: "Implement ARIA labels where needed",
        description: "Add ARIA labels to interactive elements, form controls, and complex UI components for screen readers.",
        priority: "medium" as const,
        deadline: "2025-01-22",
        time: "16:00"
      },
      {
        name: "Ensure color contrast passes WCAG AA",
        description: "Test all text and background color combinations to meet 4.5:1 contrast ratio requirement.",
        priority: "high" as const,
        deadline: "2025-01-19",
        time: "11:00"
      },
      {
        name: "Test keyboard navigation",
        description: "Ensure all interactive elements are accessible via keyboard and tab order is logical.",
        priority: "medium" as const,
        deadline: "2025-01-23",
        time: "15:30"
      },
      {
        name: "Test mobile, tablet, and desktop breakpoints",
        description: "Verify layout works correctly across all major device sizes and orientations.",
        priority: "high" as const,
        deadline: "2025-01-21",
        time: "09:00"
      },
      {
        name: "Ensure touch targets are ≥48x48px",
        description: "All buttons, links, and interactive elements should be large enough for touch interaction.",
        priority: "medium" as const,
        deadline: "2025-01-24",
        time: "13:00"
      },
      {
        name: "Implement responsive images",
        description: "Use responsive image techniques (srcset, sizes, picture element) for optimal loading.",
        priority: "medium" as const,
        deadline: "2025-01-25",
        time: "10:00"
      },
      {
        name: "Implement lazy loading for images",
        description: "Add loading='lazy' attribute and intersection observer for below-the-fold images.",
        priority: "medium" as const,
        deadline: "2025-01-26",
        time: "14:30"
      },
      {
        name: "Optimize Core Web Vitals",
        description: "Achieve Lighthouse Performance score >90 by optimizing LCP, FID, and CLS metrics.",
        priority: "high" as const,
        deadline: "2025-01-27",
        time: "11:30"
      },
      {
        name: "Add loading states and feedback",
        description: "Implement spinners, skeleton screens, and progress indicators for all async operations.",
        priority: "medium" as const,
        deadline: "2025-01-29",
        time: "12:00"
      },
      {
        name: "Test in Chrome, Safari, Firefox",
        description: "Verify functionality and appearance across major modern browsers.",
        priority: "medium" as const,
        deadline: "2025-02-03",
        time: "14:00"
      }
    ];

    defaultTasks.forEach(taskData => {
      const task: Task = {
        id: this.currentTaskId++,
        name: taskData.name,
        description: taskData.description,
        deadline: taskData.deadline,
        time: taskData.time,
        priority: taskData.priority,
        completed: false,
        projectId: project.id,
        userId
      };
      this.tasks.set(task.id, task);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      description: insertProject.description ?? null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updateProject: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = { ...project, ...updateProject };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const deleted = this.projects.delete(id);
    // Also delete all tasks in this project
    const tasksToDelete = Array.from(this.tasks.entries())
      .filter(([, task]) => task.projectId === id)
      .map(([taskId]) => taskId);
    
    tasksToDelete.forEach(taskId => this.tasks.delete(taskId));
    return deleted;
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByProjectId(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId,
    );
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id,
      description: insertTask.description ?? null,
      deadline: insertTask.deadline ?? null,
      time: insertTask.time ?? null,
      priority: insertTask.priority || "medium",
      completed: insertTask.completed ?? false
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateTask: UpdateTask): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { ...task, ...updateTask };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
