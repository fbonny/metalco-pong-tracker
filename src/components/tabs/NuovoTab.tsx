import { useState } from 'react';
import { createPlayer } from '@/lib/database';
import { compressImage } from '@/lib/imageUtils';
import PlayerAvatar from '@/components/PlayerAvatar';
import { toast } from 'sonner';

interface NuovoTabProps {
  onPlayerCreated: () => void;
}

export default function NuovoTab({ onPlayerCreated }: NuovoTabProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [hand, setHand] = useState('N.D.');
  const [shot, setShot] = useState('N.D.');
  const [loading, setLoading] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setAvatar(compressed);
    } catch (error) {
      toast.error('Failed to process image');
      console.error(error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setLoading(true);
    try {
      await createPlayer({
        name: name.trim(),
        avatar: avatar || undefined,
        hand,
        shot,
      });
      
      toast.success('Player created successfully!');
      
      // Reset form
      setName('');
      setAvatar('');
      setHand('N.D.');
      setShot('N.D.');
      
      onPlayerCreated();
    } catch (error) {
      toast.error('Failed to create player');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Add New Player</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview */}
        {(avatar || name) && (
          <div className="flex justify-center">
            <PlayerAvatar name={name || 'Player'} avatar={avatar} size="lg" />
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block font-semibold mb-2">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter player name"
            className="w-full p-3 border-2 border-foreground bg-background"
            required
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block font-semibold mb-2">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full p-3 border-2 border-foreground bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Image will be compressed and resized automatically
          </p>
        </div>

        {/* Hand */}
        <div>
          <label className="block font-semibold mb-2">Hand</label>
          <div className="grid grid-cols-3 gap-2">
            {['Destrorso', 'Mancino', 'N.D.'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setHand(option)}
                className={`py-3 border-2 transition-colors ${
                  hand === option
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-foreground hover:bg-muted'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Shot */}
        <div>
          <label className="block font-semibold mb-2">Shot</label>
          <div className="grid grid-cols-3 gap-2">
            {['Dritto', 'Rovescio', 'N.D.'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setShot(option)}
                className={`py-3 border-2 transition-colors ${
                  shot === option
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-foreground border-foreground hover:bg-muted'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-foreground text-background border-2 border-foreground font-semibold hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Player'}
        </button>
      </form>
    </div>
  );
}
