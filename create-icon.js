/* eslint-env node */
const fs = require('fs');
const path = require('path');

// Erstelle einen einfachen orange Fox Icon mit Canvas-ähnlicher Logik
// Oder kopiere an vorhandene Bilder

const sourceIcon = path.join(__dirname, 'assets/images/fox_idle.png');
const iconPath = path.join(__dirname, 'assets/images/icon.png');
const foregroundPath = path.join(__dirname, 'assets/images/android-icon-foreground.png');

try {
  // Kopiere existierendes Fox-Bild als Icon
  if (fs.existsSync(sourceIcon)) {
    fs.copyFileSync(sourceIcon, iconPath);
    console.log('✓ Icon erstellt: ' + iconPath);
    
    fs.copyFileSync(sourceIcon, foregroundPath);
    console.log('✓ Android Foreground Icon erstellt: ' + foregroundPath);
  } else {
    console.error('Quellen-Icon nicht gefunden!');
  }
} catch (err) {
  console.error('Fehler beim Erstellen des Icons:', err.message);
}
