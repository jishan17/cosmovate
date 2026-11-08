
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const BUCKET = "cosmovate-gallery";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function getAuthorizedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      role: null,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const { data: member, error } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !member || !["super_admin", "admin"].includes(member.role)) {
    return {
      supabase,
      user,
      role: member?.role ?? null,
      response: NextResponse.json(
        { error: "You are not authorised to manage gallery images." },
        { status: 403 }
      ),
    };
  }

  return { supabase, user, role: member.role, response: null };
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gallery_images")
    .select(
      "id, title, description, category, credit, image_url, storage_path, is_featured, display_order, created_at"
    )
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Unable to load gallery images." },
      { status: 500 }
    );
  }

  return NextResponse.json({ images: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthorizedClient();
  if (auth.response) return auth.response;

  const form = await request.formData();
  const file = form.get("image");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const credit = String(form.get("credit") ?? "").trim();
  const isFeatured = form.get("is_featured") === "true";
  const displayOrder = Number(form.get("display_order") ?? 0);

  if (!(file instanceof File) || !title || !category) {
    return NextResponse.json(
      { error: "An image, title and category are required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WEBP or GIF image." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "The image must be 10 MB or smaller." },
      { status: 400 }
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await auth.supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Image upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: publicUrl } = auth.supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const { data, error: insertError } = await auth.supabase
    .from("gallery_images")
    .insert({
      title,
      description,
      category,
      credit: credit || null,
      image_url: publicUrl.publicUrl,
      storage_path: storagePath,
      is_featured: isFeatured,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
      uploaded_by: auth.user!.id,
    })
    .select(
      "id, title, description, category, credit, image_url, storage_path, is_featured, display_order, created_at"
    )
    .single();

  if (insertError) {
    await auth.supabase.storage.from(BUCKET).remove([storagePath]);

    return NextResponse.json(
      { error: `Image details could not be saved: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ image: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAuthorizedClient();
  if (auth.response) return auth.response;

  const body = await request.json();
  const id = String(body.id ?? "");
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const credit = String(body.credit ?? "").trim();
  const isFeatured = Boolean(body.is_featured);
  const displayOrder = Number(body.display_order ?? 0);

  if (!id || !title || !category) {
    return NextResponse.json(
      { error: "Image ID, title and category are required." },
      { status: 400 }
    );
  }

  const { data, error } = await auth.supabase
    .from("gallery_images")
    .update({
      title,
      description,
      category,
      credit: credit || null,
      is_featured: isFeatured,
      display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
    })
    .eq("id", id)
    .select(
      "id, title, description, category, credit, image_url, storage_path, is_featured, display_order, created_at"
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Unable to update this gallery image." },
      { status: 500 }
    );
  }

  return NextResponse.json({ image: data });
}

export async function DELETE(request: Request) {
  const auth = await getAuthorizedClient();
  if (auth.response) return auth.response;

  const body = await request.json();
  const id = String(body.id ?? "");
  const storagePath = String(body.storage_path ?? "");

  if (!id || !storagePath) {
    return NextResponse.json(
      { error: "Image ID and storage path are required." },
      { status: 400 }
    );
  }

  const { error: deleteError } = await auth.supabase
    .from("gallery_images")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Unable to delete the gallery record." },
      { status: 500 }
    );
  }

  const { error: storageError } = await auth.supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (storageError) {
    return NextResponse.json(
      {
        error:
          "The gallery record was deleted, but the stored image could not be removed. Check Supabase Storage.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
