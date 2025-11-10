import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// ---------------------
// 🧩 Interfaces
// ---------------------

export interface Card {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  labels: string[];
  assignedMembers: string[];
  dueDate?: string | Date;
  googleEventId?: string;
  attachments: string[];
  comments: { user: string; text: string; timestamp: Date }[];
}

export interface List {
  id?: string;     // sometimes lists from backend haven’t been normalized yet
  _id?: string;    // allow the raw MongoDB id
  title: string;
  cards: Card[];
}

export interface Board {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  lists: List[];
  members: { email: string; role: "member" | "manager"; _id }[];
  userEmail?: string;
  createdAt?: string;
  dueDate?: string | Date;
  googleEventId?: string;
}

export interface Notification {
  id?: string;
  _id?: string;
  userEmail: string;
  message: string;
  type: 'welcome' | 'board_added' | 'card_assigned' | 'card_comment' | 'new_signup' | 'board_created'; // ✅ added
  read: boolean;
  createdAt: string;
  timestamp?: string;
  boardId?: string;
  boardTitle?: string;
  addedBy?: string;
}

// ---------------------
// ⚙️ Context Type
// ---------------------
interface AppContextType {
  boards: Board[];
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  notifications: Notification[];
  fetchNotifications: (userEmail: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateBoardMembers: (
    boardId: string,
    members: { email: string; role: "member" | "manager" }[]
  ) => Promise<void>;
  searchUsers: (query: string) => Promise<any[]>;


  addBoard: (board: Board) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;

  addList: (boardId: string, title: string) => void;
  updateList: (boardId: string, listId: string, title: string) => void;
  deleteList: (boardId: string, listId: string) => void;
  reorderLists: (boardId: string, lists: List[]) => void;

  addCard: (boardId: string, listId: string, card: Omit<Card, "id">) => void;
  updateCard: (boardId: string, listId: string, cardId: string, updates: Partial<Card>) => void;
  deleteCard: (boardId: string, listId: string, cardId: string) => void;
  moveCard: (
    boardId: string,
    cardId: string,
    fromListId: string,
    toListId: string,
    newIndex: number
  ) => void;


}

// ---------------------
// 🧠 Context setup
// ---------------------
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// ---------------------
// 🚀 Provider Component
// ---------------------
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  

  // ---------------------
  // 🧩 Board Methods
  // ---------------------
  const addBoard = (board: Board) => {
    setBoards((prev) => [...prev, board]);
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    try {
      // ✅ Properly handle board-level dueDate
      const payload = {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate).toISOString() : updates.dueDate === null ? null : undefined,
      };
      
      const res = await fetch(`http://localhost:5000/api/boards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update board");

      const updatedBoard = await res.json();
      
      setBoards((prev) => prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, ...updatedBoard };
          // If lists are being updated, ensure they're normalized
          if (updatedBoard.lists) {
            updated.lists = normalizeLists(updatedBoard.lists);
          }
          return updated;
        }
        return b;
      }));
    } catch (err) {
      console.error("❌ updateBoard error:", err);
    }
  };

  const deleteBoard = (id: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  // ---------------------
  // 🧩 List Methods
  // ---------------------
// ✅ Enhanced normalization to handle both _id and id fields
const normalizeLists = (lists: any[]) =>
  (lists || []).map((l: any) => ({
    id: l.id || l._id, // Support both formats
    _id: l._id || l.id,
    title: l.title,
    cards: (l.cards || []).map((c: any) => ({
      id: c.id || c._id, // Support both formats
      _id: c._id || c.id,
      title: c.title,
      description: c.description,
      labels: c.labels || [],
      assignedMembers: c.assignedMembers || [],
      dueDate: c.dueDate
        ? new Date(c.dueDate).toISOString().slice(0, 16) // ✅ keep YYYY-MM-DDTHH:mm
        : "",
      attachments: c.attachments || [],
      comments: (c.comments || []).map((comment: any) => ({
        ...comment,
        id: comment.id || comment._id,
      })),
    })),
  }));

// ✅ Add List
const addList = async (boardId: string, title: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/boards/${boardId}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) throw new Error("Failed to add list");

    const updatedBoard = await res.json();
    const normalizedLists = normalizeLists(updatedBoard.lists);

    setBoards(prev =>
      prev.map(b => (b.id === boardId ? { ...b, lists: normalizedLists } : b))
    );
  } catch (err) {
    console.error("❌ addList error:", err);
  }
};



  const updateList = async (boardId: string, listId: string, title: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/boards/${boardId}/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error("Failed to update list");

      const updatedBoard = await res.json();
      const normalizedLists = normalizeLists(updatedBoard.lists);

      setBoards(prev =>
        prev.map(b => (b.id === boardId ? { ...b, lists: normalizedLists } : b))
      );
    } catch (err) {
      console.error("❌ updateList error:", err);
    }
  };

  const deleteList = async (boardId: string, listId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/boards/${boardId}/lists/${listId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete list");

      const updatedBoard = await res.json();
      const normalizedLists = normalizeLists(updatedBoard.lists);

      setBoards(prev =>
        prev.map(b => (b.id === boardId ? { ...b, lists: normalizedLists } : b))
      );
    } catch (err) {
      console.error("❌ deleteList error:", err);
    }
  };

  const reorderLists = (boardId: string, lists: List[]) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, lists } : b))
    );
  };

  // ---------------------
  // 🧩 Card Methods
  // ---------------------
const addCard = async (boardId: string, listId: string, card: Omit<Card, "id">) => {
  try {
    console.log("🧩 addCard called with:", { boardId, listId, card });
    const payload = {
      ...card,
      dueDate: card.dueDate ? new Date(card.dueDate).toISOString() : null,
    };

    const res = await fetch(
      `http://localhost:5000/api/boards/${boardId}/lists/${listId}/cards`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // ✅ Fixed: Send payload with proper date
      }
    );

