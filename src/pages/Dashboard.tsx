import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileBarChart } from "lucide-react";
import { generateAnalyticsPDF, type PdfScope } from "@/types/pdfGenerator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  FolderKanban,
  Users,
  ArrowUpDown,
  Edit,
  Trash2,
  Trash,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Board = import("@/context/AppContext").Board;
type SortField = "name" | "creation";

const Dashboard = () => {
  const { user } = useAuth();
  const { boards, setBoards, addBoard, updateBoard, deleteBoard } = useApp();
  const navigate = useNavigate();

  // Dialog & PDF state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [pdfScope, setPdfScope] = useState<PdfScope>("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("creation");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [boardToPermanentDelete, setBoardToPermanentDelete] = useState<string | null>(null);
  const [deletedBoards, setDeletedBoards] = useState<Board[]>([]);

  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

const handleGeneratePDF = () => {
  generateAnalyticsPDF(boards, [user], pdfScope); // ✅ pass boards, users, and scope
  toast.success("PDF generated successfully!");
  setAnalyticsDialogOpen(false);
};

  // ✅ Filter boards - show boards created by user OR where user is a member
  const filteredBoards = boards.filter((b) => {
  const matchesSearch =
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchQuery.toLowerCase());
  
  const isCreator = b.userEmail === user?.email;
  const isMember = b.members?.some((member) => member.email === user?.email);
  
  return matchesSearch && (isCreator || isMember);
});

  // ✅ Sort boards
  const getCreationTime = (board: Board) =>
    board.createdAt ? new Date(board.createdAt).getTime() : 0;

  const sortedBoards = [...filteredBoards].sort((a, b) => {
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      const timeA = getCreationTime(a);
      const timeB = getCreationTime(b);
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    }
  });

  // ✅ Load active boards on mount
  useEffect(() => {
    const loadBoards = async () => {
      if (!user) return;
      try {
        // Fetch all boards for admin, or boards where user is creator/member
        const res = await fetch(
          user.role === "admin"
            ? "https://backend-687v.onrender.com/api/boards?deleted=false"
            : `https://backend-687v.onrender.com/api/boards?userEmail=${user.email}&includeMembers=true&deleted=false`
        );
        if (!res.ok) throw new Error("Failed to load boards");
        const data = await res.json();
        
        // Properly normalize all IDs including nested lists, cards, and members
        const normalizedBoards = data.map((board: any) => ({
          ...board,
          id: board._id,
          members: (board.members || []).map((m: any) => typeof m === 'string' ? { email: m } : m),
          lists: (board.lists || []).map((list: any) => ({
            ...list,
            id: list._id,
            cards: (list.cards || []).map((card: any) => ({ ...card, id: card._id })),
          })),
        }));

        
        setBoards(normalizedBoards);
      } catch (err) {
        toast.error("Failed to load boards");
      }
    };
    loadBoards();
  }, [user, setBoards]);

  // ✅ Load deleted boards for recycle bin
  useEffect(() => {
    const loadDeletedBoards = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          user.role === "admin"
            ? "https://backend-687v.onrender.com/api/boards?deleted=true"
            : `https://backend-687v.onrender.com/api/boards?userEmail=${user.email}&includeMembers=true&deleted=true`
        );
        if (!res.ok) return;
        const data = await res.json();
        
        const normalizedDeletedBoards = data.map((board: any) => ({
          ...board,
          id: board._id,
          members: board.members || [],
          lists: (board.lists || []).map((list: any) => ({
            ...list,
            id: list._id,
            cards: (list.cards || []).map((card: any) => ({
              ...card,
              id: card._id,
            })),
          })),
        }));
        
        setDeletedBoards(normalizedDeletedBoards);
      } catch (err) {
        console.error("Failed to load deleted boards");
      }
    };
    loadDeletedBoards();
  }, [user]);

  // ✅ Create board
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return toast.error("Board title is required");

    try {
      const res = await fetch("https://backend-687v.onrender.com/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBoardTitle,
          description: newBoardDescription,
          userEmail: user?.email,
        }),
      });

      if (!res.ok) throw new Error("Failed to create board");
      const data = await res.json();

      addBoard({
        id: data._id,
        title: data.title,
        description: data.description,
        userEmail: data.userEmail,
        createdAt: data.createdAt,
        lists: data.lists || [],
        members: data.members || [],
      });

      toast.success("Board created successfully 🎉");
      setDialogOpen(false);
      setNewBoardTitle("");
      setNewBoardDescription("");
      navigate(`/board/${data._id}`);
    } catch {
      toast.error("Error creating board");
    }
  };

  const handleEditBoard = (board: Board) => {
    setEditingBoard(board);
    setNewBoardTitle(board.title);
    setNewBoardDescription(board.description || "");
    setEditDialogOpen(true);
  };

