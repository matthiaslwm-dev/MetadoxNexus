export type LeadStatus =
  | "New"
  | "Shortlisted"
  | "Contacted"
  | "Meeting Booked"
  | "Won"
  | "Lost"
  | "Not Applicable";

export type LeadPriority = "High" | "Medium" | "Low";

export type Organisation = {
  id: string;
  name: string;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string;
  organisation_id: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  notes: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadPerformanceMetric = {
  id: string;
  lead_id: string;
  measure_name: string | null;
  ranking: number | null;
  measure_value: number | null;
  imported_at: string;
};

export type LeadActivity = {
  id: string;
  lead_id: string;
  activity_type: string;
  content: string | null;
  created_at: string;
};

export type LeadWithLatestMetric = {
  id: string;
  name: string;
  organisation_id: string | null;
  organisation_name: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  next_follow_up: string | null;
  created_at: string;
  measure_name: string | null;
  ranking: number | null;
  measure_value: number | null;
};

export type Database = {
  public: {
    Tables: {
      organisations: {
        Row: Organisation;
        Insert: Partial<Organisation> & { name: string };
        Update: Partial<Organisation>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: Partial<Lead> & { name: string };
        Update: Partial<Lead>;
        Relationships: [
          {
            foreignKeyName: "leads_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          }
        ];
      };
      lead_performance_metrics: {
        Row: LeadPerformanceMetric;
        Insert: Partial<LeadPerformanceMetric> & { lead_id: string };
        Update: Partial<LeadPerformanceMetric>;
        Relationships: [
          {
            foreignKeyName: "lead_performance_metrics_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          }
        ];
      };
      lead_activities: {
        Row: LeadActivity;
        Insert: Partial<LeadActivity> & {
          lead_id: string;
          activity_type: string;
        };
        Update: Partial<LeadActivity>;
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      leads_with_latest_metric: {
        Row: LeadWithLatestMetric;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
