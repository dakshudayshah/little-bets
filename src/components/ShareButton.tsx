import { useState } from 'react';
import '../styles/ShareButton.css';

interface ShareButtonProps {
  betCode: string;
}

export const ShareButton = ({ betCode }: ShareButtonProps) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/bets/${betCode}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button 
      className={`share-button ${showCopied ? 'copied' : ''}`}
      onClick={handleShare}
      aria-label="Share bet"
    >
      {showCopied ? 'Copied!' : 'Share'}
    </button>
  );
}; 