// Turbo Automation Agent
// Purpose: Automate repetitive tasks and code generation

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TurboAutomationAgent {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.templatesDir = path.join(__dirname, 'templates');
    this.setupDirectories();
  }

  setupDirectories() {
    // Ensure required directories exist
    const dirs = [
      path.join(this.projectRoot, 'generated'),
      path.join(this.templatesDir, 'components'),
      path.join(this.templatesDir, 'pages'),
      path.join(this.templatesDir, 'contracts')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  generateComponent(name, type = 'default') {
    const template = this.loadTemplate('component', { name, type });
    const filePath = path.join(this.projectRoot, 'src', 'components', `${name}.tsx`);
    this.writeFile(filePath, template);
    console.log(`✅ Generated component: ${name}`);
    return filePath;
  }

  generateContract(name, network = 'ethereum') {
    const template = this.loadTemplate('contract', { name, network });
    const filePath = path.join(this.projectRoot, 'contracts', `${name}.sol`);
    this.writeFile(filePath, template);
    console.log(`✅ Generated contract: ${name}`);
    return filePath;
  }

  runTests() {
    console.log('🚀 Running tests...');
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('✅ Tests passed!');
      return true;
    } catch (error) {
      console.error('❌ Tests failed');
      return false;
    }
  }

  formatCode() {
    console.log('✨ Formatting code...');
    try {
      execSync('npx prettier --write .', { stdio: 'inherit' });
      console.log('✅ Code formatted');
      return true;
    } catch (error) {
      console.error('❌ Code formatting failed');
      return false;
    }
  }

  // Helper methods
  loadTemplate(templateName, variables = {}) {
    const templatePath = path.join(this.templatesDir, `${templateName}.tpl`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    let content = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return content;
  }

  writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
  }
}

// Export singleton instance
module.exports = new TurboAutomationAgent();