    if (!res.ok) throw new Error("Failed to add card");

    const updatedBoard = await res.json();
    const normalizedLists = normalizeLists(updatedBoard.lists);

    setBoards(prev =>
      prev.map(b => (b.id === boardId ? { ...b, lists: normalizedLists } : b))
    );
  } catch (err) {
    console.error("❌ addCard error:", err);
  }
};

const updateCard = async (
  boardId: string,
  listId: string,
  cardId: string,
  updates: Partial<Card>
) => {
  try {
    // ✅ Properly handle dueDate in updates
    const payload = {
      ...updates,
      dueDate: updates.dueDate ? new Date(updates.dueDate).toISOString() : updates.dueDate === null ? null : undefined,
    };
    
    const res = await fetch(
      `http://localhost:5000/api/boards/${boardId}/lists/${listId}/cards/${cardId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Failed to update card");

    const updatedBoard = await res.json();
    const normalizedLists = normalizeLists(updatedBoard.lists);

    setBoards(prev =>
      prev.map(b => (b.id === boardId ? { ...b, lists: normalizedLists } : b))
    );

    // ✅ Notifications
    if (updates.comments) {
      const card = normalizedLists.find(l => l.id === listId)?.cards.find(c => c.id === cardId);
      if (card) {
        const notifyMembers = card.assignedMembers.filter(email => email !== updates.comments.at(-1)?.user); // last comment author
        await Promise.all(
          notifyMembers.map(email =>
            addNotification({
              userEmail: email,
              message: `${updates.comments.at(-1)?.user} commented on "${card.title}": "${updates.comments.at(-1)?.text}"`,
              type: 'card_comment',
              read: false
            })
          )
        );
      }
    }

    if (updates.assignedMembers) {
      const card = normalizedLists.find(l => l.id === listId)?.cards.find(c => c.id === cardId);
      if (card) {
        const newMembers = updates.assignedMembers.filter(email => !card.assignedMembers.includes(email));
        await Promise.all(
          newMembers.map(email =>
            addNotification({
              userEmail: email,
              message: `You were assigned to card "${card.title}" on board "${updatedBoard.title}"`,
              type: 'card_assigned',
              read: false
            })
          )
        );
      }
    }

  } catch (err) {
    console.error("❌ updateCard error:", err);
  }
};


  const deleteCard = async (boardId: string, listId: string, cardId: string) => {
    try {
      
      const res = await fetch(
        `http://localhost:5000/api/boards/${boardId}/lists/${listId}/cards/${cardId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete card");

      const updatedBoard = await res.json();
      const normalizedLists = normalizeLists(updatedBoard.lists);

      setBoards(prev =>
        prev.map(b => (b.id === boardId ? { ...b, lists: normalizedLists } : b))
      );
    } catch (err) {
      console.error("❌ deleteCard error:", err);
    }
  };

  const moveCard = async (
    boardId: string,
    cardId: string,
    fromListId: string,
    toListId: string,
    newIndex: number
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/boards/${boardId}/lists/${fromListId}/cards/${cardId}/move`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toListId, newIndex }),
        }
      );

      if (!res.ok) throw new Error("Failed to move card");

      const updatedBoard = await res.json();
      const normalizedLists = normalizeLists(updatedBoard.lists);

      setBoards(prev =>
        prev.map(b => (b.id === boardId ? { ...b, lists: normalizedLists } : b))
      );
    } catch (err) {
      console.error("❌ moveCard error:", err);
    }
  };
  

  // ---------------------
// 🧩 Board Member Methods
// ---------------------

const searchUsers = async (query: string): Promise<any[]> => {
  try {
    if (!query.trim()) return [];
    const res = await axios.get(`http://localhost:5000/api/users/search?q=${query}`);
    return res.data as any[];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};


const updateBoardMembers = async (
  boardId: string,
  members: { email: string; role: "member" | "manager" }[]
) => {
  try {
    const res = await fetch(`http://localhost:5000/api/boards/${boardId}/members`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update members");

    const board = boards.find(b => b.id === boardId);

    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, members: data.board.members } : b))
    );

    // ✅ Notify newly added members
    if (board) {
      const oldEmails = board.members.map(m => m.email);
      const newMembers = data.board.members.filter(m => !oldEmails.includes(m.email));

      await Promise.all(
        newMembers.map(m =>
          addNotification({
            userEmail: m.email,
            message: `You were added to board "${board.title}"`,
            type: 'board_added',
            read: false
          })
        )
      );
    }

  } catch (err) {
    console.error("❌ updateBoardMembers error:", err);
  }
};



