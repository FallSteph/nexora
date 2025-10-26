import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  FolderKanban, 
  Users, 
  Search, 
  ArrowUpDown, 
  Edit, 
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Use the Project type from your AppContext
type Project = import('@/context/AppContext').Project;

// Extended interface for projects with createdAt (optional)
interface ProjectWithDate extends Project {
  createdAt?: string;
}

type SortField = 'name' | 'creation';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, addProject, updateProject, deleteProject } = useApp();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('creation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingProject, setEditingProject] = useState<ProjectWithDate | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get creation date for sorting (fallback to project ID for existing projects)
  const getProjectCreationTime = (project: ProjectWithDate): number => {
    if (project.createdAt) {
      return new Date(project.createdAt).getTime();
    }
    // For existing projects without createdAt, use project ID as fallback
    // Assuming newer projects have higher IDs
    return parseInt(project.id) || 0;
  };

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortField === 'name') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      // Sort by creation date (newest first by default)
      const timeA = getProjectCreationTime(a as ProjectWithDate);
      const timeB = getProjectCreationTime(b as ProjectWithDate);
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
  });

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) {
      toast.error('Project title is required');
      return;
    }

    const projectId = Date.now().toString();
    const boardId = (Date.now() + 1).toString();
    
    // Create project with default board and lists
    addProject({
      title: newProjectTitle,
      description: newProjectDescription,
      boards: [
        {
          id: boardId,
          title: 'Main Board',
          lists: [
            {
              id: '1',
              title: 'To Do',
              cards: [
                {
                  id: '1',
                  title: 'Welcome to your board! 🎉',
                  description: 'This is your first card. You can edit it by clicking on it.',
                  labels: ['welcome'],
                  assignedMembers: [],
                  attachments: [],
                  comments: [],
                },
                {
                  id: '2',
                  title: 'Drag and drop cards',
                  description: 'Try moving this card to "In Progress" or "Done"',
                  labels: ['tutorial'],
                  assignedMembers: [],
                  attachments: [],
                  comments: [],
                }
              ],
            },
            {
              id: '2',
              title: 'In Progress',
              cards: [
                {
                  id: '3',
                  title: 'Sample task in progress',
                  description: 'This card shows how tasks look when they are being worked on',
                  labels: ['sample', 'in-progress'],
                  assignedMembers: [],
                  attachments: [],
                  comments: [],
                }
              ],
            },
            {
              id: '3',
              title: 'Done',
              cards: [
                {
                  id: '4',
                  title: 'Completed task example',
                  description: 'This is how completed tasks appear in your board',
                  labels: ['sample', 'completed'],
                  assignedMembers: [],
                  attachments: [],
                  comments: [],
                }
              ],
            },
          ],
          members: [
            { email: user?.email || 'user@nexora.io', role: 'manager' }
          ],
        }
      ],
    });

    toast.success('Project created successfully! 🎉');
    setDialogOpen(false);
    setNewProjectTitle('');
    setNewProjectDescription('');
    
    // Navigate to the new project's board
    setTimeout(() => {
      navigate(`/board/${projectId}/${boardId}`);
    }, 100);
  };

  const handleEditProject = (project: ProjectWithDate) => {
    setEditingProject(project);
    setNewProjectTitle(project.title);
    setNewProjectDescription(project.description || '');
    setEditDialogOpen(true);
  };

  const handleUpdateProject = () => {
    if (!newProjectTitle.trim()) {
      toast.error('Project title is required');
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, {
        title: newProjectTitle,
        description: newProjectDescription,
      });
      toast.success('Project updated successfully! ✨');
      setEditDialogOpen(false);
      setEditingProject(null);
      setNewProjectTitle('');
      setNewProjectDescription('');
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      toast.success('Project deleted');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleOpenProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project && project.boards.length > 0) {
      navigate(`/board/${projectId}/${project.boards[0].id}`);
    } else {
      toast.error('This project has no boards. Please contact support.');
    }
  };

  // Format date for display - use project ID as fallback for creation date
  const getProjectCreationInfo = (project: ProjectWithDate) => {
    // For existing projects without createdAt, use a fallback
    if (project.createdAt) {
      const date = new Date(project.createdAt);
      return {
        date: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        tooltip: `Created on ${date.toLocaleDateString()}`
      };
    } else {
      // Use project ID as a rough estimate (assuming newer projects have higher IDs)
      const projectIdNum = parseInt(project.id);
      const fallbackDate = new Date();
      fallbackDate.setTime(projectIdNum || Date.now());
      
      return {
        date: fallbackDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        tooltip: 'Creation date estimated'
      };
    }
  };

  // Mock analytics data
  const analytics = {
    totalProjects: projects.length,
    activeUsers: 12,
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set appropriate default order
      setSortField(field);
      if (field === 'creation') {
        setSortOrder('desc'); // Newest first by default
      } else {
        setSortOrder('asc'); // A-Z by default
      }
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUpDown className="w-4 h-4 ml-1" />
    ) : (
      <ArrowUpDown className="w-4 h-4 ml-1 transform rotate-180" />
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your projects and track progress</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary hover-glow w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project with a ready-to-use Kanban board
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Website Redesign"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project..."
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="glass"
                  rows={3}
                />
              </div>

              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  🎉 This project will include a starter Kanban board with sample cards to help you get started!
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="glass w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleCreateProject} className="gradient-primary hover-glow w-full sm:w-auto">
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="glass-strong p-4 sm:p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl sm:text-3xl font-bold text-gradient mt-2">{analytics.totalProjects}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center">
                <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="glass-strong p-4 sm:p-6 hover-glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-gradient mt-2">{analytics.activeUsers}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-secondary flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass w-full"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => handleSort('name')}
            className="glass flex items-center flex-1 sm:flex-none justify-center"
          >
            <span className="hidden sm:inline">Sort by Name</span>
            <span className="sm:hidden">Name</span>
            {getSortIcon('name')}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('creation')}
            className="glass flex items-center flex-1 sm:flex-none justify-center"
          >
            <span className="hidden sm:inline">Sort by Creation</span>
            <span className="sm:hidden">Date</span>
            {getSortIcon('creation')}
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedProjects.map((project) => {
            const creationInfo = getProjectCreationInfo(project as ProjectWithDate);
            
            return (
              <Card
                key={project.id}
                className="glass-strong p-4 sm:p-6 hover-glow cursor-pointer group relative"
                onClick={() => handleOpenProject(project.id)}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center">
                      <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg group-hover:text-gradient transition-all">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {project.boards?.length || 0} board{(project.boards?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                {/* Creation Date */}
                <div 
                  className="flex items-center text-xs text-muted-foreground mb-3 sm:mb-4"
                  title={creationInfo.tooltip}
                >
                  Created {creationInfo.date}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full gradient-secondary flex items-center justify-center text-xs text-white border-2 border-background"
                      >
                        U{i}
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-1 sm:space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project as ProjectWithDate);
                      }}
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(project.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {sortedProjects.length === 0 && (
            <Card className="glass-strong p-6 sm:p-12 col-span-full text-center">
              <FolderKanban className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first project to get started with a ready-to-use Kanban board'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)} className="gradient-primary hover-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Project Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Website Redesign"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of the project..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="glass"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="glass w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateProject} className="gradient-primary hover-glow w-full sm:w-auto">
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="glass w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteProject} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;