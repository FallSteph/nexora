import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Board } from '@/context/AppContext';
import { Copy, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface ShareBoardModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMembers: (members: { email: string; role: 'member' | 'manager' }[]) => void;
}

export const ShareBoardModal = ({ board, isOpen, onClose, onUpdateMembers }: ShareBoardModalProps) => {
  const [members, setMembers] = useState(board.members);
  const [originalMembers, setOriginalMembers] = useState(board.members);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'member' | 'manager'>('manager');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for unsaved changes (only role changes)
  useEffect(() => {
    const hasChanges = JSON.stringify(members) !== JSON.stringify(originalMembers);
    setHasUnsavedChanges(hasChanges);
  }, [members, originalMembers]);

  const handleAddMember = () => {
    if (!newEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    if (members.some((m) => m.email === newEmail)) {
      toast.error('Member already added');
      return;
    }

    const updated = [...members, { email: newEmail.trim(), role: newRole }];
    setMembers(updated);
    setNewEmail('');
    toast.success('Member added');
  };

  const confirmRemoveMember = (email: string) => {
    setMemberToRemove(email);
  };

  const handleRemoveMember = () => {
    if (memberToRemove) {
      setMembers(members.filter((m) => m.email !== memberToRemove));
      setMemberToRemove(null);
      toast.success('Member removed');
    }
  };

  const cancelRemoveMember = () => {
    setMemberToRemove(null);
  };

  const handleChangeRole = (email: string, role: 'member' | 'manager') => {
    setMembers(members.map((m) => (m.email === email ? { ...m, role } : m)));
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard');
  };

  const handleSave = () => {
    onUpdateMembers(members);
    setOriginalMembers(members);
    setHasUnsavedChanges(false);
    toast.success('✅ Board members updated');
    onClose();
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setMembers(originalMembers);
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMember();
    }
  };

  const getMemberToRemoveName = () => {
    if (!memberToRemove) return '';
    const member = members.find(m => m.email === memberToRemove);
    return member?.email || '';
  };

  return (
    <>
      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && cancelRemoveMember()}>
        <DialogContent className="glass-strong max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Remove Member</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-white/90">
              Are you sure you want to remove <span className="font-medium text-white">{getMemberToRemoveName()}</span> from this board?
            </p>
            <p className="text-xs text-purple-300/70 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={cancelRemoveMember}
              className="border-white/20 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveMember}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Share Board Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="glass-strong max-w-[95vw] xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden mx-2 sm:mx-4">
          <DialogHeader className="flex-shrink-0 px-4 sm:px-5 pt-4 pb-3">
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              Share Board
              {hasUnsavedChanges && (
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                  Unsaved changes
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Main content area */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 sm:px-5 pb-2">
            <div className="space-y-3 sm:space-y-4 flex-1 min-h-0 overflow-hidden flex flex-col">
              {/* Board Link */}
              <div className="flex-shrink-0">
                <Label className="text-sm font-medium mb-1 block">Board Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}${window.location.pathname}`}
                    readOnly
                    className="glass text-xs flex-1 border-white/15 h-9 hover:bg-blue-500/10 hover:border-blue-400/30 transition-all relative z-10"
                  />
                  <Button 
                    onClick={handleCopyLink} 
                    size="sm" 
                    className="flex-shrink-0 glass border-white/15 hover:bg-blue-500/10 hover:border-blue-400/30 px-3 h-9 min-w-[40px] transition-all relative z-10"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Add Member */}
              <div className="flex-shrink-0">
                <Label className="text-sm font-medium mb-1 block">Add Team Member</Label>
                <div className="flex gap-2">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="member@example.com"
                    className="flex-1 border-white/15 text-sm h-9 hover:bg-blue-500/10 hover:border-blue-400/30 transition-all relative z-10 min-w-0"
                  />
                  <Select value={newRole} onValueChange={(val) => setNewRole(val as 'member' | 'manager')}>
                    <SelectTrigger className="w-[100px] sm:w-[110px] border-white/15 text-sm h-9 hover:bg-blue-500/10 hover:border-blue-400/30 transition-all relative z-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/15">
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleAddMember} 
                    className="gradient-primary hover:bg-blue-500/20 hover:border-blue-400/40 px-3 flex-shrink-0 h-9 min-w-[40px] rounded-lg relative z-20 border border-transparent"
                    disabled={!newEmail.trim()}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    Board Members ({members.length})
                  </Label>
                  {members.length > 3 && (
                    <span className="text-xs text-purple-300/70 hidden xs:inline">
                      Scroll to see more
                    </span>
                  )}
                </div>
                
                {/* Scrollable Members Area */}
                <div className="flex-1 min-h-0 overflow-y-auto clean-scrollbar rounded-lg border border-white/10 bg-white/5">
                  {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-5 px-4">
                      <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center mb-2">
                        <Plus className="w-4 h-4 text-purple-300" />
                      </div>
                      <p className="text-sm text-purple-300 font-medium">No members yet</p>
                      <p className="text-xs text-purple-300/70 mt-0.5">Add team members to get started</p>
                    </div>
                  ) : (
                    <div className="p-1 sm:p-1.5">
                      {members.map((member) => (
                        <div 
                          key={member.email} 
                          className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-400/20 transition-all group relative z-10 mx-0"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 relative z-20 group-hover:ring-2 group-hover:ring-blue-400/30 transition-all">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-medium">
                                {member.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate text-white/90">{member.email}</p>
                              <p className="text-xs text-purple-300/70 capitalize">{member.role}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <Select
                              value={member.role}
                              onValueChange={(val) => handleChangeRole(member.email, val as 'member' | 'manager')}
                            >
                              <SelectTrigger className="w-[90px] sm:w-[100px] h-7 text-xs border-white/20 bg-white/5 hover:bg-blue-500/10 hover:border-blue-400/30 transition-all relative z-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border-white/15">
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmRemoveMember(member.email)}
                              className="h-7 w-7 p-0 flex-shrink-0 opacity-70 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-400/30 transition-all rounded-lg relative z-20"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex flex-row justify-end gap-2 sm:gap-3 p-3 border-t border-white/10">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              size="sm"
              className="px-3 sm:px-4 py-1.5 border-white/20 hover:bg-blue-500/10 hover:border-blue-400/30 text-xs sm:text-sm h-8 transition-all relative z-10"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm h-8 relative z-20 ${
                hasUnsavedChanges 
                  ? 'gradient-primary hover-glow' 
                  : 'glass border-white/20 opacity-70 cursor-not-allowed'
              }`}
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};