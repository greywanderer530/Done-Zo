import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DEFAULT_TASKS } from "@/lib/default-tasks";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | null;
}

export function TaskModal({ isOpen, onClose, projectId }: TaskModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: "",
    time: "",
    priority: "medium",
  });
  const [showDefaultTasks, setShowDefaultTasks] = useState(false);
  const { toast } = useToast();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest("POST", "/api/tasks", {
        ...taskData,
        projectId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Task created",
        description: "New task has been added successfully.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Creation failed",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addDefaultTasksMutation = useMutation({
    mutationFn: async () => {
      const promises = DEFAULT_TASKS.map(task => 
        apiRequest("POST", "/api/tasks", {
          ...task,
          projectId,
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Default tasks added",
        description: `${DEFAULT_TASKS.length} default UI/UX checklist tasks have been added to your project.`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Failed to add default tasks",
        description: "Some default tasks may not have been added. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      deadline: "",
      time: "",
      priority: "medium",
    });
    setShowDefaultTasks(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a task name.",
        variant: "destructive",
      });
      return;
    }
    if (!projectId) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDefaultTasks = () => {
    if (!projectId) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }

    addDefaultTasksMutation.mutate();
  };

  if (!projectId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        {!showDefaultTasks ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="task-name">Task Name *</Label>
              <Input
                id="task-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter task name"
                required
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-date">Date</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange("deadline", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="task-time">Time</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Add task description..."
                rows={4}
                className="mt-2 resize-none"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="flex-1" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDefaultTasks(true)}
                className="w-full"
              >
                Or add default UI/UX checklist tasks ({DEFAULT_TASKS.length} tasks)
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Default UI/UX Checklist Tasks
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will add {DEFAULT_TASKS.length} comprehensive tasks covering accessibility, responsiveness, performance, UX, and cross-browser testing to your project.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
                {DEFAULT_TASKS.slice(0, 5).map((task, index) => (
                  <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium">{task.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 truncate">{task.description}</div>
                  </div>
                ))}
                {DEFAULT_TASKS.length > 5 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                    ... and {DEFAULT_TASKS.length - 5} more tasks
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddDefaultTasks}
                disabled={addDefaultTasksMutation.isPending}
                className="flex-1"
              >
                {addDefaultTasksMutation.isPending ? "Adding Tasks..." : "Add Default Tasks"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDefaultTasks(false)}
                className="flex-1"
              >
                Back to Custom
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
