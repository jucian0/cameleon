export type Database = {
  public: {
    Tables: {
      workflows: {
        Row: {
          id: string;
          name: string;
          owner: string;
          created_at: string;
          updated_at: string;
          description: string | null;
          content: string | null;
          visibility: "public" | "private";
        };
        Insert: {
          id?: string;
          name: string;
          owner: string;
          description?: string | null;
          content?: string | null;
          visibility?: "public" | "private";
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string;
          description?: string | null;
          content?: string | null;
          visibility?: "public" | "private";
        };
      };
      workflow_versions: {
        Row: {
          id: string;
          workflow_id: string;
          version: string;
          status: string;
          updated_at: string;
          description: string;
          content: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          version: string;
          status: string;
          updated_at?: string;
          description: string;
          content: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          version?: string;
          status?: string;
          updated_at?: string;
          description?: string;
          content?: string;
        };
      };
    };
    Views: {
      workflow_latest_versions: {
        Row: {
          id: string;
          workflow_id: string;
          version: string;
          status: string;
          updated_at: string;
          description: string;
          content: string;
        };
      };
    };
  };
};

export type CamelConfig = Database["public"]["Tables"]["workflows"]["Row"];

export type ConfigVersion =
  Database["public"]["Tables"]["workflow_versions"]["Row"];

export type CamelConfigView = CamelConfig & {
  latest_version: ConfigVersion[];
};
