namespace CollaborativeEditor.Models
{
    /// <summary>
    /// Represents the persisted state of a collaboration room
    /// Stores the Yjs document state as binary data
    /// </summary>
    public class RoomState
    {
        /// <summary>
        /// Unique identifier (Room name)
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Binary Yjs document state (encoded updates)
        /// </summary>
        public byte[] YjsState { get; set; } = Array.Empty<byte>();

        /// <summary>
        /// Last time the room state was updated
        /// </summary>
        public DateTime LastModified { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Optional metadata about the room
        /// </summary>
        public string? Metadata { get; set; }
    }
}
