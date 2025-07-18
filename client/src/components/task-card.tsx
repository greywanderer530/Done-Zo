import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Calendar, Clock, Trash2, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.name);
  const { toast } = useToast();

  const updateTaskMutation = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (isEditing) {
        setIsEditing(false);
        toast({
          title: "Task updated",
          description: "Task name has been updated successfully.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
      setEditedName(task.name);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/tasks/${task.id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = () => {
    updateTaskMutation.mutate({ completed: !task.completed });
  };

  const handleNameEdit = () => {
    if (editedName.trim() && editedName !== task.name) {
      updateTaskMutation.mutate({ name: editedName.trim() });
    } else {
      setIsEditing(false);
      setEditedName(task.name);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedName(task.name);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "medium":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200",
      task.completed && "opacity-60"
    )}>
      <div className="flex items-start space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleComplete}
          disabled={updateTaskMutation.isPending}
          className={cn(
            "mt-1 w-5 h-5 border-2 rounded hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center",
            task.completed
              ? "bg-green-500 border-green-500 hover:bg-green-600"
              : "border-gray-300 dark:border-gray-600"
          )}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3 flex-1">
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleNameEdit}
                  onKeyDown={handleKeyPress}
                  className="font-semibold text-lg bg-transparent border-none p-0 focus:ring-0"
                  autoFocus
                />
              ) : (
                <h4
                  className={cn(
                    "font-semibold text-gray-900 dark:text-white text-lg cursor-pointer hover:text-blue-600 transition-colors",
                    task.completed && "line-through"
                  )}
                  onClick={() => setIsEditing(true)}
                >
                  {task.name}
                </h4>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={cn("text-sm font-medium", getPriorityColor(task.priority))}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTaskMutation.mutate()}
                disabled={deleteTaskMutation.isPending}
                className="w-8 h-8 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className={cn(
              "text-gray-600 dark:text-gray-400 mb-4",
              task.completed && "line-through"
            )}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center space-x-6 text-sm">
            {task.deadline && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(task.deadline)}</span>
              </div>
            )}
            {task.time && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{formatTime(task.time)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
