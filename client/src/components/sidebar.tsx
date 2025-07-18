import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Folder, HelpCircle, LogOut, Moon, Sun, PanelLeftClose } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Project } from "@shared/schema";

interface SidebarProps {
  projects: Array<Project & { taskCount: number; completedCount: number }>;
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onAddProject: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <aside className={`fixed left-0 top-0 h-full w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 z-50 ${
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    }`}>
      <div className="p-6">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Checklist</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-gray-600 dark:text-gray-400 lg:hidden"
          >
            <PanelLeftClose className="w-5 h-5" />
          </Button>
        </div>

        {/* Add Project Button */}
        <Button
          onClick={onAddProject}
          variant="ghost"
          className="w-full flex items-center justify-start space-x-3 p-3 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 mb-6"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Project</span>
        </Button>

        {/* Projects List */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Projects
          </h3>
          <div className="space-y-2">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant="ghost"
                onClick={() => onSelectProject(project.id)}
                className={`w-full flex items-center justify-start space-x-3 p-3 text-left transition-colors ${
                  selectedProjectId === project.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 text-blue-900 dark:text-blue-300"
                    : "text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Folder className={`w-5 h-5 ${
                  selectedProjectId === project.id ? "text-blue-600" : "text-gray-400"
                }`} />
                <span className="font-medium flex-1 truncate">{project.name}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {project.taskCount}
                </span>
              </Button>
            ))}
            {projects.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No projects yet. Create your first project!
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-2 mb-8">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start space-x-3 p-3 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <HelpCircle className="w-5 h-5" />
            <span>FAQs</span>
          </Button>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
          </div>
          <Button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              theme === "dark" ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              theme === "dark" ? "translate-x-6" : "translate-x-1"
            }`} />
          </Button>
        </div>

        {/* Logout */}
        <Button
          onClick={() => logoutMutation.mutate()}
          variant="ghost"
          className="w-full flex items-center justify-start space-x-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </span>
        </Button>
      </div>
    </aside>
  );
}
