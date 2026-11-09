import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const BUCKET = "cosmovate-gallery";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PHOTOS_PER_UPLOAD = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function getAuthorizedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, response: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  const { data: member, error } = await supabase.from("team_members").select("role").eq("user_id", user.id).maybeSingle();
  if (error || !member || !["super_admin", "admin"].includes(member.role)) {
    return { supabase, user, response: NextResponse.json({ error: "You are not authorised to manage gallery images." }, { status: 403 }) };
  }
  return { supabase, user, response: null };
}

export async function GET() {
  const supabase = await createClient();
  const { data: albums, error } = await supabase.from("gallery_images")
    .select("id, title, description, category, credit, image_url, storage_path, is_featured, display_order, created_at")
    .order("is_featured", { ascending: false }).order("display_order", { ascending: true }).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load gallery albums." }, { status: 500 });

  const ids = (albums ?? []).map((album) => album.id);
  let extras: any[] = [];
  if (ids.length) {
    const result = await supabase.from("gallery_image_photos").select("id, album_id, image_url, storage_path, credit, photo_order, created_at").in("album_id", ids).order("photo_order", { ascending: true });
    if (result.error) return NextResponse.json({ error: "Unable to load gallery photos." }, { status: 500 });
    extras = result.data ?? [];
  }

  const images = (albums ?? []).map((album) => ({
    id: album.id,
    title: album.title,
    description: album.description,
    category: album.category,
    is_featured: album.is_featured,
    display_order: album.display_order,
    created_at: album.created_at,
    photos: [
      { id: album.id, image_url: album.image_url, storage_path: album.storage_path, credit: album.credit, photo_order: 0, created_at: album.created_at },
      ...extras.filter((photo) => photo.album_id === album.id).map(({ album_id, ...photo }) => photo),
    ].sort((a, b) => a.photo_order - b.photo_order),
  }));
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const auth = await getAuthorizedClient();
  if (auth.response) return auth.response;
  const form = await request.formData();
  const files = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const creditsRaw = String(form.get("credits") ?? "[]");
  const isFeatured = form.get("is_featured") === "true";
  const displayOrder = Number(form.get("display_order") ?? 0);
  if (!files.length || !title || !category) return NextResponse.json({ error: "At least one image, title and category are required." }, { status: 400 });
  if (files.length > MAX_PHOTOS_PER_UPLOAD) return NextResponse.json({ error: `Upload up to ${MAX_PHOTOS_PER_UPLOAD} photos at a time.` }, { status: 400 });
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: `Unsupported file type: ${file.name}. Use JPG, PNG, WEBP or GIF.` }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: `${file.name} is larger than 10 MB.` }, { status: 400 });
  }
  let credits: string[];
  try { credits = JSON.parse(creditsRaw); if (!Array.isArray(credits)) throw new Error(); }
  catch { return NextResponse.json({ error: "Photo credits were not valid." }, { status: 400 }); }

  const uploaded: { path: string; url: string; credit: string | null; file: File }[] = [];
  const cleanup = async () => { if (uploaded.length) await auth.supabase.storage.from(BUCKET).remove(uploaded.map((item) => item.path)); };
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
    const { error } = await auth.supabase.storage.from(BUCKET).upload(path, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (error) { await cleanup(); return NextResponse.json({ error: `Upload failed for ${file.name}: ${error.message}` }, { status: 500 }); }
    const { data } = auth.supabase.storage.from(BUCKET).getPublicUrl(path);
    uploaded.push({ path, url: data.publicUrl, credit: String(credits[index] ?? "").trim() || null, file });
  }

  const existingAlbumId = String(form.get("album_id") ?? "").trim();
  if (existingAlbumId) {
    const { data: existingAlbum } = await auth.supabase.from("gallery_images").select("id").eq("id", existingAlbumId).maybeSingle();
    if (!existingAlbum) { await cleanup(); return NextResponse.json({ error: "Album not found." }, { status: 404 }); }
    const { data: currentPhotos, error: countError } = await auth.supabase.from("gallery_image_photos").select("photo_order").eq("album_id", existingAlbumId).order("photo_order", { ascending: false }).limit(1);
    if (countError) { await cleanup(); return NextResponse.json({ error: "Unable to check existing album photos." }, { status: 500 }); }
    const startOrder = (currentPhotos?.[0]?.photo_order ?? 0) + 1;
    const { error: appendError } = await auth.supabase.from("gallery_image_photos").insert(uploaded.map((photo, index) => ({ album_id: existingAlbumId, image_url: photo.url, storage_path: photo.path, credit: photo.credit, photo_order: startOrder + index })));
    if (appendError) { await cleanup(); return NextResponse.json({ error: `Photos could not be added: ${appendError.message}` }, { status: 500 }); }
    return NextResponse.json({ success: true, photo_count: uploaded.length }, { status: 201 });
  }

  const first = uploaded[0];
  const { data: album, error: albumError } = await auth.supabase.from("gallery_images").insert({
    title, description, category, credit: first.credit, image_url: first.url, storage_path: first.path,
    is_featured: isFeatured, display_order: Number.isFinite(displayOrder) ? displayOrder : 0, uploaded_by: auth.user!.id,
  }).select("id, title, description, category, is_featured, display_order, created_at").single();
  if (albumError || !album) { await cleanup(); return NextResponse.json({ error: `Album could not be saved: ${albumError?.message ?? "Unknown error"}` }, { status: 500 }); }

  if (uploaded.length > 1) {
    const { error } = await auth.supabase.from("gallery_image_photos").insert(uploaded.slice(1).map((photo, index) => ({ album_id: album.id, image_url: photo.url, storage_path: photo.path, credit: photo.credit, photo_order: index + 1 })));
    if (error) {
      await auth.supabase.from("gallery_images").delete().eq("id", album.id);
      await cleanup();
      return NextResponse.json({ error: `Additional photos could not be saved: ${error.message}` }, { status: 500 });
    }
  }
  return NextResponse.json({ album, photo_count: uploaded.length }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAuthorizedClient();
  if (auth.response) return auth.response;
  const body = await request.json();
  if (body.action === "reorder") {
    const albumId = String(body.album_id ?? "");
    const photoIds = Array.isArray(body.photo_ids) ? body.photo_ids.map(String) : [];
    if (!albumId || !photoIds.length) return NextResponse.json({ error: "Album and photo order are required." }, { status: 400 });
    const { data: album } = await auth.supabase.from("gallery_images").select("id").eq("id", albumId).maybeSingle();
    if (!album) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    for (let index = 0; index < photoIds.length; index++) {
      const photoId = photoIds[index];
      if (photoId === albumId) continue;
      const { error } = await auth.supabase.from("gallery_image_photos").update({ photo_order: index }).eq("id", photoId).eq("album_id", albumId);
      if (error) return NextResponse.json({ error: "Unable to update photo order." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
  const id = String(body.id ?? "");
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const displayOrder = Number(body.display_order ?? 0);
  if (!id || !title || !category) return NextResponse.json({ error: "Album ID, title and category are required." }, { status: 400 });
  const { data, error } = await auth.supabase.from("gallery_images").update({ title, description, category, is_featured: Boolean(body.is_featured), display_order: Number.isFinite(displayOrder) ? displayOrder : 0 }).eq("id", id).select("id, title, description, category, is_featured, display_order").single();
  if (error) return NextResponse.json({ error: "Unable to update this gallery album." }, { status: 500 });
  return NextResponse.json({ album: data });
}

export async function DELETE(request: Request) {
  const auth = await getAuthorizedClient();
  if (auth.response) return auth.response;
  const body = await request.json();
  const id = String(body.id ?? "");
  const photoId = String(body.photo_id ?? "");
  if (!id) return NextResponse.json({ error: "Album ID is required." }, { status: 400 });

  if (photoId) {
    if (photoId === id) {
      const { data: nextPhoto, error: nextError } = await auth.supabase.from("gallery_image_photos")
        .select("id, image_url, storage_path, credit, photo_order").eq("album_id", id).order("photo_order", { ascending: true }).limit(1).maybeSingle();
      if (nextError) return NextResponse.json({ error: "Unable to find a replacement cover photo." }, { status: 500 });
      if (!nextPhoto) return NextResponse.json({ error: "An album must contain at least one photo. Delete the entire album if you want to remove its final photo." }, { status: 400 });
      const { data: oldAlbum } = await auth.supabase.from("gallery_images").select("storage_path").eq("id", id).single();
      const { error: promoteError } = await auth.supabase.from("gallery_images").update({ image_url: nextPhoto.image_url, storage_path: nextPhoto.storage_path, credit: nextPhoto.credit }).eq("id", id);
      if (promoteError) return NextResponse.json({ error: "Unable to promote the next photo to the album cover." }, { status: 500 });
      const { error: removeRowError } = await auth.supabase.from("gallery_image_photos").delete().eq("id", nextPhoto.id).eq("album_id", id);
      if (removeRowError) return NextResponse.json({ error: "Cover updated, but the old photo record could not be removed." }, { status: 500 });
      if (oldAlbum?.storage_path) await auth.supabase.storage.from(BUCKET).remove([oldAlbum.storage_path]);
      return NextResponse.json({ success: true });
    }
    const { data: photo, error: findError } = await auth.supabase.from("gallery_image_photos").select("id, storage_path").eq("id", photoId).eq("album_id", id).single();
    if (findError || !photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    const { error } = await auth.supabase.from("gallery_image_photos").delete().eq("id", photoId).eq("album_id", id);
    if (error) return NextResponse.json({ error: "Unable to delete photo record." }, { status: 500 });
    const { error: storageError } = await auth.supabase.storage.from(BUCKET).remove([photo.storage_path]);
    if (storageError) return NextResponse.json({ error: "Photo record deleted, but its stored file could not be removed." }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { data: album, error: albumError } = await auth.supabase.from("gallery_images").select("id, storage_path").eq("id", id).single();
  if (albumError || !album) return NextResponse.json({ error: "Album not found." }, { status: 404 });
  const { data: extras, error: extrasError } = await auth.supabase.from("gallery_image_photos").select("storage_path").eq("album_id", id);
  if (extrasError) return NextResponse.json({ error: "Unable to load album photos for deletion." }, { status: 500 });
  const { error: deleteExtrasError } = await auth.supabase.from("gallery_image_photos").delete().eq("album_id", id);
  if (deleteExtrasError) return NextResponse.json({ error: "Unable to delete album photos." }, { status: 500 });
  const { error: deleteAlbumError } = await auth.supabase.from("gallery_images").delete().eq("id", id);
  if (deleteAlbumError) return NextResponse.json({ error: "Unable to delete album." }, { status: 500 });
  const paths = [album.storage_path, ...(extras ?? []).map((photo) => photo.storage_path)];
  const { error: storageError } = await auth.supabase.storage.from(BUCKET).remove(paths);
  if (storageError) return NextResponse.json({ error: "Album deleted, but one or more stored files could not be removed." }, { status: 500 });
  return NextResponse.json({ success: true });
}
