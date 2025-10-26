import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Card {
  id: string;
  title: string;
  description?: string;
  labels: string[];
  assignedMembers: string[];
  dueDate?: Date;
  attachments: string[];
  comments: { user: string; text: string; timestamp: Date }[];
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
  members: { email: string; role: 'member' | 'manager' }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  boards: Board[];
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

interface AppContextType {
  projects: Project[];
  notifications: Notification[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addBoard: (projectId: string, board: Omit<Board, 'id'>) => void;
  updateBoard: (projectId: string, boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (projectId: string, boardId: string) => void;
  addList: (projectId: string, boardId: string, title: string) => void;
  updateList: (projectId: string, boardId: string, listId: string, title: string) => void;
  deleteList: (projectId: string, boardId: string, listId: string) => void;
  reorderLists: (projectId: string, boardId: string, lists: List[]) => void;
  addCard: (projectId: string, boardId: string, listId: string, card: Omit<Card, 'id'>) => void;
  updateCard: (projectId: string, boardId: string, listId: string, cardId: string, updates: Partial<Card>) => void;
  deleteCard: (projectId: string, boardId: string, listId: string, cardId: string) => void;
  moveCard: (projectId: string, boardId: string, cardId: string, fromListId: string, toListId: string, newIndex: number) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Mock initial data
const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description: 'Complete overhaul of company website',
    boards: [
      {
        id: '1',
        title: 'Main Board',
        lists: [
          {
            id: '1',
            title: 'To Do',
            cards: [
              {
                id: '1',
                title: 'Design homepage mockup',
                description: 'Create initial design concepts',
                labels: ['design', 'high-priority'],
                assignedMembers: ['user1'],
                dueDate: new Date('2025-11-01'),
                attachments: [],
                comments: [],
              },
            ],
          },
          {
            id: '2',
            title: 'In Progress',
            cards: [],
          },
          {
            id: '3',
            title: 'Done',
            cards: [],
          },
        ],
        members: [
          { email: 'designer@nexora.io', role: 'manager' },
          { email: 'dev@nexora.io', role: 'member' },
        ],
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    message: 'New task assigned: Design homepage mockup',
    read: false,
    timestamp: new Date(),
  },
  {
    id: '2',
    message: 'Project "Website Redesign" updated',
    read: false,
    timestamp: new Date(Date.now() - 3600000),
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const addBoard = (projectId: string, board: Omit<Board, 'id'>) => {
    const newBoard: Board = {
      ...board,
      id: Date.now().toString(),
    };
    setProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, boards: [...p.boards, newBoard] } : p
      )
    );
  };

  const updateBoard = (projectId: string, boardId: string, updates: Partial<Board>) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) => (b.id === boardId ? { ...b, ...updates } : b)),
            }
          : p
      )
    );
  };

  const deleteBoard = (projectId: string, boardId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? { ...p, boards: p.boards.filter((b) => b.id !== boardId) }
          : p
      )
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const addList = (projectId: string, boardId: string, title: string) => {
    const newList: List = {
      id: Date.now().toString(),
      title,
      cards: [],
    };
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId ? { ...b, lists: [...b.lists, newList] } : b
              ),
            }
          : p
      )
    );
  };

  const updateList = (projectId: string, boardId: string, listId: string, title: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId
                  ? {
                      ...b,
                      lists: b.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
                    }
                  : b
              ),
            }
          : p
      )
    );
  };

  const deleteList = (projectId: string, boardId: string, listId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId
                  ? { ...b, lists: b.lists.filter((l) => l.id !== listId) }
                  : b
              ),
            }
          : p
      )
    );
  };

  const reorderLists = (projectId: string, boardId: string, lists: List[]) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) => (b.id === boardId ? { ...b, lists } : b)),
            }
          : p
      )
    );
  };

  const addCard = (projectId: string, boardId: string, listId: string, card: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
    };
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId
                  ? {
                      ...b,
                      lists: b.lists.map((l) =>
                        l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
                      ),
                    }
                  : b
              ),
            }
          : p
      )
    );
  };

  const updateCard = (
    projectId: string,
    boardId: string,
    listId: string,
    cardId: string,
    updates: Partial<Card>
  ) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId
                  ? {
                      ...b,
                      lists: b.lists.map((l) =>
                        l.id === listId
                          ? {
                              ...l,
                              cards: l.cards.map((c) =>
                                c.id === cardId ? { ...c, ...updates } : c
                              ),
                            }
                          : l
                      ),
                    }
                  : b
              ),
            }
          : p
      )
    );
  };

  const deleteCard = (projectId: string, boardId: string, listId: string, cardId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              boards: p.boards.map((b) =>
                b.id === boardId
                  ? {
                      ...b,
                      lists: b.lists.map((l) =>
                        l.id === listId
                          ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
                          : l
                      ),
                    }
                  : b
              ),
            }
          : p
      )
    );
  };

  const moveCard = (
    projectId: string,
    boardId: string,
    cardId: string,
    fromListId: string,
    toListId: string,
    newIndex: number
  ) => {
    setProjects(
      projects.map((p) => {
        if (p.id !== projectId) return p;

        return {
          ...p,
          boards: p.boards.map((b) => {
            if (b.id !== boardId) return b;

            const fromList = b.lists.find((l) => l.id === fromListId);
            const toList = b.lists.find((l) => l.id === toListId);
            const card = fromList?.cards.find((c) => c.id === cardId);

            if (!fromList || !toList || !card) return b;

            const updatedLists = b.lists.map((l) => {
              if (l.id === fromListId) {
                return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
              }
              if (l.id === toListId) {
                const newCards = [...l.cards];
                newCards.splice(newIndex, 0, card);
                return { ...l, cards: newCards };
              }
              return l;
            });

            return { ...b, lists: updatedLists };
          }),
        };
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        notifications,
        addProject,
        updateProject,
        deleteProject,
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
        markNotificationRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
