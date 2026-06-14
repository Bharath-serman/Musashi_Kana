"use server";

import { supabase } from "../lib/supabase";

export type BlogPost = {
  id: string;
  level: string;
  category: string;
  title: string;
  description: string;
  content: string | null;
  url: string | null;
  image_url: string | null;
  important: boolean;
  created_at: string;
};

export async function fetchBlogPosts(level?: string, category?: string): Promise<BlogPost[]> {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (level && level !== "All") {
    query = query.or(`level.eq.${level},level.eq.All`);
  }
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
  return data || [];
}

export async function fetchBlogPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
  return data;
}

export async function fetchImportantBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("important", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching important blog posts:", error);
    return [];
  }
  return data || [];
}
