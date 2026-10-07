import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error("❌ Could not find .env.local. Make sure you are running this from the root of your project.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // A service role key would be better, but anon key works if RLS allows it

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCleanup() {
  console.log("🧹 Starting Supabase Storage Cleanup...");
  
  // 1. Fetch all active photo URLs from the database
  console.log("📦 Fetching all active listings from the database...");
  const { data: listings, error: dbError } = await supabase.from('listings').select('photo_urls');
  
  if (dbError) {
    console.error("❌ Database Error:", dbError.message);
    process.exit(1);
  }

  // Extract all valid file paths currently in use
  const activePaths = new Set();
  for (const listing of listings) {
    if (listing.photo_urls && listing.photo_urls.length > 0) {
      for (const url of listing.photo_urls) {
        const parts = url.split('listing-photos/');
        if (parts.length > 1) {
          activePaths.add(parts[1].split('?')[0]);
        }
      }
    }
  }

  console.log(`✅ Found ${activePaths.size} active listing photos in the database.`);

  // 2. Scan Storage for all files
  console.log("🔍 Scanning Supabase Storage...");
  const { data: folders, error: folderError } = await supabase.storage.from('listing-photos').list();

  if (folderError) {
    console.error("❌ Storage Error:", folderError.message);
    process.exit(1);
  }

  const orphanedFiles = [];
  const manualReview = [];

  for (const folder of folders) {
    // If it's a folder (usually a user ID)
    if (!folder.id) {
      const { data: files, error: fileError } = await supabase.storage.from('listing-photos').list(folder.name);
      
      if (fileError) {
        console.error(`⚠️ Could not list files in folder ${folder.name}:`, fileError.message);
        continue;
      }

      for (const file of files) {
        // Skip hidden files
        if (file.name === '.emptyFolderPlaceholder') continue;
        
        const fullPath = `${folder.name}/${file.name}`;

        // Avatars are tracked differently (in profiles), but they are always named exactly "avatar".
        // We will never delete "avatar" automatically just to be safe.
        if (file.name === 'avatar') {
          continue;
        }

        if (!activePaths.has(fullPath)) {
          orphanedFiles.push(fullPath);
        }
      }
    } else {
      // It's a file at the root level, which shouldn't happen based on our app logic
      manualReview.push(folder.name);
    }
  }

  console.log(`⚠️ Found ${orphanedFiles.length} orphaned files.`);
  
  if (manualReview.length > 0) {
    console.log(`\n🛑 Files requiring manual review (root level files):`);
    manualReview.forEach(f => console.log(` - ${f}`));
  }

  // 3. Delete orphaned files
  if (orphanedFiles.length > 0) {
    console.log(`\n🗑️ Deleting ${orphanedFiles.length} orphaned files...`);
    const { error: deleteError } = await supabase.storage.from('listing-photos').remove(orphanedFiles);

    if (deleteError) {
      console.error("❌ Failed to delete some files:", deleteError.message);
      console.log("📝 Please review the Supabase dashboard manually.");
    } else {
      console.log("✅ Successfully deleted all orphaned files!");
    }
  } else {
    console.log("✨ Storage is clean. No cleanup needed.");
  }

  console.log("🎉 Cleanup complete!");
}

runCleanup();
