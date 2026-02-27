import fs from 'fs';
import path from 'path';

export const documentsDir = path.join(process.cwd(), 'documents');

fs.mkdirSync(documentsDir, { recursive: true });
