import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardModal } from '@/components/CardModal';
import { ShareBoardModal } from '@/components/ShareBoardModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { 
  ArrowLeft, Share2, Plus, MoreVertical, Pencil, Trash2, 
  MessageCircle, Paperclip, Upload, X, User, Search,
  Settings, Filter, Users, Download, Eye, FileText, Menu,
  Calendar, Tag, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, List } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Enhanced responsive scrollbar styles - FIXED: Consistent scrollbar styling
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.4);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.6);
  }
  
  .modal-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .modal-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  .modal-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.3);
    border-radius: 3px;
  }
  .modal-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.5);
  }
  
  /* Hide scrollbar for mobile but keep functionality */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .glass-strong {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  
  .gradient-primary {
    background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
  }
  
  .gradient-secondary {
    background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%);
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }

  .card-hover {
    transition: all 0.2s ease-in-out;
  }
  
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
  }

  /* Enhanced mobile optimizations */
  @media (max-width: 640px) {
    .mobile-tap-highlight {
      -webkit-tap-highlight-color: transparent;
    }
    
    .mobile-safe-padding {
      padding-left: max(1rem, env(safe-area-inset-left));
      padding-right: max(1rem, env(safe-area-inset-right));
    }
    
    .mobile-bottom-safe {
      padding-bottom: max(1rem, env(safe-area-inset-bottom));
    }

    .mobile-full-height {
      height: 100vh;
      height: 100dvh;
    }
  }

  /* Responsive text sizing */
  .responsive-text {
    font-size: clamp(0.875rem, 2.5vw, 1rem);
  }

  .responsive-heading {
    font-size: clamp(1.25rem, 4vw, 1.5rem);
  }

  /* Touch-friendly button sizes */
  @media (max-width: 768px) {
    .touch-button {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Smooth animations */
  .smooth-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Custom animations */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out;
  }

  /* FIXED: Enhanced purple/glass dropdown styling with proper colors */
  .glass-select {
    background: rgba(139, 92, 246, 0.15) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 0.5rem !important;
    color: #ffffff !important;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem !important;
    transition: all 0.2s ease-in-out !important;
    appearance: none !important;
  }

  .glass-select:focus {
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5) !important;
    border-color: rgba(139, 92, 246, 0.6) !important;
  }

  /* FIXED: Completely fixed dropdown option colors - no more purple/blue mix */
  .glass-select option {
    background: rgba(30, 25, 50, 0.98) !important; /* Dark purple background */
    color: #ffffff !important; /* White text */
    padding: 0.75rem 1rem !important;
    border: none !important;
    margin: 0 !important;
    font-weight: 500 !important;
  }

  .glass-select option:hover {
    background: rgba(139, 92, 246, 0.3) !important; /* Pure purple on hover */
    color: #ffffff !important;
  }

  .glass-select option:checked {
    background: rgba(139, 92, 246, 0.4) !important; /* Pure purple for selected */
    color: #ffffff !important;
  }

  /* FIXED: Role dropdown specific styling */
  .role-dropdown {
    background: rgba(139, 92, 246, 0.15) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 0.5rem !important;
    color: #ffffff !important;
    padding: 0.25rem 1.5rem 0.25rem 0.5rem !important;
    font-size: 0.75rem !important;
    transition: all 0.2s ease-in-out !important;
    appearance: none !important;
  }

  .role-dropdown:focus {
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5) !important;
    border-color: rgba(139, 92, 246, 0.6) !important;
  }

  /* FIXED: Role dropdown options with consistent purple theme */
  .role-dropdown option {
    background: rgba(30, 25, 50, 0.98) !important; /* Dark purple background */
    color: #ffffff !important; /* White text */
    padding: 0.5rem 0.75rem !important;
    border: none !important;
    font-size: 0.75rem !important;
    font-weight: 500 !important;
  }

  .role-dropdown option:hover {
    background: rgba(139, 92, 246, 0.3) !important; /* Pure purple on hover */
    color: #ffffff !important;
  }

  .role-dropdown option:checked {
    background: rgba(139, 92, 246, 0.4) !important; /* Pure purple for selected */
    color: #ffffff !important;
  }
