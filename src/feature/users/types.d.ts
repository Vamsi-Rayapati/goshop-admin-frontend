
export type Role = 'operator'|'SUPERVISOR'| 'USER';
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    primary_address?: string;
    full_name: string;
    username: string;
    avatar?: string;
    role: Role;
    createdAt: string; // You can use Date if you plan to handle date objects
    updatedAt: string; // You can use Date if you plan to handle date objects
}