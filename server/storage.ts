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
      time: insertTask.time ?? null
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
