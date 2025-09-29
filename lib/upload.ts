import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function saveFile(file: File): Promise<string> {

  // get file from browser as binary form
  const bytes = await file.arrayBuffer();

  // convert file from binary form to be node js friendly
  const buffer = Buffer.from(bytes);
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;

  // creates a path string for the file
  const path = join(process.cwd(), 'public/uploads', filename); 
  
  // Save the file
  await writeFile(path, buffer);
  
  // Return the path that will be stored in database
  return `/uploads/${filename}`;
}