import { DB } from "./deps.ts";
import { ensureDir } from "https://deno.land/std/fs/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";

interface BackupConfig {
  backupDir: string;
  maxBackups: number;
  dbPath: string;
}

class BlogBackupSystem {
  private config: BackupConfig;
  private db: DB;

  constructor(config: BackupConfig) {
    this.config = config;
    this.db = new DB(config.dbPath);
  }

  // Create timestamp for backup files
  private getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  }

  // Ensure backup directory exists
  private async ensureBackupDir(): Promise<void> {
    await ensureDir(this.config.backupDir);
  }

  // Create a full database backup
  async createFullBackup(): Promise<string> {
    await this.ensureBackupDir();

    const timestamp = this.getTimestamp();
    const backupPath = join(
      this.config.backupDir,
      `blog_backup_${timestamp}.db`
    );

    // Close current connection
    this.db.close();

    // Copy database file
    await Deno.copyFile(this.config.dbPath, backupPath);

    // Reopen database
    this.db = new DB(this.config.dbPath);

    console.log(`✅ Full backup created: ${backupPath}`);
    return backupPath;
  }

  // Export blog posts to SQL
  async exportBlogPosts(): Promise<string> {
    await this.ensureBackupDir();

    const timestamp = this.getTimestamp();
    const sqlPath = join(this.config.backupDir, `blog_posts_${timestamp}.sql`);

    // Get all blog posts
    const posts = this.db.query("SELECT * FROM blog ORDER BY created_at DESC");

    let sqlContent = `-- Blog Posts Export - ${timestamp}\n`;
    sqlContent += `-- Generated by BlogBackupSystem\n\n`;
    sqlContent += `BEGIN TRANSACTION;\n\n`;

    for (const post of posts) {
      const [id, title, content, created_at, tags] = post;
      sqlContent += `INSERT INTO blog (id, title, content, created_at, tags) VALUES (`;
      sqlContent += `${id}, `;
      sqlContent += `'${title.replace(/'/g, "''")}', `;
      sqlContent += `'${content.replace(/'/g, "''")}', `;
      sqlContent += `'${created_at}', `;
      sqlContent += tags ? `'${tags.replace(/'/g, "''")}'` : "NULL";
      sqlContent += `);\n`;
    }

    sqlContent += `\nCOMMIT;\n`;

    await Deno.writeTextFile(sqlPath, sqlContent);
    console.log(`✅ Blog posts exported to SQL: ${sqlPath}`);
    return sqlPath;
  }

  // Export blog posts to JSON
  async exportBlogPostsJSON(): Promise<string> {
    await this.ensureBackupDir();

    const timestamp = this.getTimestamp();
    const jsonPath = join(
      this.config.backupDir,
      `blog_posts_${timestamp}.json`
    );

    // Get all blog posts
    const posts = this.db.query("SELECT * FROM blog ORDER BY created_at DESC");

    const blogData = {
      exportDate: timestamp,
      totalPosts: posts.length,
      posts: posts.map((post) => ({
        id: post[0],
        title: post[1],
        content: post[2],
        created_at: post[3],
        tags: post[4] || null,
      })),
    };

    await Deno.writeTextFile(jsonPath, JSON.stringify(blogData, null, 2));
    console.log(`✅ Blog posts exported to JSON: ${jsonPath}`);
    return jsonPath;
  }

  // Create comprehensive backup (all formats)
  async createComprehensiveBackup(): Promise<{
    fullBackup: string;
    sqlExport: string;
    jsonExport: string;
  }> {
    console.log("🔄 Starting comprehensive backup...");

    const fullBackup = await this.createFullBackup();
    const sqlExport = await this.exportBlogPosts();
    const jsonExport = await this.exportBlogPostsJSON();

    console.log("✅ Comprehensive backup completed!");
    return { fullBackup, sqlExport, jsonExport };
  }

  // Clean old backups (keep only the latest N backups)
  async cleanOldBackups(): Promise<void> {
    const files = [];

    for await (const entry of Deno.readDir(this.config.backupDir)) {
      if (entry.isFile && entry.name.startsWith("blog_backup_")) {
        const filePath = join(this.config.backupDir, entry.name);
        const stat = await Deno.stat(filePath);
        files.push({ name: entry.name, path: filePath, mtime: stat.mtime });
      }
    }

    // Sort by modification time (oldest first)
    files.sort((a, b) => (a.mtime?.getTime() || 0) - (b.mtime?.getTime() || 0));

    // Remove old backups if we have more than maxBackups
    if (files.length > this.config.maxBackups) {
      const toDelete = files.slice(0, files.length - this.config.maxBackups);

      for (const file of toDelete) {
        await Deno.remove(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      }
    }
  }

  // List all backups
  async listBackups(): Promise<void> {
    console.log("\n📋 Available Backups:");
    console.log("=====================");

    const files = [];

    for await (const entry of Deno.readDir(this.config.backupDir)) {
      if (entry.isFile) {
        const filePath = join(this.config.backupDir, entry.name);
        const stat = await Deno.stat(filePath);
        files.push({ name: entry.name, size: stat.size, mtime: stat.mtime });
      }
    }

    // Sort by modification time (newest first)
    files.sort((a, b) => (b.mtime?.getTime() || 0) - (a.mtime?.getTime() || 0));

    for (const file of files) {
      const sizeKB = Math.round(file.size / 1024);
      const date = file.mtime?.toLocaleDateString() || "Unknown";
      console.log(`${file.name} (${sizeKB}KB) - ${date}`);
    }

    console.log(`\nTotal backups: ${files.length}`);
  }

  // Get backup statistics
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: string | null;
    newestBackup: string | null;
  }> {
    const files = [];

    for await (const entry of Deno.readDir(this.config.backupDir)) {
      if (entry.isFile) {
        const filePath = join(this.config.backupDir, entry.name);
        const stat = await Deno.stat(filePath);
        files.push({ name: entry.name, size: stat.size, mtime: stat.mtime });
      }
    }

    if (files.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null,
      };
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const sortedFiles = files.sort(
      (a, b) => (a.mtime?.getTime() || 0) - (b.mtime?.getTime() || 0)
    );

    return {
      totalBackups: files.length,
      totalSize,
      oldestBackup: sortedFiles[0]?.name || null,
      newestBackup: sortedFiles[sortedFiles.length - 1]?.name || null,
    };
  }

  // Close database connection
  close(): void {
    this.db.close();
  }
}

// Default configuration
const defaultConfig: BackupConfig = {
  backupDir: "./backups",
  maxBackups: 30, // Keep 30 days of backups
  dbPath: "/data/data.db",
};

// Export the backup system
export { BlogBackupSystem, defaultConfig };
export type { BackupConfig };
