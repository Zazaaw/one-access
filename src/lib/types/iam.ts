export type SubjectType = 'employee' | 'executive' | 'commissioner' | 'external';

export interface Subject {
    subject_id: string;
    display_name: string;
    subject_type: SubjectType;
    nik_sap?: string;
    avatar_url?: string;
}

export interface Application {
    id: string;
    app_code: string;
    app_name: string;
    launch_url: string;
    icon_name: string; // We'll use lucide icon names
    description: string;
    category: string;
    is_pwa?: boolean;
}

export interface SubjectAppRole {
    subject_id: string;
    app_id: string;
    role_code: string;
    scope_type: 'global' | 'custom';
    is_active: boolean;
}

export interface AuditLog {
    id: string;
    subject_id: string;
    app_id: string;
    action: 'launch' | 'login' | 'logout';
    timestamp: string;
    metadata?: any;
}
