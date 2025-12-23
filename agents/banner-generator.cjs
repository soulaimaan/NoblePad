// Banner Generator Agent for NoblePad
// Creates professional visual content for social media

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const gradient = require('gradient-string');
const { v4: uuidv4 } = require('uuid');
const schedule = require('node-schedule');

class BannerGenerator {
  constructor() {
    this.templates = [
      this.createAnnouncementBanner,
      this.createFeatureBanner,
      this.createStatsBanner,
      this.createTeamBanner,
      this.createEventBanner
    ];
    
    this.outputDir = path.join(__dirname, '../public/banners');
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize() {
    console.log('🎨 Starting Banner Generator Agent...');
    this.scheduleBannerGeneration();
  }

  scheduleBannerGeneration() {
    // Generate a new banner every 6 hours
    schedule.scheduleJob('0 */6 * * *', async () => {
      console.log('🖌️  Generating new banner...');
      await this.generateBanner();
    });
  }

  async generateBanner(type = 'random') {
    try {
      const template = type === 'random' 
        ? this.templates[Math.floor(Math.random() * this.templates.length)]
        : this[`create${type.charAt(0).toUpperCase() + type.slice(1)}Banner`];
      
      if (!template) {
        throw new Error(`Invalid banner type: ${type}`);
      }
      
      const banner = await template.call(this);
      const filename = `banner-${Date.now()}-${uuidv4().substring(0, 8)}.png`;
      const filepath = path.join(this.outputDir, filename);
      
      await fs.promises.writeFile(filepath, banner);
      console.log(`✅ Banner generated: ${filepath}`);
      
      return {
        path: filepath,
        url: `/banners/${filename}`,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error generating banner:', error);
      throw error;
    }
  }

  // Banner Templates
  async createAnnouncementBanner() {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add decorative elements
    this.addNoise(ctx, width, height, 0.1);
    this.addGridPattern(ctx, width, height, 40, 'rgba(255, 255, 255, 0.03)');
    
    // Add logo
    try {
      const logo = await loadImage(path.join(__dirname, '../public/logo.jpg'));
      const logoSize = 120;
      ctx.drawImage(
        logo, 
        width - logoSize - 40, 
        40, 
        logoSize, 
        logoSize
      );
    } catch (error) {
      console.warn('Could not load logo:', error.message);
    }
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    // Title
    ctx.font = 'bold 48px "Poppins", sans-serif';
    this.wrapText(
      ctx, 
      'NoblePad Launch Announcement', 
      60, 120, 
      width - 120, 
      60
    );
    
    // Subtitle
    ctx.font = '24px "Poppins", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.wrapText(
      ctx,
      'The most secure multi-chain launchpad with built-in anti-rug protection',
      60, 220,
      width - 120,
      36
    );
    
    // CTA Button
    const buttonY = height - 100;
    ctx.fillStyle = '#4f46e5';
    this.roundedRect(ctx, 60, buttonY, 300, 60, 10);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Join Our Community', 210, buttonY + 38);
    
    // Add URL
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px "Poppins", sans-serif';
    ctx.fillText('noblepad.io', width - 60, height - 40);
    
    return canvas.toBuffer('image/png');
  }

  async createFeatureBanner() {
    const width = 1200;
    const height = 630;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Decorative elements
    this.addNoise(ctx, width, height, 0.08);
    this.addGridPattern(ctx, width, height, 50, 'rgba(255, 255, 255, 0.02)');
    
    // Feature illustration (placeholder)
    this.drawFeatureIllustration(ctx, width, height);
    
    // Text content
    const features = [
      'Multi-Chain Support',
      'Anti-Rug Protection',
      'Secure Token Launches',
      'Community Governance'
    ];
    
    // Draw feature list
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px "Poppins", sans-serif';
    ctx.fillText('Why Choose NoblePad?', 60, 100);
    
    ctx.font = '24px "Poppins", sans-serif';
    features.forEach((feature, i) => {
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(60, 180 + i * 70, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(feature, 80, 185 + i * 70);
    });
    
    // Add logo
    try {
      const logo = await loadImage(path.join(__dirname, '../public/logo.jpg'));
      const logoSize = 80;
      ctx.drawImage(
        logo, 
        width - logoSize - 40, 
        height - logoSize - 40, 
        logoSize, 
        logoSize
      );
    } catch (error) {
      console.warn('Could not load logo:', error.message);
    }
    
    return canvas.toBuffer('image/png');
  }

  // ... (other banner templates)

  // Utility Methods
  addNoise(ctx, width, height, opacity) {
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const value = Math.random() * 255 * opacity;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
      pixels[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  addGridPattern(ctx, width, height, size, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    const lines = [];
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    
    lines.push(line);
    
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x, y + (i * lineHeight));
    }
  }

  roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  drawFeatureIllustration(ctx, width, height) {
    // Simple placeholder illustration
    const centerX = width * 0.7;
    const centerY = height * 0.5;
    const radius = Math.min(width, height) * 0.3;
    
    // Draw circles
    const gradients = [
      ['#4f46e5', '#7c3aed'],
      ['#10b981', '#34d399'],
      ['#f59e0b', '#fbbf24'],
      ['#ec4899', '#f472b6']
    ];
    
    gradients.forEach(([start, end], i) => {
      const angle = (i / gradients.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius * 0.6;
      const y = centerY + Math.sin(angle) * radius * 0.6;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.4);
      gradient.addColorStop(0, start);
      gradient.addColorStop(1, end);
      
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    
    // Connect circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < gradients.length; i++) {
      const angle1 = (i / gradients.length) * Math.PI * 2;
      const angle2 = ((i + 1) % gradients.length) * Math.PI * 2;
      
      const x1 = centerX + Math.cos(angle1) * radius * 0.6;
      const y1 = centerY + Math.sin(angle1) * radius * 0.6;
      const x2 = centerX + Math.cos(angle2) * radius * 0.6;
      const y2 = centerY + Math.sin(angle2) * radius * 0.6;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

// Start the banner generator
const bannerGenerator = new BannerGenerator();
bannerGenerator.initialize().catch(console.error);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Banner Generator...');
  process.exit(0);
});