const handleUpdateBoard = async () => {
  if (!editingBoard) return;
  if (!newBoardTitle.trim()) return toast.error("Title is required");

  try {
    const res = await fetch(`https://backend-687v.onrender.com/api/boards/${editingBoard.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newBoardTitle,
        description: newBoardDescription,
      }),
    });

    if (!res.ok) throw new Error("Failed to update board");

    const updatedBoard = await res.json();

    // Update frontend state
    updateBoard(editingBoard.id, {
      title: updatedBoard.title,
      description: updatedBoard.description,
    });

    toast.success("Board updated ✨");
    setEditDialogOpen(false);
    setEditingBoard(null);
  } catch (err) {
    console.error("Error updating board:", err);
    toast.error("Error updating board");
  }
};
 

  const handleDeleteClick = (boardId: string) => {
    setBoardToDelete(boardId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      // Soft delete on backend
      const res = await fetch(`https://backend-687v.onrender.com/api/boards/${boardToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete board");
      
      const deletedBoard = await res.json();
      
      // Move to recycle bin state
      const board = boards.find(b => b.id === boardToDelete);
      if (board) {
        setDeletedBoards(prev => [...prev, board]);
      }
      
      // Remove from active boards
      deleteBoard(boardToDelete);
      toast.success("Board moved to recycle bin");
    } catch (err) {
      toast.error("Failed to delete board");
    } finally {
      setDeleteDialogOpen(false);
      setBoardToDelete(null);
    }
  };

  const handleRestoreBoard = async (board: Board) => {
    try {
      // Restore the board in the database
      const res = await fetch(`https://backend-687v.onrender.com/api/boards/${board.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted: false, deletedAt: null }),
      });
      
      if (!res.ok) throw new Error("Failed to restore board");
      
      const restoredBoard = await res.json();
      
      // Normalize the restored board data
      const normalizedBoard = {
        ...restoredBoard,
        id: restoredBoard._id,
        members: restoredBoard.members || [],
        lists: (restoredBoard.lists || []).map((list: any) => ({
          ...list,
          id: list._id,
          cards: (list.cards || []).map((card: any) => ({
            ...card,
            id: card._id,
          })),
        })),
      };
      
      // Remove from deleted boards and add to active boards
      setDeletedBoards(prev => prev.filter(b => b.id !== board.id));
      addBoard(normalizedBoard);
      
      toast.success("Board restored");
    } catch (error) {
      toast.error("Failed to restore board");
      console.error("Error restoring board:", error);
    }
  };

  const handlePermanentDeleteClick = (boardId: string) => {
    setBoardToPermanentDelete(boardId);
    setPermanentDeleteDialogOpen(true);
  };

  const handlePermanentDelete = async () => {
    if (!boardToPermanentDelete) return;

    try {
      const res = await fetch(`https://backend-687v.onrender.com/api/boards/permanent/${boardToPermanentDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to permanently delete board");
      setDeletedBoards(prev => prev.filter(b => b.id !== boardToPermanentDelete));
      toast.success("Board permanently deleted 🗑️");
    } catch {
      toast.error("Error deleting board");
    } finally {
      setPermanentDeleteDialogOpen(false);
      setBoardToPermanentDelete(null);
    }
  };

  const handleOpenBoard = (id: string) => navigate(`/board/${id}`);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder(field === "creation" ? "desc" : "asc");
    }
  };

  const getSortIcon = (field: SortField) => (
    <ArrowUpDown
      className={`w-4 h-4 ml-1 ${
        sortField === field && sortOrder === "desc" ? "rotate-180" : ""
      }`}
    />
  );

   const [totalUsers, setTotalUsers] = useState(0);

  // ✅ Analytics from DB
const analytics = {
  totalBoards: boards.length,
  totalLists: boards.reduce((sum, b) => sum + (b.lists?.length || 0), 0),
  totalCards: boards.reduce(
    (sum, b) =>
      sum + b.lists.reduce((cards, l) => cards + (l.cards?.length || 0), 0),
    0
  ),
    totalUsers,
};

useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("https://backend-687v.onrender.com/api/users");
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setTotalUsers(data.length);
      } catch {
        toast.error("Failed to load users");
      }
    };

    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your boards and track progress
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setRecycleBinOpen(true)}
            className="glass"
          >
            <Trash className="w-4 h-4 mr-2" />
            Recycle Bin {deletedBoards.length > 0 && `(${deletedBoards.length})`}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary hover-glow w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription>
                Create a new Kanban board to organize your tasks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Board Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Marketing Campaign"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this board..."
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  className="glass"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="glass w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBoard}
                className="gradient-primary hover-glow w-full sm:w-auto"
              >
                Create Board
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Analytics */}
{user?.role === "admin" && (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <Card className="glass-strong p-4 sm:p-6 hover-glow">
        <p className="text-sm text-muted-foreground">Total Boards</p>
        <p className="text-3xl font-bold text-gradient mt-2">
          {analytics.totalBoards}
        </p>
      </Card>

      <Card className="glass-strong p-4 sm:p-6 hover-glow">
        <p className="text-sm text-muted-foreground">Total Users</p>
        <p className="text-3xl font-bold text-gradient mt-2">
          {analytics.totalUsers}
        </p>
      </Card>
    </div>

    <div className="flex justify-end">
      <Button
        onClick={() => setAnalyticsDialogOpen(true)}
        className="gradient-primary hover-glow"
      >
        <FileBarChart className="w-4 h-4 mr-2" />
        Generate Report
      </Button>
    </div>
  </>
)}
      {/* Boards grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold">
            {user?.role === "admin" ? "All Boards" : "Your Boards"}
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("name")}
              className="glass"
            >
              Name {getSortIcon("name")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("creation")}
              className="glass"
            >
              Date {getSortIcon("creation")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedBoards.map((board) => (
            <Card
              key={board.id}
              onClick={() => handleOpenBoard(board.id)}
              className="glass-strong p-4 sm:p-6 hover-glow cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg group-hover:text-gradient transition-all truncate">
                      {board.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {board.lists?.length || 0} list
                      {(board.lists?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                {board.description || "No description"}
              </p>

              <div className="flex items-center justify-between">
                {/* Board Member Avatars */}
                <div className="flex -space-x-2">
                  {/* Show project manager first */}
                  {board.userEmail && (
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-background">
                      <AvatarFallback className="gradient-primary text-xs text-white">
                        {board.userEmail[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {/* Show other members */}
                  {board.members?.filter(m => m.email !== board.userEmail).slice(0, 2).map((m, i) => (
                    <Avatar key={i} className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-background">
                      <AvatarFallback className="gradient-secondary text-xs text-white">
                        {m.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {/* Show +X if more members */}
                  {board.members && board.members.length > 3 && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full glass flex items-center justify-center text-xs text-white border-2 border-background">
                      +{board.members.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex space-x-1 sm:space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBoard(board);
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
                      handleDeleteClick(board.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {boards.length === 0 && (
            <Card className="glass-strong p-6 sm:p-12 col-span-full text-center">
              <FolderKanban className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                No boards yet
              </h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Create your first board to get started.
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gradient-primary hover-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Board
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Board Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
            <DialogDescription>Update board information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Label htmlFor="edit-title">Board Title</Label>
            <Input
              id="edit-title"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="glass"
            />
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              className="glass"
              rows={3}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="glass w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBoard}
              className="gradient-primary hover-glow w-full sm:w-auto"
            >
              Update Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              This board will be moved to the recycle bin. You can restore it later.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="glass w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteBoard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recycle Bin Dialog */}
      <Dialog open={recycleBinOpen} onOpenChange={setRecycleBinOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash className="w-5 h-5" />
              Recycle Bin
            </DialogTitle>
            <DialogDescription>
              Restore deleted boards or permanently delete them
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {deletedBoards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trash className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Recycle bin is empty</p>
              </div>
            ) : (
              deletedBoards.map((board) => (
                <Card key={board.id} className="glass p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{board.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {board.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreBoard(board)}
                        className="glass"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDeleteClick(board.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Permanently Delete Board?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The board will be permanently deleted from the database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setPermanentDeleteDialogOpen(false)}
              className="glass w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics PDF Generation Dialog */}
      <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5" />
              Generate Analytics PDF
            </DialogTitle>
            <DialogDescription>
              Generate a comprehensive PDF report including boards and user data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Select scope:</p>
            <div className="flex flex-col gap-2">
              <Button
                variant={pdfScope === "allUsers" ? "default" : "outline"}
                onClick={() => setPdfScope("allUsers")}
                className="w-full"
              >
                All Project Manager
              </Button>
              <Button
                variant={pdfScope === "projectOnly" ? "default" : "outline"}
                onClick={() => setPdfScope("projectOnly")}
                className="w-full"
              >
                Project Only (Members of selected boards)
              </Button>
              <Button
                variant={pdfScope === "all" ? "default" : "outline"}
                onClick={() => setPdfScope("all")}
                className="w-full"
              >
                All (Boards + Users)
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setAnalyticsDialogOpen(false)}
              className="glass w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePDF}
              className="gradient-primary hover-glow w-full sm:w-auto"
            >
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default Dashboard;

