export enum UserRole {
  MASTER = 'Master',
  VIEWER = 'Viewer',
  PLAYER = 'Player',
  CLIENT = 'Client'
}

export interface User {
  id: number;
  projectId: number;
  externalUserId: string;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}