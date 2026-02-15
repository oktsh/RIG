import { User } from "@/types";

export const users: User[] = [
  {
    id: 1,
    name: "Алекс М.",
    email: "alex.m@rig.ai",
    role: "ADMIN",
    is_active: true,
    requires_approval: false,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Дмитрий С.",
    email: "dim@rig.ai",
    role: "MODERATOR",
    is_active: true,
    requires_approval: false,
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: 3,
    name: "Мария К.",
    email: "k.maria@corp.io",
    role: "USER",
    is_active: false,
    requires_approval: true,
    created_at: "2024-01-03T00:00:00Z",
  },
  {
    id: 4,
    name: "Игорь В.",
    email: "iv@rig.ai",
    role: "USER",
    is_active: true,
    requires_approval: true,
    created_at: "2024-01-04T00:00:00Z",
  },
];