`;

// Fixed Interface definitions with proper event types
interface KanbanListProps {
  list: List;
  editingListId: string | null;
  editingListTitle: string;
  onStartEdit: (id: string, title: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onAddCard: (listId: string) => void;
  onCardClick: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
  setEditingListTitle: (title: string) => void;
  onViewComments: (card: CardType, e: React.MouseEvent) => void;
  onDownloadAttachment: (attachmentName: string, e: React.MouseEvent) => void;
  onViewDescription: (card: CardType, e: React.MouseEvent) => void;
}

interface KanbanCardProps {
  card: CardType;
  onClick: () => void;
  onDelete: () => void;
  onViewComments: (e: React.MouseEvent) => void;
  onDownloadAttachment: (attachmentName: string, e: React.MouseEvent) => void;
  onViewDescription: (e: React.MouseEvent) => void;
}

// Enhanced Card Modal Props
interface EnhancedCardModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<CardType>) => void;
  onDelete: () => void;
  boardMembers: { email: string; role: 'member' | 'manager' }[];
}

// Attachment type
interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

// Comment type for modal
interface ModalComment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

// Updated ShareBoardModal Props with pending changes
interface ShareBoardModalProps {
  board: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMembers: (members: { email: string; role: 'member' | 'manager' }[]) => void;
  onRemoveMember: (memberEmail: string) => void;
}

// Comments Modal Props
interface CommentsModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
}

// Description Modal Props
interface DescriptionModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
}

// Mobile Menu Props
interface MobileMenuProps {
  onShare: () => void;
  onAddList: () => void;
  isAddingList: boolean;
}

// Simple Comments Modal Component
const CommentsModal = ({ card, isOpen, onClose }: CommentsModalProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 mobile-safe-padding mobile-bottom-safe">
      <div className={`glass-strong rounded-2xl w-full ${isMobile ? 'max-w-full h-full' : 'max-w-md max-h-[80vh]'} overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Comments</h2>
            <p className="text-sm text-purple-300 mt-1 line-clamp-1">{card.title}</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-lg glass hover-glow flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto modal-scrollbar p-4 sm:p-6">
          {card.comments.length > 0 ? (
            <div className="space-y-4">
              {card.comments.map((comment, index) => (
                <div key={index} className="glass rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="gradient-secondary text-sm">
                        {comment.user[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{comment.user}</p>
                      <p className="text-xs text-purple-300">
                        {comment.timestamp instanceof Date 
                          ? comment.timestamp.toLocaleString()
                          : new Date(comment.timestamp).toLocaleString()
                        }
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-100 break-words">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-purple-300">No comments yet</p>
              <p className="text-sm text-purple-400 mt-1">Be the first to add a comment!</p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-white/10">
          <Button onClick={onClose} className="w-full glass hover-glow">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simple Description Modal Component
const DescriptionModal = ({ card, isOpen, onClose }: DescriptionModalProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 mobile-safe-padding mobile-bottom-safe">
      <div className={`glass-strong rounded-2xl w-full ${isMobile ? 'max-w-full h-full' : 'max-w-md max-h-[80vh]'} overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Description</h2>
            <p className="text-sm text-purple-300 mt-1 line-clamp-1">{card.title}</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-lg glass hover-glow flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto modal-scrollbar p-4 sm:p-6">
          {card.description ? (
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-purple-100 whitespace-pre-wrap">{card.description}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-purple-300">No description yet</p>
              <p className="text-sm text-purple-400 mt-1">Add a description to provide more details</p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-white/10">
          <Button onClick={onClose} className="w-full glass hover-glow">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Enhanced ShareBoardModal Component with FIXED dropdown styling and manual save
const EnhancedShareBoardModal = ({ 
  board, 
  isOpen, 
  onClose, 
  onUpdateMembers,
  onRemoveMember 
}: ShareBoardModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'manager'>('manager'); // Changed default to manager
  const [isMobile, setIsMobile] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<{ email: string; role: 'member' | 'manager' }[]>(board.members);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ email: string; role: 'member' | 'manager' } | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize pending members when modal opens
  useEffect(() => {
    if (isOpen) {
      setPendingMembers([...board.members]);
      setPendingChanges(false);
      setMemberToRemove(null);
    }
  }, [isOpen, board.members]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && !pendingMembers.some(m => m.email === email.trim())) {
      const newMember = { email: email.trim(), role };
      setPendingMembers([...pendingMembers, newMember]);
      setEmail('');
      setRole('manager'); // Reset to manager after adding
      setPendingChanges(true);
      toast.success('Member added to pending changes');
    } else {
      toast.error('Member already exists or invalid email');
    }
  };

  const handleRoleChange = (memberEmail: string, newRole: 'member' | 'manager') => {
    const updatedMembers = pendingMembers.map(m =>
      m.email === memberEmail ? { ...m, role: newRole } : m
    );
    setPendingMembers(updatedMembers);
    setPendingChanges(true);
  };

  const handleRemovePendingMember = (member: { email: string; role: 'member' | 'manager' }) => {
    setMemberToRemove(member);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      const updatedMembers = pendingMembers.filter(m => m.email !== memberToRemove.email);
      setPendingMembers(updatedMembers);
      setPendingChanges(true);
      setMemberToRemove(null);
      toast.success('Member removed from pending changes');
    }
  };

  const handleSaveChanges = () => {
    onUpdateMembers(pendingMembers);
    setPendingChanges(false);
    toast.success('Board members updated successfully');
  };

  const handleClose = () => {
    if (pendingChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 mobile-safe-padding mobile-bottom-safe">
        <div className={`glass-strong rounded-2xl w-full ${isMobile ? 'max-w-full h-full' : 'max-w-md'} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Share Board</h2>
              {pendingChanges && (
                <p className="text-sm text-yellow-400 mt-1">You have unsaved changes</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="h-10 w-10 rounded-lg glass hover-glow flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto modal-scrollbar p-4 sm:p-6 space-y-6">
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Add Team Member</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="glass flex-1"
                  />
                  {/* FIXED: Enhanced select styling with proper purple/glass theme */}
                  <div className="relative sm:w-32">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'member' | 'manager')}
                      className="glass-select w-full h-10 text-sm focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer pr-8"
                    >
                      <option value="manager">Manager</option>
                      <option value="member">Member</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <Button type="submit" className="gradient-primary w-full hover-glow">
                <User className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </form>

            <div>
              <h3 className="font-semibold mb-3">Board Members ({pendingMembers.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto modal-scrollbar">
                {pendingMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 glass rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="gradient-secondary text-sm">
                          {member.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.email}</p>
                        <p className="text-xs text-purple-300 capitalize">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* FIXED: Enhanced role dropdown with consistent theme styling */}
                      <div className="relative">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.email, e.target.value as 'member' | 'manager')}
                          className="role-dropdown appearance-none cursor-pointer pr-6"
                        >
                          <option value="manager">Manager</option>
                          <option value="member">Member</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-purple-300">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemovePendingMember(member)}
                        className="h-8 w-8 rounded-lg glass hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all border border-white/20"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FIXED: Cancel button beside Save Changes */}
          <div className="flex justify-between p-4 sm:p-6 border-t border-white/10 gap-3">
            <Button 
              onClick={handleClose} 
              variant="ghost" 
              className="glass hover-glow flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              className="gradient-primary hover-glow flex-1"
              disabled={!pendingChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Remove Member</h3>
            <p className="text-purple-200 mb-6">
              Are you sure you want to remove <span className="font-semibold text-white">{memberToRemove.email}</span> from this board? They will lose access to all board content.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setMemberToRemove(null)}
                variant="ghost"
                className="flex-1 glass hover-glow"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRemoveMember}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced Card Modal Component with FIXED scrollbar
const EnhancedCardModal = ({ 
  card, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  boardMembers 
}: EnhancedCardModalProps) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [labels, setLabels] = useState(card.labels);
  const [newLabel, setNewLabel] = useState('');
  const [assignedMembers, setAssignedMembers] = useState(card.assignedMembers);
  const [comments, setComments] = useState<ModalComment[]>(
    card.comments.map(comment => ({
      id: Date.now().toString() + Math.random(),
      user: comment.user,
      text: comment.text,
      timestamp: comment.timestamp.toLocaleString()
    }))
  );
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>(
    card.attachments.map(attachment => ({
      id: Date.now().toString() + Math.random(),
      name: attachment,
      size: 'Unknown',
      type: 'file'
    }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchMember, setSearchMember] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleToggleMember = (member: string) => {
    if (assignedMembers.includes(member)) {
      setAssignedMembers(assignedMembers.filter(m => m !== member));
    } else {
      setAssignedMembers([...assignedMembers, member]);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: ModalComment = {
        id: Date.now().toString() + Math.random(),
        user: 'You',
        text: newComment.trim(),
        timestamp: new Date().toLocaleString(),
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        type: file.type,
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  const handleSave = () => {
    onSave({
      title,
      description,
      labels,
      assignedMembers,
      comments: comments.map(comment => ({
        user: comment.user,
        text: comment.text,
        timestamp: new Date(comment.timestamp)
      })),
      attachments: attachments.map(att => att.name),
    });
    onClose();
  };

  const filteredMembers = boardMembers.filter(member =>
    member.email.toLowerCase().includes(searchMember.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 mobile-safe-padding mobile-bottom-safe">
      <div className={`glass-strong rounded-2xl w-full ${isMobile ? 'max-w-full h-full' : 'max-w-4xl max-h-[90vh]'} overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold">Edit Card</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-lg glass hover-glow flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FIXED: Changed to modal-scrollbar for consistent styling */}
        <div className="flex-1 overflow-y-auto modal-scrollbar p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter card title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass rounded-lg px-4 py-3 min-h-32 resize-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add a detailed description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Labels</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((label, idx) => (
                <Badge key={idx} className="px-3 py-1 gradient-primary text-white flex items-center gap-2">
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                className="flex-1 glass rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Add new label..."
              />
              <Button
                onClick={handleAddLabel}
                className="gradient-primary px-4 py-2 rounded-lg hover-glow"
              >
                Add
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assign Team Members
            </label>
            <div className="glass rounded-lg p-3 mb-3">
              <div className="relative mb-3">
                <Input
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Search members..."
                  className="glass pl-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
              </div>
              <div className={`${isMobile ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-2 max-h-48 overflow-y-auto modal-scrollbar`}>
                {filteredMembers.map((member, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleMember(member.email)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      assignedMembers.includes(member.email)
                        ? 'gradient-primary text-white'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={assignedMembers.includes(member.email) ? 'bg-white/20' : 'gradient-secondary'}>
                        {member.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{member.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments ({attachments.length})
            </label>
            <div className="space-y-2 mb-4">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="glass rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Paperclip className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-purple-300">{attachment.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className="h-9 w-9 rounded-lg glass hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full glass rounded-lg px-4 py-4 flex items-center justify-center gap-2 hover-glow"
            >
              <Upload className="w-5 h-5" />
              Upload Files
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({comments.length})
            </label>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto modal-scrollbar">
              {comments.map((comment) => (
                <div key={comment.id} className="glass rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="gradient-secondary text-sm">
                        {comment.user[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{comment.user}</p>
                      <p className="text-xs text-purple-300">{comment.timestamp}</p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-100 break-words">{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 glass rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                placeholder="Add a comment..."
              />
              <Button
                onClick={handleAddComment}
                className="gradient-primary px-4 sm:px-6 py-3 rounded-lg hover-glow"
              >
                {isMobile ? 'Post' : 'Post'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-white/10">
          <Button
            onClick={onDelete}
            variant="ghost"
            className="text-red-400 hover:bg-red-500/20 px-3 sm:px-4 py-2 text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isMobile ? 'Delete' : 'Delete Card'}
          </Button>
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={onClose}
              variant="ghost"
              className="px-4 sm:px-6 py-2 glass hover-glow text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gradient-primary px-4 sm:px-8 py-2 hover-glow text-sm sm:text-base"
            >
              {isMobile ? 'Save' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Compact Card Footer Component with event prevention
const CompactCardFooter = ({ 
  card, 
  onViewComments, 
  onDownloadAttachment,
  onViewDescription
}: { 
  card: CardType; 
  onViewComments?: (e: React.MouseEvent) => void;
  onDownloadAttachment?: (attachmentName: string, e: React.MouseEvent) => void;
  onViewDescription?: (e: React.MouseEvent) => void;
}) => {
  return (
    <div className="flex items-center justify-between mt-3">
      {/* Left side: Profile icons */}
      {card.assignedMembers.length > 0 && (
        <div className="flex -space-x-1.5">
          {card.assignedMembers.slice(0, 3).map((member, idx) => (
            <Avatar key={idx} className="w-6 h-6 border-2 border-slate-900 hover:scale-110 smooth-transition">
              <AvatarFallback className="gradient-secondary text-xs font-medium">
                {member[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {card.assignedMembers.length > 3 && (
            <Avatar className="w-6 h-6 border-2 border-slate-900">
              <AvatarFallback className="glass text-xs font-medium">
                +{card.assignedMembers.length - 3}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {/* Right side: Clickable Icons with event prevention */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Description Icon */}
        {card.description && (
          <button
            onClick={onViewDescription}
            className="flex items-center gap-1 text-xs text-purple-300 hover:text-white hover:bg-white/10 rounded-lg px-2 py-1 smooth-transition group"
            title="View description"
          >
            <FileText className="w-3 h-3 group-hover:scale-110 smooth-transition" />
          </button>
        )}

        {/* Comments Icon */}
        {card.comments.length > 0 && (
          <button
            onClick={onViewComments}
            className="flex items-center gap-1 text-xs text-purple-300 hover:text-white hover:bg-white/10 rounded-lg px-2 py-1 smooth-transition group"
            title={`View ${card.comments.length} comments`}
          >
            <MessageCircle className="w-3 h-3 group-hover:scale-110 smooth-transition" />
            <span className="text-[10px] font-medium">{card.comments.length}</span>
          </button>
        )}

        {/* Attachments Icon with dropdown */}
        {card.attachments.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 text-xs text-purple-300 hover:text-white hover:bg-white/10 rounded-lg px-2 py-1 smooth-transition group"
                title={`${card.attachments.length} attachments`}
                onClick={(e) => e.stopPropagation()} // Prevent card click when opening dropdown
              >
                <Paperclip className="w-3 h-3 group-hover:scale-110 smooth-transition" />
                <span className="text-[10px] font-medium">{card.attachments.length}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="glass-strong w-48 border-white/10" 
              align="end"
              onClick={(e) => e.stopPropagation()} // Prevent card click in dropdown
            >
              <div className="px-3 py-2 text-xs font-semibold border-b border-white/10 text-purple-300">
                Attachments ({card.attachments.length})
              </div>
              {card.attachments.map((attachment, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={(e) => onDownloadAttachment?.(attachment, e)}
                  className="flex items-center gap-2 cursor-pointer py-2 smooth-transition hover:bg-white/10"
                >
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Paperclip className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{attachment}</p>
                  </div>
                  <Download className="w-3 h-3 text-purple-300 flex-shrink-0" />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

// Enhanced KanbanCard Component with better event handling
const KanbanCard = ({ 
  card, 
  onClick, 
  onDelete, 
  onViewComments, 
  onDownloadAttachment, 
  onViewDescription 
}: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass p-4 rounded-2xl hover-glow cursor-grab active:cursor-grabbing card-hover group smooth-transition"
      onClick={onClick}
    >
      {/* Card Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.labels.slice(0, 2).map((label) => (
            <Badge 
              key={label} 
              className="px-2 py-0.5 text-[10px] gradient-primary text-white truncate max-w-20 font-medium"
            >
              {label}
            </Badge>
          ))}
          {card.labels.length > 2 && (
            <Badge className="px-2 py-0.5 text-[10px] glass text-purple-300">
              +{card.labels.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Card Title */}
      <h4 className="font-semibold text-sm mb-3 line-clamp-3 pr-8 leading-relaxed group-hover:text-white smooth-transition">
        {card.title}
      </h4>

      {/* Compact Card Footer */}
      <CompactCardFooter 
        card={card} 
        onViewComments={onViewComments}
        onDownloadAttachment={onDownloadAttachment}
        onViewDescription={onViewDescription}
      />

      {/* Card Options Menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 smooth-transition">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 glass hover-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-strong w-36 border-white/10" align="end">
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="smooth-transition cursor-pointer hover:bg-white/10"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="text-red-400 smooth-transition cursor-pointer hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Enhanced KanbanList Component with fixed scrolling
const KanbanList = ({
  list,
  editingListId,
  editingListTitle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onAddCard,
  onCardClick,
  onDeleteCard,
  setEditingListTitle,
  onViewComments,
  onDownloadAttachment,
  onViewDescription,
}: KanbanListProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `list-${list.id}`,
  });

  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex-shrink-0 ${isMobile ? 'w-72' : 'w-80'} glass-strong rounded-2xl p-4 flex flex-col h-full smooth-transition`}
    >
      {/* Enhanced List Header - FIXED: Reduced spacing to move count badge left */}
      <div className="flex items-center justify-between mb-4" {...attributes} {...listeners}>
        <div className="flex-1 mr-2 min-w-0"> {/* Changed from mr-3 to mr-2 */}
          {editingListId === list.id ? (
            <Input
              value={editingListTitle}
              onChange={(e) => setEditingListTitle(e.target.value)}
              onBlur={() => onSaveEdit(list.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit(list.id);
                if (e.key === 'Escape') onCancelEdit();
              }}
              className="glass h-9 rounded-xl text-lg font-semibold border-white/20 focus:border-purple-400 smooth-transition"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2"> {/* Changed from gap-3 to gap-2 */}
              <h3 className="font-bold text-lg cursor-grab flex-1 truncate group-hover:text-white smooth-transition">
                {list.title}
              </h3>
              <span className="text-sm text-purple-300 bg-white/10 rounded-full px-2.5 py-1 min-w-8 text-center font-medium">
                {list.cards.length}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 glass hover-glow smooth-transition">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-strong border-white/10" align="end">
              <DropdownMenuItem 
                onClick={() => onStartEdit(list.id, list.title)}
                className="smooth-transition cursor-pointer hover:bg-white/10"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(list.id)} 
                className="text-red-400 smooth-transition cursor-pointer hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* FIXED: Enhanced Cards Area with proper scrolling */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 min-h-0"
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          scrollbarGutter: 'stable'
        }}
      >
        <SortableContext
          items={list.cards.map((c) => `card-${c.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 pb-2">
            {list.cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card)}
                onDelete={() => onDeleteCard(card.id)}
                onViewComments={(e) => onViewComments(card, e)}
                onDownloadAttachment={(name, e) => onDownloadAttachment(name, e)}
                onViewDescription={(e) => onViewDescription(card, e)}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Enhanced Add Card Button */}
      <div className="mt-4 pt-4 border-t border-white/10 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-purple-300 hover:text-white h-11 text-base smooth-transition hover:bg-white/5 rounded-xl"
          onClick={() => onAddCard(list.id)}
        >
          <Plus className="w-5 h-5 mr-3" />
          Add a card
        </Button>
      </div>
    </div>
  );
};

// Mobile Menu Component
const MobileMenu = ({ onShare, onAddList, isAddingList }: MobileMenuProps) => (
  <div className="md:hidden fixed bottom-6 right-6 z-40 animate-slide-in">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-14 w-14 rounded-full gradient-primary hover-glow shadow-lg smooth-transition">
          <Menu className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="glass-strong mb-4 mr-4 w-48 border-white/10" 
        align="end"
        side="top"
      >
        <DropdownMenuItem 
          onClick={onShare} 
          className="flex items-center gap-3 py-3 smooth-transition cursor-pointer hover:bg-white/10"
        >
          <Share2 className="w-4 h-4" />
          Share Board
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onAddList} 
          className="flex items-center gap-3 py-3 smooth-transition cursor-pointer hover:bg-white/10"
        >
          <Plus className="w-4 h-4" />
          {isAddingList ? 'Adding List...' : 'Add List'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

// Main Board Component with FIXED header spacing
const Board = () => {
  const { projectId, boardId } = useParams<{ projectId: string; boardId: string }>();
  const navigate = useNavigate();
  const { projects, updateBoard, addList, updateList, deleteList, reorderLists, addCard, updateCard, deleteCard, moveCard } = useApp();

  const project = projects.find((p) => p.id === projectId);
  const board = project?.boards.find((b) => b.id === boardId);

  const [boardTitle, setBoardTitle] = useState(board?.title || 'Untitled Board');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ card: CardType; listId: string } | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [commentsCard, setCommentsCard] = useState<CardType | null>(null);
  const [descriptionCard, setDescriptionCard] = useState<CardType | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'list' | 'card' | 'member'; id: string; listId?: string; memberEmail?: string } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 15 : 8,
      },
    })
  );

  // Handler functions
  const handleSaveTitle = useCallback(() => {
    if (boardTitle.trim()) {
      updateBoard(projectId!, boardId!, { title: boardTitle });
      toast.success('✅ Board Saved');
      setIsEditingTitle(false);
    }
  }, [boardTitle, projectId, boardId, updateBoard]);

  const handleAddList = useCallback(() => {
    if (newListTitle.trim()) {
      addList(projectId!, boardId!, newListTitle.trim());
      setNewListTitle('');
      toast.success('List added');
    }
  }, [newListTitle, projectId, boardId, addList]);

  const handleRenameList = useCallback((listId: string) => {
    if (editingListTitle.trim()) {
      updateList(projectId!, boardId!, listId, editingListTitle.trim());
      setEditingListId(null);
      setEditingListTitle('');
      toast.success('List renamed');
    }
  }, [editingListTitle, projectId, boardId, updateList]);

  const handleDeleteList = useCallback(() => {
    if (deleteConfirm?.type === 'list') {
      deleteList(projectId!, boardId!, deleteConfirm.id);
      toast.success('List deleted');
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, projectId, boardId, deleteList]);

  const handleAddCard = useCallback((listId: string) => {
    const newCard: Omit<CardType, 'id'> = {
      title: 'New Card',
      description: '',
      labels: [],
      assignedMembers: [],
      attachments: [],
      comments: [],
    };
    addCard(projectId!, boardId!, listId, newCard);
    toast.success('Card added');
  }, [projectId, boardId, addCard]);

  const handleUpdateCard = useCallback((listId: string, cardId: string, updates: Partial<CardType>) => {
    updateCard(projectId!, boardId!, listId, cardId, updates);
  }, [projectId, boardId, updateCard]);

  const handleDeleteCard = useCallback(() => {
    if (deleteConfirm?.type === 'card' && deleteConfirm.listId) {
      deleteCard(projectId!, boardId!, deleteConfirm.listId, deleteConfirm.id);
      toast.success('Card deleted');
      setDeleteConfirm(null);
      setShowCardModal(false);
      setSelectedCard(null);
    }
  }, [deleteConfirm, projectId, boardId, deleteCard]);

  const handleRemoveMember = useCallback(() => {
    if (deleteConfirm?.type === 'member' && deleteConfirm.memberEmail) {
      const updatedMembers = board?.members.filter(member => member.email !== deleteConfirm.memberEmail) || [];
      updateBoard(projectId!, boardId!, { members: updatedMembers });
      toast.success('Member removed');
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, projectId, boardId, updateBoard, board?.members]);

  const handleViewComments = useCallback((card: CardType, e: React.MouseEvent) => {
    e.stopPropagation();
    setCommentsCard(card);
    setShowCommentsModal(true);
  }, []);

  const handleViewDescription = useCallback((card: CardType, e: React.MouseEvent) => {
    e.stopPropagation();
    setDescriptionCard(card);
    setShowDescriptionModal(true);
  }, []);

  const handleDownloadAttachment = useCallback((attachmentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([`Simulated content for ${attachmentName}`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachmentName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${attachmentName}`);
  }, []);

  const handleCardClick = useCallback((card: CardType, listId: string) => {
    setSelectedCard({ card, listId });
    setShowCardModal(true);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith('list-') && overId.startsWith('list-')) {
      const oldIndex = board.lists.findIndex((l) => `list-${l.id}` === activeId);
      const newIndex = board.lists.findIndex((l) => `list-${l.id}` === overId);

      if (oldIndex !== newIndex) {
        const newLists = arrayMove(board.lists, oldIndex, newIndex);
        reorderLists(projectId!, boardId!, newLists);
      }
      return;
    }

    if (activeId.startsWith('card-')) {
      const cardId = activeId.replace('card-', '');
      const sourceList = board.lists.find((l) => l.cards.some((c) => c.id === cardId));

      let targetListId: string;
      let targetIndex: number;

      if (overId.startsWith('list-')) {
        targetListId = overId.replace('list-', '');
        targetIndex = 0;
      } else if (overId.startsWith('card-')) {
        const overCardId = overId.replace('card-', '');
        const targetList = board.lists.find((l) => l.cards.some((c) => c.id === overCardId));
        targetListId = targetList!.id;
        targetIndex = targetList!.cards.findIndex((c) => c.id === overCardId);
      } else {
        return;
      }

      if (sourceList && (sourceList.id !== targetListId || activeId !== overId)) {
        moveCard(projectId!, boardId!, cardId, sourceList.id, targetListId, targetIndex);
      }
    }
  };

  const activeCard = activeId?.startsWith('card-')
    ? board?.lists
        .flatMap((l) => l.cards.map((c) => ({ ...c, listId: l.id })))
        .find((c) => `card-${c.id}` === activeId)
    : null;

  const getConfirmDialogProps = () => {
    if (!deleteConfirm) return null;

    switch (deleteConfirm.type) {
      case 'list':
        return {
          title: 'Delete List?',
          description: 'Are you sure you want to delete this list? This action cannot be undone.'
        };
      case 'card':
        return {
          title: 'Delete Card?',
          description: 'Are you sure you want to delete this card? This action cannot be undone.'
        };
      case 'member':
        return {
          title: 'Remove Member?',
          description: `Are you sure you want to remove ${deleteConfirm.memberEmail} from this board? They will lose access to all board content.`
        };
      default:
        return null;
    }
  };

  const confirmDialogProps = getConfirmDialogProps();

  if (!project || !board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 mobile-safe-padding">
        <div className="text-center glass-strong rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-in">
          <h1 className="text-2xl font-bold mb-4 text-white">Board not found</h1>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="gradient-primary hover-glow w-full smooth-transition"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white mobile-tap-highlight">
          {/* FIXED: Enhanced Header with better spacing */}
          <div className="flex-shrink-0 glass-strong border-b border-white/10 px-4 sm:px-6 py-4 sticky top-0 z-50 mobile-safe-padding">
            <div className="flex items-center justify-between max-w-full">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "default"}
                  onClick={() => navigate('/dashboard')}
                  className="h-10 px-4 glass hover-glow flex-shrink-0 smooth-transition group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 smooth-transition" />
                  <span className="hidden sm:inline">Back</span>
                </Button>

                {isEditingTitle ? (
                  <Input
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    className={`${isMobile ? 'w-32 sm:w-48' : 'w-80'} h-10 glass rounded-xl text-lg font-bold smooth-transition`}
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-4 min-w-0 flex-1"> {/* FIXED: Changed from gap-3 to gap-4 for better spacing */}
                    <h1
                      className="text-xl sm:text-2xl font-bold cursor-pointer hover:text-purple-300 transition-all py-2 px-3 rounded-lg hover:bg-white/5 smooth-transition min-w-0 flex-1 truncate"
                      onClick={() => setIsEditingTitle(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(true)}
                    >
                      {boardTitle}
                    </h1>
                    {/* FIXED: Added margin to create space between title and badge */}
                    <Badge className="glass px-3 py-1 text-xs mr-2">
                      {board.lists.length} lists
                    </Badge>
                  </div>
                )}
              </div>

              {/* Desktop Actions - FIXED: Added proper spacing */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-4"> {/* FIXED: Added ml-4 for spacing */}
                <Button 
                  className="gradient-primary hover-glow h-10 px-6 smooth-transition"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* FIXED: Enhanced Board Content with proper alignment */}
          <div className="flex-1 overflow-hidden mobile-bottom-safe">
            <div className="h-full p-4 sm:p-6">
              <div className={`h-full ${isMobile ? 'overflow-x-auto hide-scrollbar' : 'overflow-x-auto overflow-y-hidden'} pb-6 custom-scrollbar`}>
                <div className={`inline-flex ${isMobile ? 'space-x-4' : 'space-x-6'} items-start h-full`}>
                  <SortableContext
                    items={board.lists.map((l) => `list-${l.id}`)}
                    strategy={isMobile ? horizontalListSortingStrategy : verticalListSortingStrategy}
                  >
                    {board.lists.map((list) => (
                      <KanbanList
                        key={list.id}
                        list={list}
                        editingListId={editingListId}
                        editingListTitle={editingListTitle}
                        onStartEdit={(id, title) => {
                          setEditingListId(id);
                          setEditingListTitle(title);
                        }}
                        onSaveEdit={handleRenameList}
                        onCancelEdit={() => {
                          setEditingListId(null);
                          setEditingListTitle('');
                        }}
                        onDelete={(id) => setDeleteConfirm({ type: 'list', id })}
                        onAddCard={handleAddCard}
                        onCardClick={(card) => handleCardClick(card, list.id)}
                        onDeleteCard={(cardId) =>
                          setDeleteConfirm({ type: 'card', id: cardId, listId: list.id })
                        }
                        setEditingListTitle={setEditingListTitle}
                        onViewComments={handleViewComments}
                        onDownloadAttachment={handleDownloadAttachment}
                        onViewDescription={handleViewDescription}
                      />
                    ))}
                  </SortableContext>

                  {/* Enhanced Add List Column */}
                  <div className={`flex-shrink-0 ${isMobile ? 'w-72' : 'w-80'} h-full flex flex-col`}>
                    {newListTitle ? (
                      <div className="glass-strong rounded-2xl p-4 h-fit animate-slide-in">
                        <Input
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          placeholder="Enter list title..."
                          className="glass mb-4 h-11 rounded-xl border-white/20 focus:border-purple-400 smooth-transition"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddList();
                            if (e.key === 'Escape') setNewListTitle('');
                          }}
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <Button 
                            onClick={handleAddList} 
                            size="sm" 
                            className="gradient-primary h-10 flex-1 smooth-transition hover:scale-105"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Add List
                          </Button>
                          <Button 
                            onClick={() => setNewListTitle('')} 
                            size="sm" 
                            variant="ghost"
                            className="h-10 glass smooth-transition"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className={`w-full ${isMobile ? 'h-14' : 'h-16'} glass rounded-2xl hover-glow justify-center text-lg group smooth-transition flex-shrink-0`}
                        onClick={() => setNewListTitle('New List')}
                      >
                        <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 smooth-transition" />
                        <span className="hidden sm:inline">Add another list</span>
                        <span className="sm:hidden">Add list</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <MobileMenu 
            onShare={() => setShowShareModal(true)}
            onAddList={() => setNewListTitle('New List')}
            isAddingList={!!newListTitle}
          />

          {/* Enhanced Drag Overlay */}
          <DragOverlay>
            {activeCard && (
              <div className={`glass p-4 rounded-2xl shadow-2xl opacity-90 transform rotate-3 scale-105 ${isMobile ? 'w-72' : 'w-80'} smooth-transition`}>
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{activeCard.title}</h4>
                <CompactCardFooter 
                  card={activeCard} 
                  onViewComments={(e) => handleViewComments(activeCard, e)}
                  onDownloadAttachment={(name, e) => handleDownloadAttachment(name, e)}
                  onViewDescription={(e) => handleViewDescription(activeCard, e)}
                />
              </div>
            )}
          </DragOverlay>

          {/* Enhanced Modals */}
            <ShareBoardModal
            board={board}
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            onUpdateMembers={(members) => updateBoard(projectId!, boardId!, { members })}
          />

          {selectedCard && (
            <EnhancedCardModal
              card={selectedCard.card}
              isOpen={showCardModal}
              onClose={() => {
                setShowCardModal(false);
                setSelectedCard(null);
              }}
              onSave={(updates) => handleUpdateCard(selectedCard.listId, selectedCard.card.id, updates)}
              onDelete={() => setDeleteConfirm({ type: 'card', id: selectedCard.card.id, listId: selectedCard.listId })}
              boardMembers={board.members}
            />
          )}

          {commentsCard && (
            <CommentsModal
              card={commentsCard}
              isOpen={showCommentsModal}
              onClose={() => {
                setShowCommentsModal(false);
                setCommentsCard(null);
              }}
            />
          )}

          {descriptionCard && (
            <DescriptionModal
              card={descriptionCard}
              isOpen={showDescriptionModal}
              onClose={() => {
                setShowDescriptionModal(false);
                setDescriptionCard(null);
              }}
            />
          )}

          {confirmDialogProps && (
            <ConfirmDialog
              isOpen={!!deleteConfirm}
              onClose={() => setDeleteConfirm(null)}
              onConfirm={
                deleteConfirm?.type === 'list' 
                  ? handleDeleteList 
                  : deleteConfirm?.type === 'card' 
                  ? handleDeleteCard 
                  : handleRemoveMember
              }
              title={confirmDialogProps.title}
              description={confirmDialogProps.description}
            />
          )}
        </div>
      </DndContext>
    </>
  );
};

export default Board;