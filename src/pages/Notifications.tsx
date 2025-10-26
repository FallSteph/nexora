import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bell, BellOff, Trash2, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

const Notifications = () => {
  const { notifications, markNotificationRead, deleteNotification, clearAllNotifications } = useApp();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    toast.success('Marked as read');
  };

  const handleClearAll = () => {
    clearAllNotifications();
    toast.success('All notifications cleared');
    setClearAllConfirm(false);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    toast.success('Notification deleted');
    setDeleteConfirm(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-1 sm:mb-2">
            Notifications
          </h1>
          <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
              : 'All caught up! 🎉'
            }
          </p>
        </div>

        {/* Clear All Button - Always visible when there are notifications */}
        {notifications.length > 0 && (
          <div className="flex-shrink-0">
            <Dialog open={clearAllConfirm} onOpenChange={setClearAllConfirm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="glass w-full xs:w-auto">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-border max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Clear All Notifications</DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Are you sure you want to clear all notifications? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button 
                    variant="outline" 
                    onClick={() => setClearAllConfirm(false)} 
                    className="glass w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleClearAll} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    Clear All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        {notifications.length === 0 ? (
          <Card className="glass-strong p-4 sm:p-6 md:p-8 lg:p-12 text-center">
            <BellOff className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">No notifications</h3>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">You're all caught up!</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`glass-strong p-3 sm:p-4 md:p-6 transition-all duration-200 ${
                !notification.read 
                  ? 'border-l-2 sm:border-l-4 border-l-primary hover-glow shadow-sm hover:shadow-md' 
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notification.read
                        ? 'bg-muted'
                        : 'gradient-primary pulse-glow'
                    }`}
                  >
                    <Bell className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                      notification.read ? 'text-muted-foreground' : 'text-white'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={`font-medium text-xs xs:text-sm sm:text-base break-words leading-relaxed ${
                      !notification.read ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground">
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 xs:gap-2 flex-shrink-0">
                  {!notification.read && (
                    <>
                      {/* Desktop mark read button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                        className="hidden xs:inline-flex items-center h-7 sm:h-8 px-2 text-xs"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Read</span>
                      </Button>
                      
                      {/* Mobile mark read button - icon only */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                        className="xs:hidden h-7 w-7 p-0 flex-shrink-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                    onClick={() => handleDeleteClick(notification.id)}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Single Notification Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="glass-strong border-border max-w-[95vw] xs:max-w-sm sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl">Delete Notification</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base">
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirm(null)} 
              className="glass w-full sm:w-28 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-28 order-1 sm:order-2"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;