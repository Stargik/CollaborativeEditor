namespace CollaborativeEditor.Models
{
    public class RoomState
    {
        public string Id { get; set; } = string.Empty;

        public byte[] YjsState { get; set; } = Array.Empty<byte>();

        public DateTime LastModified { get; set; } = DateTime.UtcNow;

        public string? Metadata { get; set; }
    }
}
