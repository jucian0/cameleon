export type Database = {
  public: {
    Tables: {
      camel_config_projects: {
        Row: {
          id: string;
          name: string;
          owner: string;
          tags: string[] | null;
          environment: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner: string;
          tags?: string[] | null;
          environment: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string;
          tags?: string[] | null;
          environment?: string;
        };
      };
      camel_config_versions: {
        Row: {
          id: string;
          config_id: string;
          version: string;
          status: string;
          updated_at: string;
          description: string;
          content: string;
        };
        Insert: {
          id?: string;
          config_id: string;
          version: string;
          status: string;
          updated_at?: string;
          description: string;
          content: string;
        };
        Update: {
          id?: string;
          config_id?: string;
          version?: string;
          status?: string;
          updated_at?: string;
          description?: string;
          content?: string;
        };
      };
    };
    Views: {
      camel_config_latest_versions: {
        Row: {
          id: string;
          config_id: string;
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

export type CamelConfig =
  Database["public"]["Tables"]["camel_config_projects"]["Row"];
