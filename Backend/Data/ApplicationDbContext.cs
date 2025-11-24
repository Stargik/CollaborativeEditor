using Microsoft.EntityFrameworkCore;
using CollaborativeEditor.Models;

namespace CollaborativeEditor.Data
{
    /// <summary>
    /// Database context for the collaborative editor
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        /// <summary>
        /// Room states table - stores Yjs document state per room
        /// </summary>
        public DbSet<RoomState> RoomStates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RoomState>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.YjsState).IsRequired();
                entity.Property(e => e.LastModified).IsRequired();
                entity.HasIndex(e => e.LastModified);
            });
        }
    }
}
