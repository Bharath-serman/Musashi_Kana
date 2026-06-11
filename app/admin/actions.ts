"use server";

import { cookies } from "next/headers";
import { signSession, verifySession } from "../lib/admin-auth";
import { supabaseService } from "../lib/supabase-service";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Helper to get admin credentials from env with safe fallbacks
function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || "VioletEvergarden";
  const password = process.env.ADMIN_PASSWORD || "horimiya";
  return { username, password };
}

// Helper to verify if the request is authenticated
async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) return false;

  const { password } = getAdminCredentials();
  const session = await verifySession(sessionCookie.value, password);
  return session !== null;
}

export async function loginAdmin(usernameInput: string, passwordInput: string) {
  const { username, password } = getAdminCredentials();

  if (usernameInput === username && passwordInput === password) {
    const expires = Date.now() + SESSION_EXPIRY;
    const token = await signSession({ username, expires }, password);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(expires),
      path: "/",
    });

    return { success: true };
  }

  return { success: false, error: "Invalid username or password." };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

export async function checkAdminAuth() {
  const authenticated = await checkAuth();
  const serviceKeyConfigured = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (authenticated) {
    const { username } = getAdminCredentials();
    return { authenticated: true, username, serviceKeyConfigured };
  }
  return { authenticated: false, serviceKeyConfigured };
}

export async function fetchSectionData(section: "flashcards" | "grammar_lessons" | "quiz_questions" | "reading_passages") {
  const authenticated = await checkAuth();
  if (!authenticated) {
    throw new Error("Unauthorized");
  }

  if (section === "reading_passages") {
    // Fetch reading passages and join their child questions
    const { data, error } = await supabaseService
      .from("reading_passages")
      .select(`
        id,
        level,
        title,
        japanese,
        translation,
        created_at,
        reading_questions (
          id,
          question,
          answer
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reading passages:", error);
      throw new Error(error.message);
    }
    return data || [];
  }

  const { data, error } = await supabaseService
    .from(section)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching from ${section}:`, error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function saveRecord(
  section: "flashcards" | "grammar_lessons" | "quiz_questions",
  record: Record<string, unknown>
) {
  const authenticated = await checkAuth();
  if (!authenticated) {
    throw new Error("Unauthorized");
  }

  const payload = { ...record };
  const id = payload.id;
  delete payload.id;
  delete payload.created_at;

  if (id) {
    // Update existing record
    const { data, error } = await supabaseService
      .from(section)
      .update(payload)
      .eq("id", id)
      .select();

    if (error) {
      console.error(`Error updating record in ${section}:`, error);
      throw new Error(error.message);
    }
    return { success: true, data: data?.[0] };
  } else {
    // Insert new record
    const { data, error } = await supabaseService
      .from(section)
      .insert([payload])
      .select();

    if (error) {
      console.error(`Error inserting record in ${section}:`, error);
      throw new Error(error.message);
    }
    return { success: true, data: data?.[0] };
  }
}

export async function saveReadingPassage(
  passage: Record<string, unknown>,
  questions: { question: string; answer: string }[]
) {
  const authenticated = await checkAuth();
  if (!authenticated) {
    throw new Error("Unauthorized");
  }

  const passagePayload = { ...passage };
  const id = passagePayload.id;
  delete passagePayload.id;
  delete passagePayload.created_at;
  delete passagePayload.reading_questions;

  if (id) {
    // 1. Update the passage record
    const { error: passageError } = await supabaseService
      .from("reading_passages")
      .update(passagePayload)
      .eq("id", id);

    if (passageError) {
      console.error("Error updating reading passage:", passageError);
      throw new Error(passageError.message);
    }

    // 2. Sync child questions: delete all current and insert new ones
    const { error: deleteError } = await supabaseService
      .from("reading_questions")
      .delete()
      .eq("passage_id", id);

    if (deleteError) {
      console.error("Error deleting old reading questions:", deleteError);
      throw new Error(deleteError.message);
    }

    if (questions.length > 0) {
      const questionsToInsert = questions.map((q) => ({
        passage_id: id,
        question: q.question,
        answer: q.answer,
      }));

      const { error: insertError } = await supabaseService
        .from("reading_questions")
        .insert(questionsToInsert);

      if (insertError) {
        console.error("Error inserting new reading questions:", insertError);
        throw new Error(insertError.message);
      }
    }

    return { success: true, passageId: id };
  } else {
    // 1. Insert new passage record
    const { data: insertedPassages, error: passageError } = await supabaseService
      .from("reading_passages")
      .insert([passagePayload])
      .select();

    if (passageError || !insertedPassages || insertedPassages.length === 0) {
      console.error("Error inserting reading passage:", passageError);
      throw new Error(passageError?.message || "Failed to create reading passage");
    }

    const newPassageId = insertedPassages[0].id;

    // 2. Insert questions for the new passage
    if (questions.length > 0) {
      const questionsToInsert = questions.map((q) => ({
        passage_id: newPassageId,
        question: q.question,
        answer: q.answer,
      }));

      const { error: insertError } = await supabaseService
        .from("reading_questions")
        .insert(questionsToInsert);

      if (insertError) {
        console.error("Error inserting new reading questions:", insertError);
        throw new Error(insertError.message);
      }
    }

    return { success: true, passageId: newPassageId };
  }
}

export async function deleteRecord(
  section: "flashcards" | "grammar_lessons" | "quiz_questions" | "reading_passages",
  id: string
) {
  const authenticated = await checkAuth();
  if (!authenticated) {
    throw new Error("Unauthorized");
  }

  if (section === "reading_passages") {
    // 1. Delete associated reading questions first (cascading cleanup)
    const { error: deleteQuestionsError } = await supabaseService
      .from("reading_questions")
      .delete()
      .eq("passage_id", id);

    if (deleteQuestionsError) {
      console.error("Error deleting reading questions:", deleteQuestionsError);
      throw new Error(deleteQuestionsError.message);
    }
  }

  // 2. Delete the record itself
  const { error } = await supabaseService
    .from(section)
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting record from ${section}:`, error);
    throw new Error(error.message);
  }

  return { success: true };
}
