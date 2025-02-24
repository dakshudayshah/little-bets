import { useState } from 'react';
import '../styles/ShareButtons.css';

interface ShareButtonsProps {
  betId: string;
  title: string;
}

export const ShareButtons = ({ betId, title }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/bets/${betId}`;
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleMessageShare = () => {
    const url = `sms:?body=${encodeURIComponent(`${title}\n${shareUrl}`)}`;
    window.location.href = url;
  };

  return (
    <div className="share-section">
      <p className="share-title">Share this bet:</p>
      <div className="share-buttons">
        <button 
          onClick={handleCopyLink}
          className="share-button"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button 
          onClick={handleWhatsAppShare}
          className="share-button"
        >
          WhatsApp
        </button>
        <button 
          onClick={handleMessageShare}
          className="share-button"
        >
          Message
        </button>
      </div>
    </div>
  );
}; 