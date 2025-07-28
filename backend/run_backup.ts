import { BlogBackupSystem, defaultConfig } from "./backup_system.ts";

async function main() {
  const args = Deno.args;
  const command = args[0] || "backup";

  const backupSystem = new BlogBackupSystem(defaultConfig);

  try {
    switch (command) {
      case "backup":
      case "full":
        console.log("🔄 Creating comprehensive backup...");
        await backupSystem.createComprehensiveBackup();
        await backupSystem.cleanOldBackups();
        break;

      case "sql":
        console.log("🔄 Exporting blog posts to SQL...");
        await backupSystem.exportBlogPosts();
        break;

      case "json":
        console.log("🔄 Exporting blog posts to JSON...");
        await backupSystem.exportBlogPostsJSON();
        break;

      case "list":
        await backupSystem.listBackups();
        break;

      case "stats":
        const stats = await backupSystem.getBackupStats();
        console.log("\n📊 Backup Statistics:");
        console.log("====================");
        console.log(`Total backups: ${stats.totalBackups}`);
        console.log(`Total size: ${Math.round(stats.totalSize / 1024)}KB`);
        console.log(`Oldest backup: ${stats.oldestBackup || "None"}`);
        console.log(`Newest backup: ${stats.newestBackup || "None"}`);
        break;

      case "clean":
        console.log("🧹 Cleaning old backups...");
        await backupSystem.cleanOldBackups();
        break;

      case "help":
        console.log(`
📚 Blog Backup System - Usage Guide
==================================

Commands:
  backup, full    - Create comprehensive backup (DB + SQL + JSON)
  sql            - Export blog posts to SQL only
  json           - Export blog posts to JSON only
  list           - List all available backups
  stats          - Show backup statistics
  clean          - Clean old backups (keep last 30)
  help           - Show this help message

Examples:
  deno run --allow-read --allow-write --allow-net run_backup.ts backup
  deno run --allow-read --allow-write --allow-net run_backup.ts list
  deno run --allow-read --allow-write --allow-net run_backup.ts stats

Backup Location: ./backups/
        `);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log("Run 'deno run run_backup.ts help' for usage information");
        Deno.exit(1);
    }
  } catch (error) {
    console.error(`❌ Backup failed: ${error.message}`);
    Deno.exit(1);
  } finally {
    backupSystem.close();
  }
}

if (import.meta.main) {
  main();
}
