import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { TaskCard } from "@/components/task-card";
import { TaskModal } from "@/components/task-modal";
import { ProjectModal } from "@/components/project-modal";
import { ProgressTracker } from "@/components/progress-tracker";
import { Button } from "@/components/ui/button";
import { Plus, Eye, EyeOff, Clock, Flag, CheckCircle, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, Project } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "status">("deadline");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Check authentication
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Array<Project & { taskCount: number; completedCount: number }>>({
    queryKey: ["/api/projects"],
    enabled: !!authData?.user,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", selectedProjectId],
    queryFn: async () => {
      const params = selectedProjectId ? `?projectId=${selectedProjectId}` : "";
      const response = await fetch(`/api/tasks${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
    enabled: !!authData?.user,
  });

  // Set first project as selected by default
  useEffect(() => {
    if (projects.length > 0 && selectedProjectId === null) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!authData?.user) {
    setLocation("/");
    return null;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Filter and sort tasks
  let filteredTasks = tasks;
  if (!showCompleted) {
    filteredTasks = tasks.filter(task => !task.completed);
  }

  // Sort tasks
  filteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case "status":
        return Number(a.completed) - Number(b.completed);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onAddProject={() => setIsProjectModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={`transition-all duration-300 ${isMobile ? "ml-0" : "ml-80"} ${isSidebarOpen && isMobile ? "ml-80" : ""}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Today's Tasks</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {selectedProject?.name || "Select a project"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {showCompleted ? <Eye className="w-5 h-5 mr-2" /> : <EyeOff className="w-5 h-5 mr-2" />}
                {showCompleted ? "Hide Completed" : "Show Completed"}
              </Button>
              {isMobile && (
                <Button
                  variant="ghost"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Tracker */}
          {selectedProject && (
            <ProgressTracker
              completed={selectedProject.completedCount}
              total={selectedProject.taskCount}
            />
          )}

          {/* Task Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant={sortBy === "deadline" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("deadline")}
              className="flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>By Deadline</span>
            </Button>
            <Button
              variant={sortBy === "priority" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("priority")}
              className="flex items-center space-x-2"
            >
              <Flag className="w-4 h-4" />
              <span>By Priority</span>
            </Button>
            <Button
              variant={sortBy === "status" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("status")}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>By Status</span>
            </Button>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                  {tasks.length === 0 ? "No tasks yet" : "No tasks match your current filter"}
                </div>
                <Button onClick={() => setIsTaskModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Task
                </Button>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      {selectedProjectId && (
        <Button
          onClick={() => setIsTaskModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg hover:shadow-xl bg-blue-600 hover:bg-blue-700 text-white"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projectId={selectedProjectId}
      />
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
