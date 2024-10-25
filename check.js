import fs from 'fs';
import path from 'path';

const directoryPath = path.join(process.cwd(), 'src/components');

const findTranslations = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      return console.error('Unable to scan directory: ' + err);
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        findTranslations(filePath); // Recursively search in subdirectories
      } else if (file.endsWith('.tsx')) {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            return console.error('Error reading file: ' + err);
          }

          const regex = /t\('([^']+)'\)/g;
          let match;
          while ((match = regex.exec(data)) !== null) {
            console.log(`t('${match[1]}')`);
          }
        });
      }
    });
  });
};

findTranslations(directoryPath);
