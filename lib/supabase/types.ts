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
  signal_feed_id: string | null;
  source_platform: string | null;
  source_url: string | null;
  discovery_date: string | null;
  created_at: string;
  updated_at: string;
};

export type SignalFeedStatus =
  | "New"
  | "Reviewed"
  | "Saved"
  | "Dismissed"
  | "Not Applicable";

export type SignalConfidence = "High" | "Medium" | "Low";
export type SignalOpportunityLevel = "High" | "Medium" | "Low";
export type SignalPriority = "Hot" | "Warm" | "Cold";

export type SignalOpportunityType =
  | "Career Opportunity"
  | "Business Opportunity"
  | "Recruitment"
  | "AI Consulting"
  | "Networking"
  | "Partnership"
  | "Referral"
  | "Investment"
  | "Other";

export type SignalFeed = {
  id: string;
  platform: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  post_url: string | null;
  post_text: string;
  post_date: string | null;
  pain_summary: string | null;
  pain_categories: string[];
  lead_score: number;
  intent_score: number;
  confidence_level: SignalConfidence;
  opportunity_level: SignalOpportunityLevel;
  priority: SignalPriority;
  opportunity_type: SignalOpportunityType | null;
  why_this_is_a_signal: string | null;
  potential_needs: string | null;
  ai_reasoning: string | null;
  suggested_openers: string[];
  recommended_action: string | null;
  status: SignalFeedStatus;
  saved_lead_id: string | null;
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
          },
          {
            foreignKeyName: "leads_signal_feed_id_fkey";
            columns: ["signal_feed_id"];
            isOneToOne: false;
            referencedRelation: "signal_feed";
            referencedColumns: ["id"];
          }
        ];
      };
      signal_feed: {
        Row: SignalFeed;
        Insert: Partial<SignalFeed> & {
          display_name: string;
          post_text: string;
          platform: string;
        };
        Update: Partial<SignalFeed>;
        Relationships: [
          {
            foreignKeyName: "signal_feed_saved_lead_id_fkey";
            columns: ["saved_lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
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
