import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProjectSchema, insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";

// Simple session store
const sessions = new Map<string, { userId: number; username: string }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, username: user.username });
      
      res.cookie("sessionId", sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Check user limit
      const userCount = await storage.getUserCount();
      if (userCount >= 5) {
        return res.status(400).json({ message: "Maximum number of users reached (5)" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({ username, password });
      
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, username: user.username });
      
      res.cookie("sessionId", sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie("sessionId");
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", (req, res) => {
    const sessionId = req.cookies?.sessionId;
    const session = sessionId ? sessions.get(sessionId) : null;
    
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({ user: { id: session.userId, username: session.username } });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.cookies?.sessionId;
    const session = sessionId ? sessions.get(sessionId) : null;
    
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = session;
    next();
  };

  // Projects routes
  app.get("/api/projects", requireAuth, async (req: any, res) => {
    try {
      const projects = await storage.getProjectsByUserId(req.user.userId);
      
      // Add task counts to projects
      const projectsWithCounts = await Promise.all(
        projects.map(async (project) => {
          const tasks = await storage.getTasksByProjectId(project.id);
          return {
            ...project,
            taskCount: tasks.length,
            completedCount: tasks.filter(task => task.completed).length,
          };
        })
      );
      
      res.json(projectsWithCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", requireAuth, async (req: any, res) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== req.user.userId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const deleted = await storage.deleteProject(projectId);
      if (deleted) {
        res.json({ message: "Project deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete project" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid project ID" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : null;
      
      let tasks;
      if (projectId) {
        // Verify project belongs to user
        const project = await storage.getProject(projectId);
        if (!project || project.userId !== req.user.userId) {
          return res.status(404).json({ message: "Project not found" });
        }
        tasks = await storage.getTasksByProjectId(projectId);
      } else {
        tasks = await storage.getTasksByUserId(req.user.userId);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req: any, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      // Verify project belongs to user
      const project = await storage.getProject(taskData.projectId);
      if (!project || project.userId !== req.user.userId) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updateData = updateTaskSchema.parse(req.body);
      
      const existingTask = await storage.getTask(taskId);
      if (!existingTask || existingTask.userId !== req.user.userId) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(taskId, updateData);
      if (updatedTask) {
        res.json(updatedTask);
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task || task.userId !== req.user.userId) {
        return res.status(404).json({ message: "Task not found" });
      }

      const deleted = await storage.deleteTask(taskId);
      if (deleted) {
        res.json({ message: "Task deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete task" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid task ID" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