// ---------------------
// 🧩 Notification Methods (with backend)
// ---------------------


const normalizeNotification = (notif: Notification) => ({
  ...notif,
  id: notif.id || notif._id,
});


  const fetchNotifications = async (userEmail: string) => {
    if (!userEmail) return console.warn('⚠️ No userEmail provided');

    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${userEmail}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      console.log('✅ Notifications fetched:', data);
      setNotifications(data);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  };



const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  try {
    const res = await axios.post<Notification>(`http://localhost:5000/api/notifications`, notification);

    // Get current user email from localStorage
    const currentUser = localStorage.getItem("userEmail");

    // ✅ If the notification belongs to the current user, immediately show it
    if (currentUser && notification.userEmail === currentUser) {
      setNotifications(prev => [res.data, ...prev]);
    }

    // ✅ Otherwise, still save it but don't affect someone else's state
  } catch (err) {
    console.error("Failed to add notification:", err);
  }
};


const markNotificationRead = async (id: string) => {
  try {
    await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(notif => notif._id === id ? { ...notif, read: true } : notif)
    );
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
};

const deleteNotification = async (id: string) => {
  try {
    await axios.delete(`http://localhost:5000/api/notifications/${id}`);
    setNotifications(prev => prev.filter(notif => notif._id !== id));
  } catch (err) {
    console.error("Failed to delete notification:", err);
  }
};

const clearAllNotifications = async (userEmail?: string) => {
  if (!userEmail) return; // exit if no user email
  try {
    await axios.delete(`http://localhost:5000/api/notifications/clear/${userEmail}`);
    setNotifications([]);
  } catch (err) {
    console.error("Failed to clear notifications:", err);
  }
};


  // ---------------------
  // 🧱 Return Provider
  // ---------------------
  return (
    <AppContext.Provider
      value={{
        boards,
        setBoards,
        notifications,
        fetchNotifications,
        addNotification,
        markNotificationRead,
        deleteNotification,
        clearAllNotifications,
        addBoard,
        updateBoard,
        deleteBoard,
        addList,
        updateList,
        deleteList,
        reorderLists,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        searchUsers,
        updateBoardMembers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};