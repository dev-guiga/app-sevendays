export type DiaryListItem = {
  id: number;
  title?: string;
  description?: string;
  professional?: {
    professional_description?: string;
    description?: string;
  };
  user_name?: string;
  user_email?: string;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  professional_branch?: string;
  professional_document?: string;
  professional_document_type?: string;
  professional_description?: string;
};

export type DiaryListResponse = {
  success?: boolean;
  diaries?: DiaryListItem[];
  pagination?: {
    page?: number;
    per_page?: number;
    total_count?: number;
    total_pages?: number;
    has_prev?: boolean;
    has_next?: boolean;
  };
};
